import mongoose, { Schema } from 'mongoose';

export interface IEnquiry {
  id: string;
  enquiry_no: string;
  customer_name: string;
  phone: string;
  email?: string;
  city: string;
  car_model_interested?: string;
  source: 'Phone Call' | 'WhatsApp' | 'Walk-in' | 'Website' | 'Instagram' | 'Referral' | 'Other';
  status: 'New' | 'Contacted' | 'Follow-up' | 'Converted' | 'Lost';
  notes?: string;
  created_at: string;
}

const EnquirySchema: Schema = new Schema<IEnquiry>(
  {
    id: { type: String, required: true, unique: true },
    enquiry_no: { type: String, required: true, unique: true },
    customer_name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: '' },
    city: { type: String, required: true, trim: true },
    car_model_interested: { type: String, default: 'General' },
    source: {
      type: String,
      enum: ['Phone Call', 'WhatsApp', 'Walk-in', 'Website', 'Instagram', 'Referral', 'Other'],
      default: 'Phone Call',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Follow-up', 'Converted', 'Lost'],
      default: 'New',
    },
    notes: { type: String, default: '' },
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

export const EnquiryModel = mongoose.model<IEnquiry>('Enquiry', EnquirySchema, 'enquiries');
