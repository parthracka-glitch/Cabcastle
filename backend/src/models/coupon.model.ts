import mongoose, { Schema } from 'mongoose';

export interface ICoupon {
  id: string;
  code: string;
  type: 'Percentage' | 'Fixed';
  value: number;
  min_amount: number;
  expiry: string;
  active: boolean;
  is_expired?: boolean;
  is_deleted?: boolean;
  deleted_at?: Date | null;
  created_at: string;
}

const CouponSchema: Schema = new Schema<ICoupon>(
  {
    id: { type: String, required: true, unique: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    type: { type: String, required: true, enum: ['Percentage', 'Fixed'] },
    value: { type: Number, required: true, min: 0 },
    min_amount: { type: Number, default: 0 },
    expiry: { type: String, required: true },
    active: { type: Boolean, default: true },
    is_expired: { type: Boolean, default: false },
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

CouponSchema.index({ code: 1, is_deleted: 1 });
CouponSchema.index({ is_deleted: 1, active: 1 });

export const CouponModel = mongoose.model<ICoupon>('Coupon', CouponSchema, 'coupons');
