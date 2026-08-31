import mongoose, { Schema } from 'mongoose';

export interface IUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  password_hash?: string;
  role: 'admin' | 'customer';
  google_id?: string;
  picture?: string;
  driving_license?: string;
  aadhar_image_url?: string;
  license_image_url?: string;
  city?: string;
  state?: string;
  emergency_contact?: string;
  preferred_location?: string;
  email_verified?: boolean;
  password_reset_token_hash?: string | null;
  password_reset_expires?: Date | null;
  verification_token_hash?: string | null;
  created_at: string;
}

const UserSchema: Schema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    password_hash: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
    google_id: { type: String, default: '' },
    picture: { type: String, default: '' },
    driving_license: { type: String, default: '' },
    aadhar_image_url: { type: String, default: '' },
    license_image_url: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    emergency_contact: { type: String, default: '' },
    preferred_location: { type: String, default: '' },
    email_verified: { type: Boolean, default: false },
    password_reset_token_hash: { type: String, default: null },
    password_reset_expires: { type: Date, default: null },
    verification_token_hash: { type: String, default: null },
    created_at: { type: String, required: true },
  },
  {
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any)._id;
        delete (ret as any).__v;
        delete (ret as any).password_hash;
        delete (ret as any).password_reset_token_hash;
        delete (ret as any).password_reset_expires;
        delete (ret as any).verification_token_hash;
        return ret;
      },
    },
  }
);

UserSchema.index({ role: 1 });

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema, 'users');
