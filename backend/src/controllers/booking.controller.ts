import { Request, Response } from 'express';
import crypto, { randomUUID } from 'node:crypto';
import { VehicleModel } from '../models/vehicle.model.js';
import { BookingModel } from '../models/booking.model.js';
import { AuthenticatedRequest } from '../middlewares/security.middleware.js';
import {
  calcFare,
  checkVehicleAvailable,
  refreshVehicleStatus,
  sendEmailWithAttachment,
  computeDays,
  nowIso,
  sanitizeDoc,
  escapeRegex,
} from '../services/booking.service.js';
import { buildInvoicePdf } from '../services/pdf.service.js';
import { renderInvoiceHtml } from '../services/html-invoice.service.js';

function formatDateYYMMDD(date: Date): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

// Mutex map for active reservation locks per vehicle
const reservationLocks = new Map<string, Promise<any>>();

export async function withVehicleLock<T>(vehicleId: string, fn: () => Promise<T>): Promise<T> {
  while (reservationLocks.has(vehicleId)) {
    try {
      await reservationLocks.get(vehicleId);
    } catch {}
  }
  let resolveLock!: () => void;
  const lockPromise = new Promise<void>((resolve) => {
    resolveLock = resolve;
  });
  reservationLocks.set(vehicleId, lockPromise);
  try {
    return await fn();
  } finally {
    reservationLocks.delete(vehicleId);
    resolveLock();
  }
}

export async function calculateQuote(req: Request, res: Response) {
  try {
    const { vehicle_id, start_date, end_date, add_ons, airport_pickup, coupon_code, transmission_choice } = req.body;
    if (new Date(end_date).getTime() <= new Date(start_date).getTime()) {
      return res.status(400).json({ detail: 'Drop-off date and time must be after pickup date and time (minimum 24-hour rental cycle).' });
    }
    const vehicle = (await VehicleModel.findOne({ id: vehicle_id, is_deleted: { $ne: true } }).lean()) as any;
    if (!vehicle) {
      return res.status(404).json({ detail: 'Vehicle not found' });
    }

    const fare = await calcFare(vehicle, start_date, end_date, add_ons || {}, !!airport_pickup, coupon_code, transmission_choice);
    return res.json({ vehicle: sanitizeDoc(vehicle), ...fare });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to calculate quote' });
  }
}

export async function createBooking(req: Request, res: Response) {
  try {
    const { vehicle_id, customer, start_date, end_date, pickup_location, airport_pickup, add_ons, coupon_code, transmission_choice } = req.body;
    if (new Date(end_date).getTime() <= new Date(start_date).getTime()) {
      return res.status(400).json({ detail: 'Drop-off date and time must be after pickup date and time (minimum 24-hour rental cycle).' });
    }
    const vehicle = (await VehicleModel.findOne({ id: vehicle_id, is_deleted: { $ne: true } }).lean()) as any;
    if (!vehicle) {
      return res.status(404).json({ detail: 'Vehicle not found' });
    }

    return await withVehicleLock(vehicle.id, async () => {
      const available = await checkVehicleAvailable(vehicle.id, start_date, end_date);
      if (!available) {
        return res.status(400).json({ detail: 'This vehicle is already booked for the selected date range.' });
      }

      const fare = await calcFare(vehicle, start_date, end_date, add_ons || {}, !!airport_pickup, coupon_code, transmission_choice);
      const datePrefix = formatDateYYMMDD(new Date());
      const randHex = crypto.randomBytes(3).toString('hex').toUpperCase();
      const bookingNo = `DHG-${datePrefix}-${randHex}`;

      const booking = new BookingModel({
        id: randomUUID(),
        booking_no: bookingNo,
        vehicle_id: vehicle.id,
        vehicle_snapshot: {
          title: vehicle.title,
          reg_no: vehicle.reg_no,
          category: vehicle.category,
          image_url: vehicle.image_url,
        },
        customer,
        start_date,
        end_date,
        days: fare.days,
        pickup_location,
        airport_pickup: !!airport_pickup,
        airport_surcharge: fare.airport_surcharge,
        add_ons: add_ons || { helmets: 0, infant_seat: false, airport_pickup: false },
        addon_amount: fare.addon_amount,
        base_amount: fare.base_amount,
        discount: fare.discount,
        coupon_code: fare.coupon_code,
        tax: fare.tax,
        total_amount: fare.total_amount,
        payment_status: 'Pending',
        payment_method: 'Razorpay',
        razorpay_order_id: null,
        razorpay_payment_id: null,
        razorpay_signature: null,
        source: 'Online',
        status: 'Confirmed',
        created_at: nowIso(),
      });

      await booking.save();
      await refreshVehicleStatus(vehicle.id);
      return res.json(sanitizeDoc(booking.toObject()));
    });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to create booking' });
  }
}

export async function getBookingById(req: Request, res: Response) {
  try {
    const b = await BookingModel.findOne({ id: req.params.booking_id }).lean();
    if (!b) {
      return res.status(404).json({ detail: 'Booking not found' });
    }
    return res.json(sanitizeDoc(b));
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to get booking' });
  }
}

export async function searchCustomerBookings(req: Request, res: Response) {
  try {
    const q = String(req.query.q || req.query.phone || req.query.email || '').trim();
    if (!q || q.length < 3) {
      return res.json([]);
    }

    const escapedQ = escapeRegex(q);
    const query = {
      $or: [
        { 'customer.email': { $regex: escapedQ, $options: 'i' } },
        { 'customer.phone': { $regex: escapedQ, $options: 'i' } },
        { booking_no: { $regex: escapedQ, $options: 'i' } },
        { id: q },
      ],
    };

    const docs = await BookingModel.find(query).sort({ created_at: -1 }).limit(50).lean();
    const result: any[] = [];
    for (const doc of docs) {
      const sanitized = sanitizeDoc(doc);
      if (!sanitized.vehicle && sanitized.vehicle_id) {
        const v = await VehicleModel.findOne({ id: sanitized.vehicle_id }).lean();
        if (v) {
          sanitized.vehicle = sanitizeDoc(v);
        }
      }
      result.push(sanitized);
    }
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Search failed' });
  }
}

export async function listAdminBookings(req: AuthenticatedRequest, res: Response) {
  try {
    const { q, status_filter, source } = req.query;
    const query: any = {};

    if (status_filter && status_filter !== 'All') {
      query.status = String(status_filter);
    }
    if (source && source !== 'All') {
      query.source = String(source);
    }
    if (q) {
      const qStr = escapeRegex(String(q).trim());
      query.$or = [
        { 'customer.name': { $regex: qStr, $options: 'i' } },
        { 'customer.phone': { $regex: qStr, $options: 'i' } },
        { 'vehicle_snapshot.title': { $regex: qStr, $options: 'i' } },
        { booking_no: { $regex: qStr, $options: 'i' } },
      ];
    }

    const docs = await BookingModel.find(query).sort({ created_at: -1 }).limit(1000).lean();
    return res.json(docs.map((d) => sanitizeDoc(d)));
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to list admin bookings' });
  }
}

export async function createOfflineBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const { vehicle_id, customer, start_date, end_date, pickup_location, total_amount, payment_method, payment_status, notes } = req.body;
    const vehicle = (await VehicleModel.findOne({ id: vehicle_id }).lean()) as any;
    if (!vehicle) {
      return res.status(404).json({ detail: 'Vehicle not found' });
    }

    const available = await checkVehicleAvailable(vehicle.id, start_date, end_date);
    if (!available) {
      return res.status(400).json({ detail: 'This vehicle is already booked for the selected date range.' });
    }

    const days = computeDays(start_date, end_date);
    const datePrefix = formatDateYYMMDD(new Date());
    const randHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const bookingNo = `DHG-OFF-${datePrefix}-${randHex}`;

    const customerData = (customer && typeof customer === 'object') ? customer : {
      name: req.body.customer_name || 'Walk-in Customer',
      phone: req.body.customer_phone || '',
      email: req.body.customer_email || '',
    };

    const calculatedBase = vehicle.daily_rate * days;
    const finalTotal = Number(total_amount) > 0 ? Number(total_amount) : calculatedBase;

    const booking = new BookingModel({
      id: randomUUID(),
      booking_no: bookingNo,
      vehicle_id: vehicle.id,
      vehicle_snapshot: {
        title: vehicle.title,
        reg_no: vehicle.reg_no,
        category: vehicle.category,
        image_url: vehicle.image_url,
      },
      customer: customerData,
      start_date,
      end_date,
      days,
      pickup_location: pickup_location || 'Candolim (Main Hub)',
      airport_pickup: false,
      airport_surcharge: 0.0,
      add_ons: { helmets: 0, infant_seat: false, airport_pickup: false },
      addon_amount: 0.0,
      base_amount: calculatedBase,
      discount: 0.0,
      coupon_code: null,
      tax: 0.0,
      total_amount: finalTotal,
      payment_status: payment_status || 'Paid',
      payment_method: payment_method || 'Cash',
      razorpay_order_id: null,
      razorpay_payment_id: null,
      razorpay_signature: null,
      source: 'Offline',
      status: 'Confirmed',
      notes: notes || '',
      created_at: nowIso(),
    });

    await booking.save();
    await refreshVehicleStatus(vehicle.id);
    return res.json(sanitizeDoc(booking.toObject()));
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to create offline booking' });
  }
}

export async function updateBookingStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { status } = req.body;
    const existing = await BookingModel.findOne({ id: req.params.booking_id }).lean();
    if (!existing) {
      return res.status(404).json({ detail: 'Not found' });
    }
    await BookingModel.updateOne({ id: req.params.booking_id }, { $set: { status } });
    await refreshVehicleStatus(existing.vehicle_id);
    const updated = await BookingModel.findOne({ id: req.params.booking_id }).lean();
    return res.json(sanitizeDoc(updated));
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to update booking status' });
  }
}

export async function rescheduleBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const { new_start_date } = req.body;
    const b = await BookingModel.findOne({ id: req.params.booking_id });
    if (!b) {
      return res.status(404).json({ detail: 'Booking not found' });
    }

    // Strict IDOR Ownership Check
    if (req.user && req.user.role !== 'admin') {
      const isOwner =
        (req.user.email && b.customer?.email && req.user.email.toLowerCase() === b.customer.email.toLowerCase()) ||
        (req.user.phone && b.customer?.phone && req.user.phone === b.customer.phone);

      if (!isOwner) {
        return res.status(403).json({ detail: 'Access denied: You do not own this booking' });
      }
    }

    const targetDate = new Date(new_start_date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ detail: 'Invalid date. Use YYYY-MM-DD' });
    }

    const oldStart = new Date(b.start_date);
    const oldEnd = new Date(b.end_date);
    if (isNaN(oldStart.getTime()) || isNaN(oldEnd.getTime())) {
      return res.status(400).json({ detail: 'Booking has invalid dates' });
    }

    const durationMs = oldEnd.getTime() - oldStart.getTime();

    const newStart = new Date(
      Date.UTC(
        targetDate.getUTCFullYear(),
        targetDate.getUTCMonth(),
        targetDate.getUTCDate(),
        oldStart.getUTCHours(),
        oldStart.getUTCMinutes(),
        oldStart.getUTCSeconds()
      )
    );
    const newEnd = new Date(newStart.getTime() + durationMs);

    b.start_date = newStart.toISOString();
    b.end_date = newEnd.toISOString();
    await b.save();

    await refreshVehicleStatus(b.vehicle_id);
    return res.json(sanitizeDoc(b.toObject()));
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to reschedule booking' });
  }
}

export async function cancelBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const { reason } = req.body;
    const b = await BookingModel.findOne({ id: req.params.booking_id });
    if (!b) {
      return res.status(404).json({ detail: 'Booking not found' });
    }

    // Strict IDOR Ownership Check
    if (req.user && req.user.role !== 'admin') {
      const isOwner =
        (req.user.email && b.customer?.email && req.user.email.toLowerCase() === b.customer.email.toLowerCase()) ||
        (req.user.phone && b.customer?.phone && req.user.phone === b.customer.phone);

      if (!isOwner) {
        return res.status(403).json({ detail: 'Access denied: You do not own this booking' });
      }
    }

    if (b.status === 'Cancelled') {
      return res.status(400).json({ detail: 'Booking is already cancelled' });
    }

    b.status = 'Cancelled';
    b.notes = (b.notes ? b.notes + ' | ' : '') + `Cancelled on ${nowIso()}. Reason: ${reason || 'Customer request'}`;
    await b.save();
    await refreshVehicleStatus(b.vehicle_id);

    return res.json({
      ok: true,
      message: 'Booking successfully cancelled in accordance with cancellation policy',
      booking: sanitizeDoc(b.toObject()),
    });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to cancel booking' });
  }
}

export async function getCalendarSummary(req: AuthenticatedRequest, res: Response) {
  try {
    const now = new Date();
    const year = parseInt(String(req.query.year || now.getFullYear()), 10);
    const month = parseInt(String(req.query.month || (now.getMonth() + 1)), 10);

    if (isNaN(month) || month < 1 || month > 12 || isNaN(year)) {
      return res.status(400).json({ detail: 'Invalid month' });
    }

    const mStart = new Date(Date.UTC(year, month - 1, 1));
    const mEnd = month === 12 ? new Date(Date.UTC(year + 1, 0, 1)) : new Date(Date.UTC(year, month, 1));
    const mStartIso = mStart.toISOString();
    const mEndIso = mEnd.toISOString();

    const summary: Record<string, any> = {};
    const bookings = await BookingModel.find({
      start_date: { $lt: mEndIso },
      end_date: { $gte: mStartIso },
      is_deleted: { $ne: true },
    })
      .select('start_date end_date status source total_amount days')
      .lean();

    for (const b of bookings) {
      try {
        const s = new Date(b.start_date);
        const e = new Date(b.end_date);
        if (isNaN(s.getTime()) || isNaN(e.getTime())) continue;
        if (e < mStart || s >= mEnd) continue;

        const curDate = new Date(Math.max(s.getTime(), mStart.getTime()));
        const lastDate = new Date(Math.min(e.getTime(), mEnd.getTime() - 1000));

        const sDateStr = s.toISOString().slice(0, 10);
        const eDateStr = e.toISOString().slice(0, 10);

        const curIter = new Date(Date.UTC(curDate.getUTCFullYear(), curDate.getUTCMonth(), curDate.getUTCDate()));
        const endIter = new Date(Date.UTC(lastDate.getUTCFullYear(), lastDate.getUTCMonth(), lastDate.getUTCDate()));

        while (curIter <= endIter) {
          const key = curIter.toISOString().slice(0, 10);
          if (!summary[key]) {
            summary[key] = {
              total: 0,
              Confirmed: 0,
              Completed: 0,
              Cancelled: 0,
              Online: 0,
              Offline: 0,
              revenue: 0.0,
              pickups: 0,
              returns: 0,
            };
          }
          const slot = summary[key];
          slot.total += 1;
          const statusKey = b.status || 'Confirmed';
          slot[statusKey] = (slot[statusKey] || 0) + 1;
          const sourceKey = b.source || 'Online';
          slot[sourceKey] = (slot[sourceKey] || 0) + 1;
          slot.revenue += Number(b.total_amount || 0) / Math.max(1, b.days || 1);

          if (key === sDateStr) slot.pickups += 1;
          if (key === eDateStr) slot.returns += 1;

          curIter.setUTCDate(curIter.getUTCDate() + 1);
        }
      } catch {
        continue;
      }
    }

    return res.json(summary);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to get calendar summary' });
  }
}

export async function getBookingsByDate(req: AuthenticatedRequest, res: Response) {
  try {
    const dateStr = String(req.query.date || '').slice(0, 10);
    const targetDt = new Date(dateStr);
    if (isNaN(targetDt.getTime())) {
      return res.status(400).json({ detail: 'Invalid date. Use YYYY-MM-DD' });
    }

    const dayStart = new Date(Date.UTC(targetDt.getUTCFullYear(), targetDt.getUTCMonth(), targetDt.getUTCDate()));
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    const dayStartIso = dayStart.toISOString();
    const dayEndIso = dayEnd.toISOString();

    const docs = await BookingModel.find({
      start_date: { $lt: dayEndIso },
      end_date: { $gte: dayStartIso },
      is_deleted: { $ne: true },
    })
      .sort({ created_at: -1 })
      .lean();
    const matches: any[] = [];
    let pickupsCount = 0;
    let returnsCount = 0;
    let ongoingCount = 0;

    for (const b of docs) {
      try {
        const s = new Date(b.start_date);
        const e = new Date(b.end_date);
        if (isNaN(s.getTime()) || isNaN(e.getTime())) continue;

        if (s < dayEnd && e >= dayStart) {
          const sStr = b.start_date.slice(0, 10);
          const eStr = b.end_date.slice(0, 10);
          let movementType = '';

          if (sStr === dateStr && eStr === dateStr) {
            movementType = 'same_day';
            pickupsCount += 1;
            returnsCount += 1;
          } else if (sStr === dateStr) {
            movementType = 'pickup';
            pickupsCount += 1;
          } else if (eStr === dateStr) {
            movementType = 'return';
            returnsCount += 1;
          } else {
            movementType = 'ongoing';
            ongoingCount += 1;
          }

          const bCopy = sanitizeDoc(b);
          bCopy.movement_type = movementType;
          matches.push(bCopy);
        }
      } catch {
        continue;
      }
    }

    return res.json({
      date: dateStr,
      count: matches.length,
      pickups_count: pickupsCount,
      returns_count: returnsCount,
      ongoing_count: ongoingCount,
      bookings: matches,
    });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to get bookings by date' });
  }
}

export async function createPaymentOrder(req: Request, res: Response) {
  try {
    const { booking_id } = req.body;
    const b = await BookingModel.findOne({ id: booking_id });
    if (!b) {
      return res.status(404).json({ detail: 'Booking not found' });
    }

    const orderId = `order_mock_${crypto.randomBytes(8).toString('hex')}`;
    b.razorpay_order_id = orderId;
    await b.save();

    return res.json({
      order_id: orderId,
      amount: Math.round(b.total_amount * 100),
      currency: 'INR',
      key_id: 'rzp_test_mock_cabcastlegoa',
      booking_no: b.booking_no,
    });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to create payment order' });
  }
}

export async function verifyPayment(req: Request, res: Response) {
  try {
    const booking_id = req.body.booking_id || req.params.booking_id;
    const { razorpay_payment_id, razorpay_signature } = req.body;
    const b = await BookingModel.findOne({ id: booking_id });
    if (!b) {
      return res.status(404).json({ detail: 'Booking not found' });
    }
    if (!razorpay_signature || !razorpay_payment_id) {
      return res.status(400).json({ detail: 'Invalid signature' });
    }

    b.razorpay_payment_id = razorpay_payment_id;
    b.razorpay_signature = razorpay_signature;
    b.payment_status = 'Paid';
    b.payment_method = 'Razorpay';
    await b.save();

    const updated = sanitizeDoc(b.toObject());
    try {
      const html = `
        <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#FDFBF7;'>
          <h2 style='color:#063247;margin-top:0;'>Booking Confirmed — ${updated.booking_no}</h2>
          <p>Dear ${updated.customer?.name},</p>
          <p>Thank you for booking with <strong>Cab Castle Goa</strong>. Your vehicle
             <strong>${updated.vehicle_snapshot?.title}</strong> is confirmed.</p>
          <table style='width:100%;border-collapse:collapse;margin:16px 0;'>
            <tr><td style='padding:6px 0;'>Pickup</td><td>${updated.start_date}</td></tr>
            <tr><td style='padding:6px 0;'>Drop-off</td><td>${updated.end_date}</td></tr>
            <tr><td style='padding:6px 0;'>Location</td><td>${updated.pickup_location}</td></tr>
            <tr><td style='padding:6px 0;'>Total Paid</td><td><strong>₹${updated.total_amount}</strong></td></tr>
          </table>
          <p>Download your invoice at any time from your booking confirmation page.</p>
          <p style='color:#4C606E;font-size:12px;'>Cab Castle Goa · Assagao, North Goa · +91 70266 48960</p>
        </div>
      `;
      await sendEmailWithAttachment(updated.customer?.email, `Booking Confirmed — ${updated.booking_no}`, html);
    } catch {
      // Ignore email errors
    }

    return res.json({ ok: true, booking: updated });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Payment verification failed' });
  }
}

export async function downloadInvoice(req: Request, res: Response) {
  try {
    const { fmt } = req.query;
    const b = await BookingModel.findOne({ id: req.params.booking_id }).lean();
    if (!b) {
      return res.status(404).json({ detail: 'Booking not found' });
    }

    const vs = b.vehicle_snapshot || {};
    if ((!vs.title || !vs.reg_no) && b.vehicle_id) {
      const v = (await VehicleModel.findOne({ id: b.vehicle_id }).lean()) as any;
      if (v) {
        b.vehicle_snapshot = {
          title: v.title,
          reg_no: v.reg_no,
          category: v.category,
          image_url: v.image_url,
          daily_rate: v.daily_rate,
          security_deposit: v.security_deposit,
          fuel_type: v.fuel_type,
        };
      }
    }

    const acceptHdr = (req.headers.accept || '').toLowerCase();
    const fmtStr = String(fmt || '').toLowerCase();

    if (fmtStr === 'pdf' || (!acceptHdr.includes('text/html') && !fmtStr.includes('html'))) {
      const pdfBuffer = await buildInvoicePdf(b);
      const filename = `invoice_${b.booking_no || req.params.booking_id}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(pdfBuffer);
    }

    const htmlContent = renderInvoiceHtml(b);
    res.setHeader('Content-Type', 'text/html');
    return res.send(htmlContent);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to download invoice' });
  }
}

export async function refundBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const { amount, reason } = req.body;
    const b = await BookingModel.findOne({ id: req.params.booking_id });
    if (!b) {
      return res.status(404).json({ detail: 'Booking not found' });
    }
    if (b.payment_status !== 'Paid') {
      return res.status(400).json({ detail: 'Only paid bookings can be refunded' });
    }

    const refundAmount = amount ? Number(amount) : b.total_amount;
    b.payment_status = 'Refunded';
    b.status = 'Cancelled';
    b.notes = (b.notes ? b.notes + ' | ' : '') + `Refunded ₹${refundAmount} on ${nowIso()}. Reason: ${reason || 'Customer cancellation'}`;
    await b.save();
    await refreshVehicleStatus(b.vehicle_id);

    return res.json({
      ok: true,
      message: `Successfully processed refund of ₹${refundAmount}`,
      booking: sanitizeDoc(b.toObject()),
    });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Refund processing failed' });
  }
}
