import { Response } from 'express';
import { BookingModel } from '../models/booking.model.js';
import { VehicleModel } from '../models/vehicle.model.js';
import { AuthenticatedRequest } from '../middlewares/security.middleware.js';
import { refreshAllVehicleStatuses, sanitizeDoc } from '../services/booking.service.js';
import { buildBookingsExcel } from '../services/excel.service.js';
import { buildBookingsPdfAbstract } from '../services/pdf-report.service.js';

export async function getAnalytics(_req: AuthenticatedRequest, res: Response) {
  try {
    // Fire-and-forget background status refresh so response is instantaneous
    refreshAllVehicleStatuses().catch(() => {});

    let totalRevenue = 0.0;
    let active = 0;

    const nowUtc = new Date();
    const monthBuckets: Record<string, number> = {};

    for (let i = 5; i >= 0; i--) {
      let mYear = nowUtc.getUTCFullYear();
      let mMonth = nowUtc.getUTCMonth() + 1 - i;
      while (mMonth <= 0) {
        mMonth += 12;
        mYear -= 1;
      }
      const mKey = `${mYear.toString().padStart(4, '0')}-${mMonth.toString().padStart(2, '0')}`;
      monthBuckets[mKey] = 0.0;
    }

    const [
      totalBookingsCount,
      bookings,
      fleetTotalCount,
      fleetAvailableCount,
      fleetBookedCount,
      recentDocs,
    ] = await Promise.all([
      BookingModel.countDocuments({}).catch(() => 0),
      BookingModel.find(
        {},
        {
          id: 1,
          booking_no: 1,
          total_amount: 1,
          payment_status: 1,
          source: 1,
          status: 1,
          created_at: 1,
          start_date: 1,
          end_date: 1,
          customer: 1,
          vehicle_snapshot: 1,
        }
      )
        .lean()
        .catch(() => []),
      VehicleModel.countDocuments({}).catch(() => 28),
      VehicleModel.countDocuments({ status: 'Available' }).catch(() => 28),
      VehicleModel.countDocuments({ status: 'Booked' }).catch(() => 0),
      BookingModel.find({}).sort({ created_at: -1 }).limit(10).lean().catch(() => []),
    ]);

    const totalBookings = Math.max(totalBookingsCount, bookings.length);
    const fleetTotal = fleetTotalCount > 0 ? fleetTotalCount : 28;
    const fleetAvailable = fleetAvailableCount;
    const fleetBooked = fleetBookedCount;

    for (const bk of bookings) {
      const amt = Number(bk.total_amount || 0);
      if (
        bk.payment_status === 'Paid' ||
        bk.source === 'Offline' ||
        bk.status === 'Confirmed' ||
        bk.status === 'Completed'
      ) {
        totalRevenue += amt;
      }
      if (bk.status === 'Confirmed') {
        active += 1;
      }

      const created = bk.created_at || '';
      const monthKey = created.length >= 7 ? created.slice(0, 7) : nowUtc.toISOString().slice(0, 7);
      if (monthBuckets[monthKey] !== undefined) {
        monthBuckets[monthKey] += amt;
      }
    }

    let fleetUtilizationPct = 0.0;
    if (fleetTotal > 0) {
      fleetUtilizationPct = Math.round((fleetBooked / fleetTotal) * 1000) / 10;
    }

    const recent = (recentDocs || []).map((d) => sanitizeDoc(d));

    const monthlySeries = Object.keys(monthBuckets)
      .sort()
      .map((m) => ({
        month: m,
        revenue: Math.round((monthBuckets[m] || 0) * 100) / 100,
      }));

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyFleetBookings = weekDays.map((day) => ({ day, vehicles: 0 }));

    const startOfWeek = new Date(nowUtc);
    startOfWeek.setUTCDate(nowUtc.getUTCDate() - nowUtc.getUTCDay());
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 86400000);

    let currentWeekTotalBookings = 0;
    let peakCount = 0;
    let peakDayIdx = -1;

    for (const bk of bookings) {
      try {
        if (!bk.start_date || !bk.end_date) continue;
        const s = new Date(bk.start_date);
        const e = new Date(bk.end_date);
        if (isNaN(s.getTime()) || isNaN(e.getTime())) continue;
        if (e < startOfWeek || s >= endOfWeek) continue;

        currentWeekTotalBookings++;
        for (let d = 0; d < 7; d++) {
          const dayStart = new Date(startOfWeek.getTime() + d * 86400000);
          const dayEnd = new Date(dayStart.getTime() + 86400000);
          if (s < dayEnd && e >= dayStart) {
            weeklyFleetBookings[d].vehicles++;
          }
        }
      } catch {
        continue;
      }
    }

    weeklyFleetBookings.forEach((wb, idx) => {
      if (wb.vehicles > peakCount) {
        peakCount = wb.vehicles;
        peakDayIdx = idx;
      }
    });

    const weeklyChartData = weeklyFleetBookings.map((wb, idx) => ({
      day: wb.day,
      vehicles: wb.vehicles,
      active: idx === nowUtc.getUTCDay(),
      peak: idx === peakDayIdx && peakCount > 0,
    }));

    return res.json({
      total_bookings: totalBookings,
      total_revenue: Math.round(totalRevenue * 100) / 100,
      active_bookings: active,
      available_vehicles: fleetAvailable,
      total_vehicles: fleetTotal,
      fleet_available: fleetAvailable,
      fleet_booked: fleetBooked,
      fleet_utilization_pct: fleetUtilizationPct,
      occupancy_rate: fleetUtilizationPct,
      monthly_revenue: monthlySeries,
      revenue_by_month: monthlySeries,
      weekly_fleet_bookings: weeklyChartData,
      weekly_total_cars: currentWeekTotalBookings,
      peak_day: peakDayIdx >= 0 ? weekDays[peakDayIdx] : 'N/A',
      peak_vehicles: peakCount,
      recent_bookings: recent,
    });
  } catch (_err: any) {
    return res.json({
      total_bookings: 0,
      total_revenue: 0,
      active_bookings: 0,
      available_vehicles: 28,
      total_vehicles: 28,
      fleet_available: 28,
      fleet_booked: 0,
      fleet_utilization_pct: 0,
      occupancy_rate: 0,
      monthly_revenue: [],
      revenue_by_month: [],
      weekly_fleet_bookings: [],
      weekly_total_cars: 0,
      peak_day: 'N/A',
      peak_vehicles: 0,
      recent_bookings: [],
    });
  }
}

export async function exportBookingsExcel(_req: AuthenticatedRequest, res: Response) {
  try {
    let docs: any[] = [];
    try {
      docs = await BookingModel.find({}).sort({ created_at: -1 }).limit(5000).lean();
    } catch {}
    const xlsxBuffer = await buildBookingsExcel(docs);
    const ts = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 15);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="cab_castle_bookings_${ts}.xlsx"`);
    return res.send(xlsxBuffer);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to export bookings excel' });
  }
}

export async function exportBookingsPdf(_req: AuthenticatedRequest, res: Response) {
  try {
    let docs: any[] = [];
    try {
      docs = await BookingModel.find({}).sort({ created_at: -1 }).limit(5000).lean();
    } catch {}
    const pdfBuffer = await buildBookingsPdfAbstract(docs);
    const ts = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 15);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Cab_Castle_Goa_Bookings_Abstract_${ts}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to export bookings PDF abstract' });
  }
}

