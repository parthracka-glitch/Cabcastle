import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { VehicleModel } from '../models/vehicle.model.js';
import { AuthenticatedRequest } from '../middlewares/security.middleware.js';
import { refreshAllVehicleStatuses, nowIso, sanitizeDoc, escapeRegex } from '../services/booking.service.js';
import { SEED_VEHICLES } from '../db/seed.js';

export async function listVehicles(req: Request, res: Response) {
  try {
    if (mongoose.connection.readyState === 1) {
      await refreshAllVehicleStatuses();
    }
    const { category, status_filter, q } = req.query;

    const query: any = { is_deleted: { $ne: true } };
    if (category && category !== 'All') {
      query.category = String(category);
    }
    if (status_filter && status_filter !== 'All') {
      query.status = String(status_filter);
    }
    if (q) {
      const qStr = escapeRegex(String(q).trim());
      query.$or = [
        { title: { $regex: qStr, $options: 'i' } },
        { reg_no: { $regex: qStr, $options: 'i' } },
      ];
    }

    if (mongoose.connection.readyState === 1) {
      const docs = await VehicleModel.find(query).sort({ created_at: 1, _id: 1 }).limit(500).lean();
      const sanitized = docs.map((d) => sanitizeDoc(d));
      return res.json(sanitized);
    }
    throw new Error('Database not ready');
  } catch (_err: any) {
    let list: any[] = [...SEED_VEHICLES];
    const { category, status_filter, q } = req.query;
    if (category && category !== 'All') {
      list = list.filter((v) => v.category?.toLowerCase() === String(category).toLowerCase());
    }
    if (status_filter && status_filter !== 'All') {
      list = list.filter((v) => v.status === String(status_filter));
    }
    if (q) {
      const qStr = String(q).toLowerCase();
      list = list.filter(
        (v) =>
          (v.title || '').toLowerCase().includes(qStr) ||
          (v.subtitle || '').toLowerCase().includes(qStr) ||
          (v.reg_no || '').toLowerCase().includes(qStr)
      );
    }
    return res.json(list.map((d) => sanitizeDoc(d)));
  }
}

export async function getVehicleById(req: Request, res: Response) {
  try {
    const vId = req.params.vehicle_id;
    if (mongoose.connection.readyState === 1) {
      const query: any = { is_deleted: { $ne: true } };
      if (mongoose.Types.ObjectId.isValid(vId)) {
        query.$or = [{ id: vId }, { _id: vId }];
      } else {
        query.id = vId;
      }
      const doc = await VehicleModel.findOne(query).lean();
      if (doc) {
        return res.json(sanitizeDoc(doc));
      }
    }
    const fallback = SEED_VEHICLES.find((item) => item.id === vId);
    if (fallback) {
      return res.json(sanitizeDoc(fallback));
    }
    return res.status(404).json({ detail: 'Vehicle not found' });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Vehicle not found' });
  }
}

export async function createVehicle(req: AuthenticatedRequest, res: Response) {
  try {
    const payload = { ...req.body };
    delete payload._id;
    delete payload.id;

    if (payload.daily_rate !== undefined) payload.daily_rate = Number(payload.daily_rate) || 0;
    if (payload.self_drive_rate !== undefined) payload.self_drive_rate = Number(payload.self_drive_rate) || 0;
    if (payload.rate_manual !== undefined) payload.rate_manual = payload.rate_manual === null ? null : (Number(payload.rate_manual) || 0);
    if (payload.rate_auto !== undefined) payload.rate_auto = payload.rate_auto === null ? null : (Number(payload.rate_auto) || 0);
    if (payload.daily_rate_manual !== undefined) payload.daily_rate_manual = Number(payload.daily_rate_manual) || 0;
    if (payload.daily_rate_automatic !== undefined) payload.daily_rate_automatic = Number(payload.daily_rate_automatic) || 0;
    if (payload.airport_rate !== undefined) payload.airport_rate = Number(payload.airport_rate) || 0;
    if (payload.security_deposit !== undefined) payload.security_deposit = Number(payload.security_deposit) || 0;
    if (payload.delivery_fee !== undefined) payload.delivery_fee = Number(payload.delivery_fee) || 0;
    if (payload.seating !== undefined) payload.seating = parseInt(String(payload.seating), 10) || 5;

    const defaultPlaceholder = '/vehicles/maruti_swift_old.webp';
    if (Array.isArray(payload.images)) {
      payload.images = payload.images.filter((img: any) => typeof img === 'string' && img.trim()).slice(0, 5);
      payload.image_url = payload.images[0] || (typeof payload.image_url === 'string' && payload.image_url.trim() ? payload.image_url.trim() : defaultPlaceholder);
      if (payload.images.length === 0 && payload.image_url) {
        payload.images = [payload.image_url];
      }
    } else if (typeof payload.image_url === 'string' && payload.image_url.trim()) {
      payload.images = [payload.image_url.trim()];
    } else {
      payload.images = [defaultPlaceholder];
      payload.image_url = defaultPlaceholder;
    }

    const newId = randomUUID();
    const item = {
      ...payload,
      id: newId,
      created_at: nowIso(),
      is_deleted: false,
    };

    if (mongoose.connection.readyState === 1) {
      const v = new VehicleModel(item);
      await v.save();
      return res.json(sanitizeDoc(v.toObject()));
    }

    SEED_VEHICLES.unshift(item);
    return res.json(sanitizeDoc(item));
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to create vehicle' });
  }
}

export async function updateVehicle(req: AuthenticatedRequest, res: Response) {
  try {
    const vId = req.params.vehicle_id;
    const upd = { ...req.body };

    // Prevent attempting to mutate immutable MongoDB fields
    delete upd._id;
    delete upd.id;
    delete upd.created_at;

    // Coerce numeric types
    if (upd.daily_rate !== undefined) upd.daily_rate = Number(upd.daily_rate) || 0;
    if (upd.self_drive_rate !== undefined) upd.self_drive_rate = Number(upd.self_drive_rate) || 0;
    if (upd.rate_manual !== undefined) upd.rate_manual = upd.rate_manual === null ? null : (Number(upd.rate_manual) || 0);
    if (upd.rate_auto !== undefined) upd.rate_auto = upd.rate_auto === null ? null : (Number(upd.rate_auto) || 0);
    if (upd.daily_rate_manual !== undefined) upd.daily_rate_manual = Number(upd.daily_rate_manual) || 0;
    if (upd.daily_rate_automatic !== undefined) upd.daily_rate_automatic = Number(upd.daily_rate_automatic) || 0;
    if (upd.airport_rate !== undefined) upd.airport_rate = Number(upd.airport_rate) || 0;
    if (upd.security_deposit !== undefined) upd.security_deposit = Number(upd.security_deposit) || 0;
    if (upd.delivery_fee !== undefined) upd.delivery_fee = Number(upd.delivery_fee) || 0;
    if (upd.seating !== undefined) upd.seating = parseInt(String(upd.seating), 10) || 5;

    const defaultPlaceholder = '/vehicles/maruti_swift_old.webp';
    if (Array.isArray(upd.images)) {
      upd.images = upd.images.filter((img: any) => typeof img === 'string' && img.trim()).slice(0, 5);
      upd.image_url = upd.images[0] || (typeof upd.image_url === 'string' && upd.image_url.trim() ? upd.image_url.trim() : defaultPlaceholder);
      if (upd.images.length === 0 && upd.image_url) {
        upd.images = [upd.image_url];
      }
    } else if (typeof upd.image_url === 'string') {
      const trimmed = upd.image_url.trim();
      if (trimmed) {
        upd.image_url = trimmed;
        upd.images = [trimmed];
      } else {
        upd.image_url = defaultPlaceholder;
        upd.images = [defaultPlaceholder];
      }
    }

    if (mongoose.connection.readyState === 1) {
      const query: any = { is_deleted: { $ne: true } };
      if (mongoose.Types.ObjectId.isValid(vId)) {
        query.$or = [{ id: vId }, { _id: vId }];
      } else {
        query.id = vId;
      }

      const v = await VehicleModel.findOneAndUpdate(
        query,
        { $set: upd },
        { new: true }
      ).lean();

      if (v) {
        return res.json(sanitizeDoc(v));
      }
    }

    // In-memory fallback
    const idx = SEED_VEHICLES.findIndex((item) => item.id === vId || (item as any)._id === vId);
    if (idx !== -1) {
      SEED_VEHICLES[idx] = { ...SEED_VEHICLES[idx], ...upd };
      return res.json(sanitizeDoc(SEED_VEHICLES[idx]));
    }

    return res.status(404).json({ detail: 'Vehicle not found' });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to update vehicle' });
  }
}

export async function deleteVehicle(req: AuthenticatedRequest, res: Response) {
  try {
    const vId = req.params.vehicle_id;
    if (mongoose.connection.readyState === 1) {
      const query: any = { is_deleted: { $ne: true } };
      if (mongoose.Types.ObjectId.isValid(vId)) {
        query.$or = [{ id: vId }, { _id: vId }];
      } else {
        query.id = vId;
      }
      await VehicleModel.findOneAndUpdate(
        query,
        { $set: { is_deleted: true, deleted_at: new Date() } }
      );
      return res.json({ ok: true });
    }

    const idx = SEED_VEHICLES.findIndex((item) => item.id === vId || (item as any)._id === vId);
    if (idx !== -1) {
      SEED_VEHICLES.splice(idx, 1);
    }
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Failed to delete vehicle' });
  }
}
