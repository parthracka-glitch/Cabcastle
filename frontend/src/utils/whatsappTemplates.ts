export interface BookingDataInput {
  id?: string;
  _id?: string;
  type?: string;
  _vertical?: string;
  bookingCode?: string;
  booking_code?: string;
  booking_no?: string;
  bookingNo?: string;
  customerName?: string;
  customer_name?: string;
  fullName?: string;
  name?: string;
  customer?: { name?: string; phone?: string; email?: string };
  customerPhone?: string;
  customer_phone?: string;
  phone?: string;
  mobile?: string;
  contactNumber?: string;
  contact_number?: string;
  userPhone?: string;
  guestPhone?: string;
  customerDetails?: { phone?: string; customerPhone?: string; name?: string };
  user?: { phone?: string; email?: string; name?: string };
  customerEmail?: string;
  customer_email?: string;
  email?: string;
  vehicleName?: string;
  packageName?: string;
  title?: string;
  vehicle_snapshot?: { title?: string; reg_number?: string; category?: string };
  vehicleId?: { name?: string; regNumber?: string; reg_number?: string; dailyRate?: number; securityDeposit?: number };
  packageId?: { title?: string; slug?: string; basePrice?: number };
  regNumber?: string;
  reg_number?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  serviceType?: string;
  service_type?: string;
  travelDate?: string;
  pickupDatetime?: string;
  pickupDate?: string;
  startDate?: string;
  start_date?: string;
  dropoffDatetime?: string;
  dropoffDate?: string;
  returnDate?: string;
  endDate?: string;
  end_date?: string;
  pickupTime?: string;
  pickup_time?: string;
  dropoffTime?: string;
  dropoff_time?: string;
  pickupLocation?: string;
  pickup_location?: string;
  location?: string;
  pickup_hub?: string;
  totalAmount?: number;
  total_amount?: number;
  totalPrice?: number;
  totalRentalAmount?: number;
  total_rental_amount?: number;
  depositAmount?: number;
  depositPaid?: number;
  deposit_paid?: number;
  advancePaid?: number;
  advance_amount?: number;
  securityDepositAmount?: number;
  security_deposit_amount?: number;
  securityDeposit?: number;
  security_deposit?: number;
  driverDetails?: string;
  driver_details?: string;
  driverName?: string;
  driver_name?: string;
  driverPhone?: string;
  driver_phone?: string;
  paxCount?: number;
  pax_count?: number;
  seats?: number;
  status?: string;
  paymentMethod?: string;
  payment_method?: string;
  payment_status?: string;
  utrNumber?: string;
  utr_number?: string;
  [key: string]: any;
}

export type BookingVertical = 'tour' | 'fleet';

export interface ExtractedBookingDetails {
  vertical: BookingVertical;
  customer_name: string;
  customer_phone: string;
  raw_customer_phone: string;
  display_phone: string;
  customer_email: string;
  booking_id: string;
  raw_code: string;
  vehicle_name: string;
  vehicle_number: string;
  service_type: string;
  pax_count: string;
  pickup_date: string;
  pickup_time: string;
  dropoff_date: string;
  dropoff_time: string;
  pickup_location: string;
  total_amount: string;
  advance_paid: string;
  balance_amount: string;
  security_deposit: string;
  driver_details: string;
  company_name: string;
  helpline_number: string;
  status: string;
  is_fleet: boolean;
  clean_phone: string;
  is_phone_valid: boolean;
}

export const DEFAULT_COMPANY_NAME = 'Cab Castle Goa';
export const DEFAULT_CAR_RENTAL_COMPANY_NAME = 'Cab Castle Goa';
export const DEFAULT_HELPLINE_NUMBER = '+91 70266 48960';
export const DEFAULT_PICKUP_HUB = 'Assagao Hub / Goa Airport Delivery Point';
export const DEFAULT_SECURITY_DEPOSIT = 0;
export const DEFAULT_UPI_VPA = '7026648960@okaxis';
export const DEFAULT_UPI_PAYEE = 'Dasgir Adur';

export function formatDateSafe(d?: string | Date): string {
  if (!d) return 'Scheduled Date';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return String(d);
  }
}

function extractTime(dtStr?: string, defaultFallback = '09:00 AM'): string {
  if (!dtStr) return defaultFallback;
  try {
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return defaultFallback;
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return defaultFallback;
  }
}

export function sanitizeWhatsAppPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  let clean = String(phone).replace(/[^0-9]/g, '');
  if (!clean) return '';
  if (clean.length === 11 && clean.startsWith('0')) clean = clean.substring(1);
  if (clean.length === 10) clean = `91${clean}`;
  return clean;
}

export function isValidWhatsAppPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const clean = sanitizeWhatsAppPhone(phone);
  return clean.length >= 10 && clean.length <= 15;
}

export function formatDisplayPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const clean = sanitizeWhatsAppPhone(phone);
  if (!clean) return phone;
  if (clean.startsWith('91') && clean.length === 12) {
    const main = clean.substring(2);
    return `+91 ${main.substring(0, 5)} ${main.substring(5)}`;
  }
  return `+${clean}`;
}

export function getBookingVertical(raw: BookingDataInput | null | undefined): BookingVertical {
  if (!raw) return 'tour';
  const typeStr = (raw.type || raw._vertical || '').toLowerCase();
  if (
    typeStr === 'tours' ||
    typeStr === 'tour' ||
    Boolean(raw.packageId) ||
    Boolean(raw.packageName && !raw.vehicleId && !raw.regNumber && !raw.reg_number)
  ) {
    return 'tour';
  }
  if (
    typeStr === 'fleet' ||
    typeStr === 'rental' ||
    typeStr === 'car' ||
    typeStr === 'bus' ||
    Boolean(raw.vehicleId) ||
    Boolean(raw.regNumber || raw.reg_number || raw.vehicleNumber) ||
    Boolean(raw.vehicle_snapshot)
  ) {
    return 'fleet';
  }
  const nameCheck = (raw.packageName || raw.title || raw.vehicleName || raw.vehicle_snapshot?.title || '').toLowerCase();
  if (nameCheck.includes('tour') || nameCheck.includes('yatra') || nameCheck.includes('darshan') || nameCheck.includes('package')) {
    return 'tour';
  }
  return 'fleet';
}

export function extractBookingDetails(raw: BookingDataInput | null | undefined): ExtractedBookingDetails {
  const vertical = getBookingVertical(raw);
  const isFleet = vertical === 'fleet';

  if (!raw) {
    return {
      vertical: 'tour',
      customer_name: 'Valued Customer',
      customer_phone: '',
      raw_customer_phone: '',
      display_phone: 'No Phone Provided',
      customer_email: '',
      booking_id: '#TR-0000',
      raw_code: 'TR-0000',
      vehicle_name: 'Tour / Rental Service',
      vehicle_number: 'MH 12 AB 1234',
      service_type: 'Outstation Tour Package',
      pax_count: '2 Pax',
      pickup_date: 'Today',
      pickup_time: '09:00 AM',
      dropoff_date: 'Return Date',
      dropoff_time: '08:00 PM',
      pickup_location: DEFAULT_PICKUP_HUB,
      total_amount: '0',
      advance_paid: '0',
      balance_amount: '0',
      security_deposit: '0',
      driver_details: 'Tour Manager: Ramesh Patil (+91 78208 02985)',
      company_name: DEFAULT_COMPANY_NAME,
      helpline_number: DEFAULT_HELPLINE_NUMBER,
      status: 'Confirmed',
      is_fleet: false,
      clean_phone: '',
      is_phone_valid: false,
    };
  }

  const rawCode =
    raw.bookingCode ||
    raw.booking_code ||
    raw.booking_no ||
    raw.bookingNo ||
    raw.id ||
    raw._id ||
    `TR-${Math.floor(1000 + Math.random() * 9000)}`;

  const bookingIdFormatted = rawCode.startsWith('#') ? rawCode : `#${rawCode}`;

  const customerName =
    raw.customerName ||
    raw.customer_name ||
    raw.customer?.name ||
    raw.fullName ||
    raw.name ||
    'Valued Customer';

  const rawCustomerPhone =
    raw.customerPhone ||
    raw.customer_phone ||
    raw.customer?.phone ||
    raw.phone ||
    raw.mobile ||
    raw.contactNumber ||
    raw.contact_number ||
    raw.userPhone ||
    raw.guestPhone ||
    raw.customerDetails?.phone ||
    raw.customerDetails?.customerPhone ||
    raw.user?.phone ||
    '';

  const cleanPhone = sanitizeWhatsAppPhone(rawCustomerPhone);
  const displayPhone = formatDisplayPhone(rawCustomerPhone);
  const isPhoneValid = isValidWhatsAppPhone(rawCustomerPhone);

  const customerEmail =
    raw.customerEmail ||
    raw.customer_email ||
    raw.customer?.email ||
    raw.email ||
    raw.user?.email ||
    '';

  const vehicleName =
    raw.vehicleId?.name ||
    raw.vehicle_snapshot?.title ||
    raw.vehicleName ||
    (isFleet ? 'Mahindra Thar 4x4 / Swift Dzire' : 'Coastal Cabz Tour Coach');

  const tourPackageName =
    raw.packageId?.title ||
    raw.packageName ||
    raw.title ||
    raw.serviceType ||
    raw.service_type ||
    'Cab Castle Tour Package';

  const serviceType = isFleet
    ? raw.serviceType || raw.service_type || 'Cab Tour Rental'
    : tourPackageName;

  const vehicleNumber =
    raw.vehicleId?.regNumber ||
    raw.vehicleId?.reg_number ||
    raw.vehicle_snapshot?.reg_number ||
    raw.vehicleNumber ||
    raw.regNumber ||
    raw.reg_number ||
    'GA 01 AB 1234';

  const paxCountNum = raw.paxCount || raw.pax_count || raw.seats || 1;
  const paxCount = `${paxCountNum} Pax`;

  const pickupRaw =
    raw.pickupDatetime ||
    raw.pickup_datetime ||
    raw.pickupDate ||
    raw.travelDate ||
    raw.startDate ||
    raw.start_date;

  const dropoffRaw =
    raw.dropoffDatetime ||
    raw.dropoff_datetime ||
    raw.dropoffDate ||
    raw.returnDate ||
    raw.endDate ||
    raw.end_date;

  const pickupDateFormatted = pickupRaw ? formatDateSafe(pickupRaw) : 'Scheduled Date';
  const pickupTimeFormatted = raw.pickupTime || raw.pickup_time || extractTime(pickupRaw, '06:00 AM');

  const dropoffDateFormatted = dropoffRaw ? formatDateSafe(dropoffRaw) : (pickupRaw ? formatDateSafe(pickupRaw) : 'Return Date');
  const dropoffTimeFormatted = raw.dropoffTime || raw.dropoff_time || extractTime(dropoffRaw, '08:00 PM');

  const pickupLocation =
    raw.pickupLocation ||
    raw.pickup_location ||
    raw.pickup_hub ||
    raw.location ||
    'Assagao Hub / Hotel / Airport';

  const totalNum = Number(
    raw.totalAmount ??
    raw.total_amount ??
    raw.totalPrice ??
    raw.totalRentalAmount ??
    raw.total_rental_amount ??
    0
  );

  const advanceNum = Number(
    raw.depositAmount ??
    raw.depositPaid ??
    raw.deposit_paid ??
    raw.advancePaid ??
    raw.advance_amount ??
    (raw.payment_status === 'Paid' ? totalNum : 0)
  );

  const balanceNum = Math.max(0, totalNum - advanceNum);

  const securityDepositNum = Number(
    raw.securityDepositAmount ??
    raw.security_deposit_amount ??
    raw.securityDeposit ??
    raw.security_deposit ??
    raw.vehicleId?.securityDeposit ??
    0
  );

  let driverDetails =
    raw.driverDetails ||
    raw.driver_details ||
    (raw.driverName || raw.driver_name
      ? `${raw.driverName || raw.driver_name} (${raw.driverPhone || raw.driver_phone || 'Contact assigned on dispatch'})`
      : 'Driver / Dispatcher: Dasgir Adur (+91 70266 48960)');

  const companyName = isFleet ? DEFAULT_CAR_RENTAL_COMPANY_NAME : DEFAULT_COMPANY_NAME;

  return {
    vertical,
    customer_name: customerName,
    customer_phone: rawCustomerPhone,
    raw_customer_phone: rawCustomerPhone,
    display_phone: displayPhone,
    customer_email: customerEmail,
    booking_id: bookingIdFormatted,
    raw_code: rawCode,
    vehicle_name: isFleet ? vehicleName : tourPackageName,
    vehicle_number: vehicleNumber,
    service_type: serviceType,
    pax_count: paxCount,
    pickup_date: pickupDateFormatted,
    pickup_time: pickupTimeFormatted,
    dropoff_date: dropoffDateFormatted,
    dropoff_time: dropoffTimeFormatted,
    pickup_location: pickupLocation,
    total_amount: totalNum.toLocaleString('en-IN'),
    advance_paid: advanceNum.toLocaleString('en-IN'),
    balance_amount: balanceNum.toLocaleString('en-IN'),
    security_deposit: securityDepositNum.toLocaleString('en-IN'),
    driver_details: driverDetails,
    company_name: companyName,
    helpline_number: DEFAULT_HELPLINE_NUMBER,
    status: raw.status || 'Confirmed',
    is_fleet: isFleet,
    clean_phone: cleanPhone,
    is_phone_valid: isPhoneValid,
  };
}

export function renderBookingTemplate(templateBody: string, bookingData: BookingDataInput | null | undefined): string {
  const details = extractBookingDetails(bookingData);

  return templateBody
    .replace(/\{customer_name\}/g, details.customer_name)
    .replace(/\{booking_id\}/g, details.booking_id)
    .replace(/\{vehicle_name\}/g, details.vehicle_name)
    .replace(/\{vehicle_number\}/g, details.vehicle_number)
    .replace(/\{service_type\}/g, details.service_type)
    .replace(/\{pax_count\}/g, details.pax_count)
    .replace(/\{pickup_date\}/g, details.pickup_date)
    .replace(/\{pickup_time\}/g, details.pickup_time)
    .replace(/\{dropoff_date\}/g, details.dropoff_date)
    .replace(/\{dropoff_time\}/g, details.dropoff_time)
    .replace(/\{pickup_location\}/g, details.pickup_location)
    .replace(/\{total_amount\}/g, details.total_amount)
    .replace(/\{advance_paid\}/g, details.advance_paid)
    .replace(/\{balance_amount\}/g, details.balance_amount)
    .replace(/\{security_deposit\}/g, details.security_deposit)
    .replace(/\{driver_details\}/g, details.driver_details)
    .replace(/\{company_name\}/g, details.company_name)
    .replace(/\{helpline_number\}/g, details.helpline_number);
}

export interface MessageTemplate {
  id: string;
  title: string;
  icon: string;
  vertical: BookingVertical;
  description: string;
  template: string;
}

export const TOUR_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tour_confirmation',
    title: 'Tour Booking Confirmation',
    icon: '🗺️',
    vertical: 'tour',
    description: 'Tour summary, travel dates, passenger count & advance receipt',
    template:
      'Namaste {customer_name} 🙏\n\nThank you for choosing *{company_name}*! Your tour package booking has been confirmed. 🌄🏕️\n\n📋 *Tour Summary:*\n• *Booking ID:* {booking_id}\n• *Tour Package:* {service_type}\n• *Travel Dates:* {pickup_date} to {dropoff_date}\n• *Travelers:* {pax_count}\n• *Pickup Point:* {pickup_location}\n\n💳 *Payment Summary:*\n• *Total Fare:* ₹{total_amount}\n• *Advance Paid:* ₹{advance_paid}\n• *Balance at Departure:* ₹{balance_amount}\n\nOur tour manager will coordinate with you prior to departure.\n\nHelpline: {helpline_number}\nHappy Travelling! 🌸\n*{company_name}*',
  },
  {
    id: 'tour_driver_allotment',
    title: 'Cab & Driver / Guide Allotment',
    icon: '🚖',
    vertical: 'tour',
    description: 'Assigned driver/guide name, phone, cab number & reporting time',
    template:
      'Namaste {customer_name} 🙏\n\nYour travel ride & tour manager have been assigned! Here are your travel details: 🚖\n\n• *Booking ID:* {booking_id}\n• *Tour Package:* {service_type}\n• *Assigned Vehicle:* {vehicle_name} ({vehicle_number})\n• *Reporting Time:* {pickup_time} on {pickup_date}\n• *Pickup Location:* {pickup_location}\n\n👨✈️ *Driver / Tour Manager:*\n• {driver_details}\n\nOur team will contact you 30 minutes before reporting time.\n\nWish you a pleasant and comfortable journey! 🌸\n*{company_name}*',
  },
  {
    id: 'tour_balance_reminder',
    title: 'Tour Balance Due Reminder',
    icon: '💰',
    vertical: 'tour',
    description: 'Balance settlement reminder for holiday & yatra packages',
    template:
      'Namaste {customer_name} 🙏\n\nThis is a friendly reminder regarding your upcoming tour with *{company_name}* ({booking_id}).\n\n• *Tour Package:* {service_type}\n• *Departure Date:* {pickup_date}\n• *Pending Balance Fare:* ₹{balance_amount}\n\nPlease settle the remaining balance via UPI or bank transfer to ensure a hassle-free journey.\n\nHelpline: {helpline_number}\nWarm regards,\n*{company_name}*',
  },
  {
    id: 'tour_itinerary_guidelines',
    title: 'Tour Itinerary & Guidelines',
    icon: '📋',
    vertical: 'tour',
    description: 'Detailed instructions, reporting time & required documents',
    template:
      'Namaste {customer_name} 🙏\n\nHere are the instructions and guidelines for your upcoming *{service_type}* tour with *{company_name}*! 🌄\n\n• *Tour Dates:* {pickup_date} to {dropoff_date}\n• *Reporting Time:* {pickup_time}\n• *Reporting Hub:* {pickup_location}\n\n📄 *Important Reminders:*\n1. Carry Original Photo ID (Aadhaar / Passport)\n2. Keep your booking ID ({booking_id}) handy\n3. Comfortable clothing and personal medicines\n\nFor 24x7 tour assistance: {helpline_number}.\n\nHave a memorable trip! 🌿\n*{company_name}*',
  },
  {
    id: 'tour_completed_thanks',
    title: 'Tour Completed & Thank You',
    icon: '🌸',
    vertical: 'tour',
    description: 'Post-tour appreciation, feedback & future travel invitation',
    template:
      'Namaste {customer_name} 🙏\n\nThank you for traveling with *{company_name}* on the *{service_type}* tour! 🌟\n\nWe hope you had a spiritual, joyful, and memorable journey. We would love to hear your feedback!\n\nWe look forward to hosting you and your family again on your next holiday trip.\n\nWarm regards,\n*{company_name}*',
  },
];

export const FLEET_TEMPLATES: MessageTemplate[] = [
  {
    id: 'self_drive_confirmation',
    title: 'Self-Drive Booking Confirmation',
    icon: '🚗',
    vertical: 'fleet',
    description: 'Car model, dates, fare breakdown, deposit & KYC documents',
    template:
      'Namaste {customer_name} 🙏\n\nThank you for choosing *{company_name}*! Your self-drive car booking has been confirmed. 🚗✨\n\n📋 *Booking Summary:*\n• *Booking ID:* {booking_id}\n• *Vehicle:* {vehicle_name}\n• *Pickup Date & Time:* {pickup_date} at {pickup_time}\n• *Drop-off Date & Time:* {dropoff_date} at {dropoff_time}\n• *Pickup Location:* {pickup_location}\n\n💳 *Payment Summary:*\n• *Total Fare:* ₹{total_amount}\n• *Advance Paid:* ₹{advance_paid}\n• *Balance at Pickup:* ₹{balance_amount}\n• *Refundable Security Deposit:* ₹{security_deposit}\n\n📄 *Documents Required at Handover:*\n1. Original Valid Driving License\n2. Aadhaar Card / Passport\n\nFor any queries or assistance, contact us at {helpline_number}.\n\nHave a safe and wonderful drive! 🌿\n*{company_name}*',
  },
  {
    id: 'vehicle_handover',
    title: 'Car Dispatch & Hub Handover',
    icon: '🔑',
    vertical: 'fleet',
    description: 'Vehicle ready notice, plate number, hub location & balance due',
    template:
      'Namaste {customer_name} 🙏\n\nYour self-drive vehicle is sanitized, inspected, and ready for pickup! 🚙💨\n\n• *Vehicle:* {vehicle_name}\n• *Vehicle Number:* {vehicle_number}\n• *Pickup Hub:* {pickup_location}\n• *Pickup Time:* {pickup_time} ({pickup_date})\n• *Pending Balance + Deposit:* ₹{balance_amount} + ₹{security_deposit}\n\nKindly carry your Original Driving License for verification.\n\n📍 Google Maps Hub Link: {pickup_location}\n📞 Hub Manager: {helpline_number}\n\nDrive safe!\n*{company_name}*',
  },
  {
    id: 'bus_rental_dispatch',
    title: 'Bus / Coach Rental Dispatch',
    icon: '🚌',
    vertical: 'fleet',
    description: 'Coach allotment, driver details, included km & dispatch notes',
    template:
      'Namaste {customer_name} 🙏\n\nYour bus / coach rental has been scheduled and dispatched! 🚌💨\n\n• *Booking ID:* {booking_id}\n• *Coach / Bus:* {vehicle_name}\n• *Vehicle Number:* {vehicle_number}\n• *Reporting Schedule:* {pickup_time} on {pickup_date}\n• *Reporting Hub:* {pickup_location}\n\n👨✈️ *Driver Details:*\n• {driver_details}\n\n💳 *Payment Summary:*\n• *Total Fare:* ₹{total_amount}\n• *Advance Paid:* ₹{advance_paid}\n• *Balance Due:* ₹{balance_amount}\n\n📞 Support / Dispatch: {helpline_number}\nHave a smooth journey!\n*{company_name}*',
  },
  {
    id: 'fleet_payment_reminder',
    title: 'Rental Balance & Deposit Reminder',
    icon: '💰',
    vertical: 'fleet',
    description: 'Balance & security deposit reminder before vehicle handover',
    template:
      'Namaste {customer_name} 🙏\n\nThis is a friendly reminder regarding your upcoming rental booking with *{company_name}* ({booking_id}).\n\n• *Vehicle:* {vehicle_name}\n• *Pickup Date:* {pickup_date}\n• *Pending Balance Amount:* ₹{balance_amount}\n• *Refundable Deposit:* ₹{security_deposit}\n\nPlease settle the balance via UPI or at vehicle handover to ensure smooth dispatch.\n\nHelpline: {helpline_number}\nWarm regards,\n*{company_name}*',
  },
  {
    id: 'rental_completed_refund',
    title: 'Rental Completed & Deposit Refund',
    icon: '🏁',
    vertical: 'fleet',
    description: 'Vehicle returned notice & security deposit refund status',
    template:
      'Namaste {customer_name} 🙏\n\nThank you for traveling with *{company_name}*! We hope you had a great driving experience with our {vehicle_name}. 🌟\n\n• *Booking ID:* {booking_id}\n• *Vehicle Returned On:* {dropoff_date}\n• *Refundable Deposit Status:* Processed / Handed Over (₹{security_deposit})\n\nWe would love to host you again on your next road trip!\n\nWarm regards,\n*{company_name}*',
  },
];

export function getTemplatesForBooking(booking: BookingDataInput | null | undefined): MessageTemplate[] {
  const vertical = getBookingVertical(booking);
  return vertical === 'tour' ? TOUR_TEMPLATES : FLEET_TEMPLATES;
}

export const TOUR_INSERTABLE_VARIABLES = [
  { tag: '{customer_name}', label: 'Customer Name' },
  { tag: '{booking_id}', label: 'Booking ID' },
  { tag: '{service_type}', label: 'Tour Package' },
  { tag: '{pickup_date}', label: 'Start Date' },
  { tag: '{dropoff_date}', label: 'Return Date' },
  { tag: '{pax_count}', label: 'Travelers (Pax)' },
  { tag: '{pickup_location}', label: 'Pickup Point' },
  { tag: '{total_amount}', label: 'Total Fare' },
  { tag: '{advance_paid}', label: 'Advance Paid' },
  { tag: '{balance_amount}', label: 'Balance Due' },
  { tag: '{driver_details}', label: 'Tour Guide / Driver' },
  { tag: '{helpline_number}', label: 'Helpline' },
];

export const FLEET_INSERTABLE_VARIABLES = [
  { tag: '{customer_name}', label: 'Customer Name' },
  { tag: '{booking_id}', label: 'Booking ID' },
  { tag: '{vehicle_name}', label: 'Vehicle Model' },
  { tag: '{vehicle_number}', label: 'Plate Number' },
  { tag: '{pickup_date}', label: 'Pickup Date' },
  { tag: '{pickup_time}', label: 'Pickup Time' },
  { tag: '{dropoff_date}', label: 'Drop Date' },
  { tag: '{dropoff_time}', label: 'Drop Time' },
  { tag: '{pickup_location}', label: 'Pickup Hub' },
  { tag: '{total_amount}', label: 'Total Fare' },
  { tag: '{advance_paid}', label: 'Advance Paid' },
  { tag: '{balance_amount}', label: 'Balance Due' },
  { tag: '{security_deposit}', label: 'Security Deposit' },
  { tag: '{driver_details}', label: 'Driver Details' },
  { tag: '{helpline_number}', label: 'Helpline' },
];

export function getRecommendedTemplateId(booking: BookingDataInput | null | undefined): string {
  const vertical = getBookingVertical(booking);
  const status = (booking?.status || '').toLowerCase();

  if (vertical === 'tour') {
    if (status.includes('complete') || status.includes('return')) return 'tour_completed_thanks';
    if (status.includes('guide') || status.includes('driver') || status.includes('allot')) return 'tour_driver_allotment';
    if (status.includes('pending') || status.includes('partial')) return 'tour_balance_reminder';
    return 'tour_confirmation';
  } else {
    const isBus = (booking?.vehicleName || booking?.serviceType || '').toLowerCase().includes('bus') || (booking?.vehicleName || '').toLowerCase().includes('urbania');
    if (status.includes('return') || status.includes('complete') || status.includes('refund')) return 'rental_completed_refund';
    if (status.includes('pickup') || status.includes('handover') || status.includes('deposit paid')) {
      return isBus ? 'bus_rental_dispatch' : 'vehicle_handover';
    }
    if (status.includes('pending') || status.includes('partial')) return 'fleet_payment_reminder';
    return isBus ? 'bus_rental_dispatch' : 'self_drive_confirmation';
  }
}

/**
 * Public Website Customer-Side WhatsApp Integrations
 */

export function createWhatsAppInquiryUrl(params: {
  hotlinePhone?: string;
  customerName: string;
  customerPhone: string;
  serviceTitle: string;
  travelDate?: string;
  notes?: string;
}): string {
  const phone = sanitizeWhatsAppPhone(params.hotlinePhone || '917026648960');
  const text =
    `*NEW INQUIRY*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 *Name:* ${params.customerName}\n` +
    `📞 *Phone:* ${params.customerPhone}\n` +
    `🧭 *Service / Package:* ${params.serviceTitle}\n` +
    `📅 *Preferred Date:* ${params.travelDate || 'Flexible'}\n` +
    `📝 *Notes:* ${params.notes || 'Please provide details & best quote.'}\n` +
    `━━━━━━━━━━━━━━━━━━━━`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function createPaymentProofWhatsAppUrl(params: {
  accountPhone?: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  amountPaid: number;
  utrNumber: string;
}): string {
  const phone = sanitizeWhatsAppPhone(params.accountPhone || '917026648960');
  const text =
    `*ADVANCE PAYMENT PROOF SUBMISSION*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🔖 *Booking Reference:* ${params.bookingCode}\n` +
    `👤 *Customer:* ${params.customerName} (${params.customerPhone})\n` +
    `💰 *Deposit Paid:* ₹${params.amountPaid.toLocaleString('en-IN')}\n` +
    `🔢 *UTR / Ref Number:* ${params.utrNumber}\n\n` +
    `_I have completed the transfer. Please find the attached screenshot for verification._`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
