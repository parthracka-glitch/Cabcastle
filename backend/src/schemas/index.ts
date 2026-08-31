import { SchemaDefinition } from '../middlewares/validate.middleware.js';

export const QuoteSchema: SchemaDefinition = {
  vehicle_id: { type: 'string', required: true, message: 'vehicle_id is required' },
  start_date: { type: 'string', required: true, message: 'start_date is required' },
  end_date: { type: 'string', required: true, message: 'end_date is required' },
  airport_pickup: { type: 'boolean', required: false },
  coupon_code: { type: 'string', required: false },
};

export const CreateBookingSchema: SchemaDefinition = {
  vehicle_id: { type: 'string', required: true, message: 'vehicle_id is required' },
  start_date: { type: 'string', required: true, message: 'start_date is required' },
  end_date: { type: 'string', required: true, message: 'end_date is required' },
  pickup_location: { type: 'string', required: true, min: 2, message: 'pickup_location is required' },
  customer: { type: 'object', required: true, message: 'customer details object is required' },
};

export const CreateOfflineBookingSchema: SchemaDefinition = {
  vehicle_id: { type: 'string', required: true, message: 'vehicle_id is required' },
  start_date: { type: 'string', required: true, message: 'start_date is required' },
  end_date: { type: 'string', required: true, message: 'end_date is required' },
  customer: { type: 'object', required: true, message: 'customer details object is required' },
};

export const CreateVehicleSchema: SchemaDefinition = {
  title: { type: 'string', required: true, min: 2, message: 'title is required' },
  reg_no: { type: 'string', required: true, min: 4, message: 'reg_no is required' },
  category: {
    type: 'string',
    required: true,
    enum: ['Sedan', 'SUV', 'Hatchback', 'Convertible', 'Thar 4x4'],
    message: 'Valid category is required',
  },
  fuel_type: {
    type: 'string',
    required: true,
    enum: ['Petrol', 'Diesel', 'EV'],
    message: 'Valid fuel_type is required',
  },
  transmission: {
    type: 'string',
    required: true,
    enum: ['Manual', 'Automatic', 'Manual & Automatic'],
    message: 'Valid transmission is required',
  },
  daily_rate: { type: 'number', required: true, min: 100, message: 'daily_rate must be at least ₹100' },
  security_deposit: { type: 'number', required: true, min: 0, message: 'security_deposit must be non-negative' },
};

export const CreateCouponSchema: SchemaDefinition = {
  code: { type: 'string', required: true, min: 3, max: 20, message: 'code must be 3-20 characters' },
  type: { type: 'string', required: true, enum: ['Percentage', 'Fixed'], message: 'type must be Percentage or Fixed' },
  value: { type: 'number', required: true, min: 1, message: 'value must be at least 1' },
  expiry: { type: 'string', required: true, message: 'expiry date string is required' },
};

export const ValidateCouponSchema: SchemaDefinition = {
  code: { type: 'string', required: true, message: 'code is required' },
  amount: { type: 'number', required: true, min: 0, message: 'amount is required' },
};
