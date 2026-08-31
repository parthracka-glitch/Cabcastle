import mongoose, { Schema } from 'mongoose';

export interface IBookingCustomer {
  name: string;
  phone: string;
  email: string;
  aadhar?: string | null;
  driving_license?: string | null;
  aadhar_image_url?: string | null;
  license_image_url?: string | null;
}

export interface IAddOns {
  helmets: number;
  infant_seat: boolean;
  airport_pickup: boolean;
}

export interface IVehicleSnapshot {
  title: string;
  reg_no: string;
  category: string;
  image_url: string;
  daily_rate?: number;
  security_deposit?: number;
  fuel_type?: string;
}

export interface IBooking {
  id: string;
  booking_no: string;
  vehicle_id: string;
  vehicle_snapshot: IVehicleSnapshot;
  customer: IBookingCustomer;
  start_date: string;
  end_date: string;
  days: number;
  pickup_location: string;
  airport_pickup: boolean;
  airport_surcharge: number;
  add_ons: IAddOns;
  addon_amount: number;
  base_amount: number;
  discount: number;
  coupon_code?: string | null;
  tax: number;
  total_amount: number;
  payment_status: 'Pending' | 'Paid' | 'Partial' | 'Refunded';
  payment_method: 'Razorpay' | 'Cash' | 'UPI' | 'Card' | 'Other';
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  source: 'Online' | 'Offline';
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
  is_deleted?: boolean;
  deleted_at?: Date | null;
  created_at: string;
}

const BookingSchema: Schema = new Schema<IBooking>(
  {
    id: { type: String, required: true, unique: true },
    booking_no: { type: String, required: true, unique: true },
    vehicle_id: { type: String, required: true },
    vehicle_snapshot: { type: Schema.Types.Mixed, required: true },
    customer: { type: Schema.Types.Mixed, required: true },
    start_date: { type: String, required: true },
    end_date: { type: String, required: true },
    days: { type: Number, required: true },
    pickup_location: { type: String, required: true },
    airport_pickup: { type: Boolean, default: false },
    airport_surcharge: { type: Number, default: 0 },
    add_ons: { type: Schema.Types.Mixed, default: { helmets: 0, infant_seat: false, airport_pickup: false } },
    addon_amount: { type: Number, default: 0 },
    base_amount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    coupon_code: { type: String, default: null },
    tax: { type: Number, default: 0 },
    total_amount: { type: Number, required: true },
    payment_status: {
      type: String,
      enum: ['Pending', 'Paid', 'Partial', 'Refunded'],
      default: 'Pending',
    },
    payment_method: {
      type: String,
      enum: ['Razorpay', 'Cash', 'UPI', 'Card', 'Other'],
      default: 'Razorpay',
    },
    razorpay_order_id: { type: String, default: null },
    razorpay_payment_id: { type: String, default: null },
    razorpay_signature: { type: String, default: null },
    source: { type: String, enum: ['Online', 'Offline'], default: 'Online' },
    status: {
      type: String,
      enum: ['Confirmed', 'Completed', 'Cancelled'],
      default: 'Confirmed',
    },
    notes: { type: String, default: '' },
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

BookingSchema.index({ vehicle_id: 1, start_date: 1, end_date: 1 });
BookingSchema.index({ vehicle_id: 1, status: 1, start_date: 1, end_date: 1 });
BookingSchema.index({ created_at: -1, status: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ 'customer.email': 1 });
BookingSchema.index({ 'customer.phone': 1 });
BookingSchema.index({ razorpay_payment_id: 1 });

export const BookingModel = mongoose.model<IBooking>('Booking', BookingSchema, 'bookings');
