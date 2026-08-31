export interface IUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'customer';
  picture?: string;
  driving_license?: string;
  aadhar_image_url?: string;
  license_image_url?: string;
  city?: string;
  state?: string;
  emergency_contact?: string;
  preferred_location?: string;
  created_at?: string;
}

export interface IVehicle {
  id: string;
  title: string;
  reg_no: string;
  category: 'Sedan' | 'SUV' | 'Hatchback' | 'Convertible' | 'Thar 4x4';
  fuel_type: 'Petrol' | 'Diesel' | 'EV';
  transmission: 'Manual' | 'Automatic' | 'Manual & Automatic';
  seating: number;
  daily_rate: number;
  daily_rate_manual?: number;
  daily_rate_automatic?: number;
  security_deposit: number;
  image_url: string;
  images?: string[];
  status: 'Available' | 'Booked' | 'Maintenance';
  description?: string;
  created_at: string;
}

export interface IBookingCustomer {
  name: string;
  phone: string;
  email: string;
  aadhar?: string;
  driving_license?: string;
  aadhar_image_url?: string;
  license_image_url?: string;
}

export interface IAddOns {
  helmets: number;
  infant_seat: boolean;
  airport_pickup: boolean;
}

export interface IBooking {
  id: string;
  booking_no: string;
  vehicle_id: string;
  vehicle_snapshot: {
    title: string;
    reg_no: string;
    category: string;
    image_url: string;
    daily_rate?: number;
    security_deposit?: number;
    fuel_type?: string;
  };
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
  created_at: string;
  movement_type?: string;
  vehicle?: IVehicle;
}

export interface ICoupon {
  id: string;
  code: string;
  type: 'Percentage' | 'Fixed';
  value: number;
  min_amount: number;
  expiry: string;
  active: boolean;
  is_expired?: boolean;
  created_at: string;
}

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
