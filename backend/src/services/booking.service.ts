import mongoose from 'mongoose';
import { AIRPORT_SURCHARGE, TAX_RATE, ADDON_PRICING, EMAIL_KEY, EMAIL_BASE_URL, EMAIL_FROM_NAME } from '../config/index.js';
import { VehicleModel } from '../models/vehicle.model.js';
import { BookingModel } from '../models/booking.model.js';
import { CouponModel } from '../models/coupon.model.js';

export function nowIso(): string {
  return new Date().toISOString();
}

export function escapeRegex(str: string): string {
  return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function computeDays(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const diffHours = (e - s) / 3600000;
  if (isNaN(diffHours) || diffHours <= 0) {
    return 1;
  }
  return Math.max(1, Math.ceil(diffHours / 24));
}

export function sanitizeDoc<T = any>(doc: any): T {
  if (doc) {
    if (typeof doc.toObject === 'function') {
      doc = doc.toObject();
    }
    if (!doc.id && doc._id) {
      doc.id = String(doc._id);
    }
    delete doc._id;
    delete doc.__v;
  }
  return doc;
}

export async function refreshCouponStatuses(): Promise<void> {
  const now = new Date();
  const coupons = await CouponModel.find({});
  for (const c of coupons) {
    if (!c.expiry) continue;
    try {
      const expDate = new Date(c.expiry);
      if (expDate < now) {
        if (c.active || !c.is_expired) {
          c.active = false;
          c.is_expired = true;
          await c.save();
        }
      }
    } catch {
      continue;
    }
  }
}

export async function validateCouponCode(code: string, amount: number) {
  await refreshCouponStatuses();
  const cleanCode = code.toUpperCase().trim();
  const coupon = await CouponModel.findOne({ code: cleanCode });
  if (!coupon) {
    throw { status: 400, detail: 'Invalid coupon code' };
  }
  if (!coupon.active || coupon.is_expired) {
    throw { status: 400, detail: 'This coupon has expired or is inactive' };
  }
  try {
    const exp = new Date(coupon.expiry);
    if (exp < new Date()) {
      coupon.active = false;
      coupon.is_expired = true;
      await coupon.save();
      throw { status: 400, detail: 'Coupon has expired' };
    }
  } catch (err: any) {
    if (err.status) throw err;
  }

  if (amount < (coupon.min_amount || 0)) {
    throw { status: 400, detail: `Minimum booking amount ₹${coupon.min_amount} required` };
  }

  let discount = 0;
  if (coupon.type === 'Percentage') {
    discount = Math.round(((amount * coupon.value) / 100) * 100) / 100;
  } else {
    discount = Number(coupon.value);
  }

  return {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount,
  };
}

export async function calcFare(
  vehicle: any,
  start: string,
  end: string,
  addOns: any = {},
  airportPickup: boolean = false,
  couponCode?: string | null,
  transmissionChoice?: string | null
) {
  const days = computeDays(start, end);

  let effectiveRate = vehicle.daily_rate;
  if (transmissionChoice === 'Manual' && vehicle.daily_rate_manual) {
    effectiveRate = vehicle.daily_rate_manual;
  } else if (transmissionChoice === 'Automatic' && vehicle.daily_rate_automatic) {
    effectiveRate = vehicle.daily_rate_automatic;
  } else if (vehicle.transmission === 'Manual' && vehicle.daily_rate_manual) {
    effectiveRate = vehicle.daily_rate_manual;
  } else if (vehicle.transmission === 'Automatic' && vehicle.daily_rate_automatic) {
    effectiveRate = vehicle.daily_rate_automatic;
  }

  const base = effectiveRate * days;
  const addonAmount =
    (addOns.helmets || 0) * ADDON_PRICING.helmet_per_unit +
    (addOns.infant_seat ? ADDON_PRICING.infant_seat_flat : 0);
  const airport = airportPickup ? AIRPORT_SURCHARGE : 0.0;
  const subtotal = base + addonAmount + airport;
  let discount = 0.0;
  let appliedCode: string | null = null;

  if (couponCode) {
    try {
      const res = await validateCouponCode(couponCode, subtotal);
      discount = res.discount;
      appliedCode = res.code;
    } catch {
      discount = 0.0;
    }
  }

  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * TAX_RATE * 100) / 100;
  const total = Math.round((taxable + tax) * 100) / 100;

  return {
    days,
    base_amount: base,
    addon_amount: addonAmount,
    airport_surcharge: airport,
    discount,
    coupon_code: appliedCode,
    tax,
    total_amount: total,
  };
}

export async function checkVehicleAvailable(
  vehicleId: string,
  startIso: string,
  endIso: string,
  excludeBookingId?: string
): Promise<boolean> {
  const query: any = {
    vehicle_id: vehicleId,
    status: { $ne: 'Cancelled' },
    start_date: { $lt: endIso },
    end_date: { $gt: startIso },
  };
  if (excludeBookingId) {
    query.id = { $ne: excludeBookingId };
  }
  const conflict = await BookingModel.findOne(query);
  return conflict === null;
}

export async function refreshVehicleStatus(vehicleId: string): Promise<string> {
  if (mongoose.connection.readyState !== 1) return '';
  try {
    const vehicle = await VehicleModel.findOne({ id: vehicleId });
    if (!vehicle) return '';
    if (vehicle.status === 'Maintenance') return 'Maintenance';

    const now = new Date();

    // 1. Auto-complete expired bookings
    const confirmedBks = await BookingModel.find({ vehicle_id: vehicleId, status: 'Confirmed' });
    for (const b of confirmedBks) {
      try {
        if (b.end_date) {
          const endDate = new Date(b.end_date);
          if (endDate < now) {
            b.status = 'Completed';
            await b.save();
          }
        }
      } catch {
        continue;
      }
    }

    // 2. Check if active booking exists
    let newStatus = 'Available';
    const activeBks = await BookingModel.find({ vehicle_id: vehicleId, status: 'Confirmed' });
    for (const b of activeBks) {
      try {
        if (b.start_date && b.end_date) {
          const startDate = new Date(b.start_date);
          const endDate = new Date(b.end_date);
          if (startDate <= now && now <= endDate) {
            newStatus = 'Booked';
            break;
          }
        }
      } catch {
        continue;
      }
    }

    if (newStatus !== vehicle.status) {
      vehicle.status = newStatus as any;
      await vehicle.save();
    }
    return newStatus;
  } catch {
    return '';
  }
}

let lastVehicleRefreshTime = 0;

export async function refreshAllVehicleStatuses(force: boolean = false): Promise<void> {
  try {
    const nowTs = Date.now() / 1000;
    if (!force && nowTs - lastVehicleRefreshTime < 60) {
      return;
    }
    lastVehicleRefreshTime = nowTs;
    const vehicles = await VehicleModel.find({ status: { $ne: 'Maintenance' } }, { id: 1 }).lean();
    await Promise.all(vehicles.map((v) => refreshVehicleStatus(v.id)));
  } catch {
    return;
  }
}

export async function sendEmailWithAttachment(
  toEmail: string,
  subject: string,
  html: string,
  _attachmentBuffer?: Buffer,
  _filename?: string
): Promise<void> {
  if (!EMAIL_KEY || !EMAIL_BASE_URL) {
    console.log('EMAIL_KEY or EMAIL_BASE_URL not set; skipping email notification');
    return;
  }
  try {
    const res = await fetch(`${EMAIL_BASE_URL}/api/v1/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Email-Key': EMAIL_KEY,
      },
      body: JSON.stringify({
        to: [toEmail],
        subject,
        html,
        from_name: EMAIL_FROM_NAME,
      }),
    });
    if (!res.ok) {
      console.error(`Email send failed status: ${res.status}`);
    }
  } catch (err) {
    console.error(`Email send error: ${err}`);
  }
}
