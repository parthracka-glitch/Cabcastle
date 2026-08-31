import mongoose, { Schema } from 'mongoose';

export interface ISetting {
  key: string;
  supportEmail?: string;
  autoConfirm?: boolean;
  emailAlerts?: boolean;
  system_notifications?: boolean;
  email_alerts?: boolean;
  whatsapp_dispatch?: boolean;
  updated_at?: string;
}

const SettingSchema: Schema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true },
    supportEmail: { type: String, default: 'dasgiradur@gmail.com' },
    autoConfirm: { type: Boolean, default: true },
    emailAlerts: { type: Boolean, default: true },
    system_notifications: { type: Boolean, default: true },
    email_alerts: { type: Boolean, default: true },
    whatsapp_dispatch: { type: Boolean, default: true },
    updated_at: { type: String, default: '' },
  },
  {
    versionKey: false,
  }
);

export const SettingModel = mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema, 'settings');
