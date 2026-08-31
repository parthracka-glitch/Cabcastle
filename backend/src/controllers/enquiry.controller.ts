import { Response } from 'express';
import crypto, { randomUUID } from 'node:crypto';
import { EnquiryModel } from '../models/enquiry.model.js';
import { AuthenticatedRequest } from '../middlewares/security.middleware.js';
import { nowIso, sanitizeDoc, escapeRegex } from '../services/booking.service.js';
import { buildEnquiriesExcel } from '../services/excel.service.js';

function formatDateYYMMDD(date: Date): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

export async function listEnquiries(req: AuthenticatedRequest, res: Response) {
  try {
    const { q, city_filter, status_filter } = req.query;

    const query: any = {};
    if (status_filter && status_filter !== 'All') {
      query.status = String(status_filter);
    }
    if (city_filter && city_filter !== 'All') {
      query.city = String(city_filter);
    }
    if (q) {
      const qStr = escapeRegex(String(q).trim());
      query.$or = [
        { customer_name: { $regex: qStr, $options: 'i' } },
        { phone: { $regex: qStr, $options: 'i' } },
        { city: { $regex: qStr, $options: 'i' } },
        { car_model_interested: { $regex: qStr, $options: 'i' } },
        { enquiry_no: { $regex: qStr, $options: 'i' } },
      ];
    }

    let allEnquiries: any[] = [];
    let filtered: any[] = [];
    try {
      allEnquiries = await EnquiryModel.find({}).limit(5000).lean();
      filtered = await EnquiryModel.find(query).sort({ created_at: -1 }).limit(1000).lean();
    } catch {
      // Graceful fallback when DB is offline
    }

    const cityCounts: Record<string, number> = {};
    for (const eq of allEnquiries) {
      const c = toTitleCase(String(eq.city || 'Unknown').trim());
      if (c) {
        cityCounts[c] = (cityCounts[c] || 0) + 1;
      }
    }

    const totalCount = allEnquiries.length;
    const cityAnalytics = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([city, count]) => ({
        city,
        count,
        percentage: totalCount > 0 ? Math.round((count / totalCount) * 1000) / 10 : 0,
      }));

    const topCity = cityAnalytics.length > 0 ? cityAnalytics[0].city : 'N/A';

    return res.json({
      items: filtered.map((d) => sanitizeDoc(d)),
      total_enquiries: totalCount,
      city_analytics: cityAnalytics,
      top_city: topCity,
    });
  } catch (_err: any) {
    return res.json({
      items: [],
      total_enquiries: 0,
      city_analytics: [],
      top_city: 'N/A',
    });
  }
}

export async function createEnquiry(req: AuthenticatedRequest, res: Response) {
  try {
    const { customer_name, phone, email, city, car_model_interested, source, status, notes } = req.body;
    const datePrefix = formatDateYYMMDD(new Date());
    const randHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    const enquiryNo = `ENQ-${datePrefix}-${randHex}`;

    const enquiry = new EnquiryModel({
      id: randomUUID(),
      enquiry_no: enquiryNo,
      customer_name: String(customer_name).trim(),
      phone: String(phone).trim(),
      email: String(email || '').trim(),
      city: toTitleCase(String(city).trim()),
      car_model_interested: car_model_interested || 'General',
      source: source || 'Phone Call',
      status: status || 'New',
      notes: notes || '',
      created_at: nowIso(),
    });

    await enquiry.save();
    return res.json(sanitizeDoc(enquiry.toObject()));
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to create enquiry' });
  }
}

export async function updateEnquiryStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { status } = req.body;
    const eq = await EnquiryModel.findOneAndUpdate(
      { id: req.params.enquiry_id },
      { $set: { status } },
      { new: true }
    ).lean();

    if (!eq) {
      return res.status(404).json({ detail: 'Enquiry not found' });
    }
    return res.json(sanitizeDoc(eq));
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to update enquiry status' });
  }
}

export async function deleteEnquiry(req: AuthenticatedRequest, res: Response) {
  try {
    const r = await EnquiryModel.deleteOne({ id: req.params.enquiry_id });
    if (r.deletedCount === 0) {
      return res.status(404).json({ detail: 'Enquiry not found' });
    }
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to delete enquiry' });
  }
}

export async function exportEnquiriesExcel(_req: AuthenticatedRequest, res: Response) {
  try {
    const docs = await EnquiryModel.find({}).sort({ created_at: -1 }).limit(5000).lean();
    const xlsxBuffer = await buildEnquiriesExcel(docs);
    const ts = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 15);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="cab_castle_enquiries_${ts}.xlsx"`);
    return res.send(xlsxBuffer);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to export enquiries excel' });
  }
}
