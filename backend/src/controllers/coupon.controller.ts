import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { CouponModel } from '../models/coupon.model.js';
import { AuthenticatedRequest } from '../middlewares/security.middleware.js';
import { refreshCouponStatuses, validateCouponCode, nowIso, sanitizeDoc } from '../services/booking.service.js';

export async function validateCoupon(req: Request, res: Response) {
  try {
    const { code, amount } = req.body;
    const result = await validateCouponCode(code, amount);
    return res.json(result);
  } catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ detail: err.detail });
    }
    return res.status(500).json({ detail: err.message || 'Validation failed' });
  }
}

export async function listPublicCoupons(_req: Request, res: Response) {
  try {
    try {
      await refreshCouponStatuses();
    } catch {}

    const now = new Date();
    const docs = await CouponModel.find({ active: true, is_expired: false, is_deleted: { $ne: true } }).limit(50).lean();
    const sanitized = docs
      .map((c: any) => sanitizeDoc(c))
      .filter((c: any) => {
        if (!c.expiry) return true;
        try {
          return new Date(c.expiry) >= now;
        } catch {
          return true;
        }
      })
      .map((c: any) => ({
        code: c.code,
        type: c.type,
        value: c.value,
        min_amount: c.min_amount || 0,
        description: c.description || (c.type === 'Percentage' ? `${c.value}% OFF on booking` : `₹${c.value} FLAT discount`),
      }));

    return res.json(sanitized);
  } catch {
    return res.json([]);
  }
}

export async function listCoupons(_req: AuthenticatedRequest, res: Response) {
  try {
    try {
      await refreshCouponStatuses();
    } catch {}

    let docs: any[] = [];
    try {
      docs = await CouponModel.find({ is_deleted: { $ne: true } }).limit(500).lean();
    } catch {
      // Graceful fallback
    }

    const now = new Date();
    const sanitized = docs.map((c: any) => {
      const doc = sanitizeDoc(c);
      if (doc.expiry) {
        try {
          const expDt = new Date(doc.expiry);
          if (expDt < now) {
            doc.is_expired = true;
            doc.active = false;
          } else {
            doc.is_expired = false;
          }
        } catch {
          // Keep existing values
        }
      }
      return doc;
    });

    return res.json(sanitized);
  } catch (_err: any) {
    return res.json([]);
  }
}

export async function createCoupon(req: AuthenticatedRequest, res: Response) {
  try {
    const body = req.body;
    const code = String(body.code || '').toUpperCase().trim();
    const existing = await CouponModel.findOne({ code, is_deleted: { $ne: true } });
    if (existing) {
      return res.status(400).json({ detail: 'Coupon code already exists' });
    }

    let isExpired = false;
    let active = body.active !== undefined ? !!body.active : true;
    try {
      const expDt = new Date(body.expiry);
      if (expDt < new Date()) {
        active = false;
        isExpired = true;
      }
    } catch {
      isExpired = false;
    }

    const coupon = new CouponModel({
      ...body,
      code,
      id: randomUUID(),
      active,
      is_expired: isExpired,
      is_deleted: false,
      created_at: nowIso(),
    });

    await coupon.save();
    return res.json(sanitizeDoc(coupon.toObject()));
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to create coupon' });
  }
}

export async function updateCoupon(req: AuthenticatedRequest, res: Response) {
  try {
    const upd = { ...req.body };
    if (upd.code) {
      upd.code = String(upd.code).toUpperCase().trim();
    }
    try {
      const expDt = new Date(upd.expiry);
      if (expDt < new Date()) {
        upd.active = false;
        upd.is_expired = true;
      } else {
        upd.is_expired = false;
      }
    } catch {
      // Ignore date errors
    }

    const c = await CouponModel.findOneAndUpdate(
      { id: req.params.coupon_id, is_deleted: { $ne: true } },
      { $set: upd },
      { new: true }
    ).lean();

    if (!c) {
      return res.status(404).json({ detail: 'Not found' });
    }

    return res.json(sanitizeDoc(c));
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to update coupon' });
  }
}

export async function deleteCoupon(req: AuthenticatedRequest, res: Response) {
  try {
    const c = await CouponModel.findOne({ id: req.params.coupon_id });
    if (!c) {
      return res.status(404).json({ detail: 'Coupon not found' });
    }
    c.is_deleted = true;
    c.deleted_at = new Date();
    c.active = false;
    c.code = `${c.code}_DEL_${Date.now()}`;
    await c.save();
    return res.json({ ok: true, message: 'Coupon deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to delete coupon' });
  }
}
