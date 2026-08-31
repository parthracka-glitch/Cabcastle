import mongoose, { Schema } from 'mongoose';

export interface IVehicle {
  id: string;
  title: string;
  subtitle?: string;
  reg_no: string;
  category: 'Sedan' | 'SUV' | 'Hatchback' | 'Luxury' | 'Convertible' | 'Thar 4x4';
  fuel_type: 'Petrol' | 'Diesel' | 'Hybrid Petrol' | 'EV';
  transmission: 'Manual' | 'Automatic' | 'Manual & Automatic';
  seating: number;
  daily_rate: number; // Tour package rate
  self_drive_rate?: number; // Self-drive 24h rate
  rate_manual?: number | null;
  rate_auto?: number | null;
  daily_rate_manual?: number;
  daily_rate_automatic?: number;
  airport_rate?: number;
  security_deposit: number;
  delivery_fee?: number;
  image_url: string;
  images?: string[];
  status: 'Available' | 'Booked' | 'Maintenance';
  description?: string;
  is_deleted?: boolean;
  deleted_at?: Date | null;
  created_at: string;
}

const VehicleSchema: Schema = new Schema<IVehicle>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '' },
    reg_no: { type: String, required: true, unique: true, trim: true },
    category: {
      type: String,
      required: true,
      default: 'SUV',
    },
    fuel_type: { type: String, required: true, default: 'Petrol' },
    transmission: { type: String, required: true, default: 'Manual' },
    seating: { type: Number, required: true, min: 2, max: 9, default: 5 },
    daily_rate: { type: Number, required: true, min: 0, default: 2500 },
    self_drive_rate: { type: Number, default: 1500 },
    rate_manual: { type: Number, default: null },
    rate_auto: { type: Number, default: null },
    daily_rate_manual: { type: Number, default: 0 },
    daily_rate_automatic: { type: Number, default: 0 },
    airport_rate: { type: Number, default: 1500 },
    security_deposit: { type: Number, required: true, min: 0, default: 3000 },
    delivery_fee: { type: Number, default: 500 },
    image_url: { type: String, required: true },
    images: { type: [String], default: [] },
    status: {
      type: String,
      required: true,
      enum: ['Available', 'Booked', 'Maintenance'],
      default: 'Available',
    },
    description: { type: String, default: '' },
    is_deleted: { type: Boolean, default: false },
    deleted_at: { type: Date, default: null },
    created_at: { type: String, required: true },
  },
  {
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

VehicleSchema.index({ is_deleted: 1, status: 1 });
VehicleSchema.index({ category: 1, is_deleted: 1 });

export const VehicleModel =
  mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);
