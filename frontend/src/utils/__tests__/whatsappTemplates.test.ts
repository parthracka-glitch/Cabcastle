import {
  sanitizeWhatsAppPhone,
  isValidWhatsAppPhone,
  formatDisplayPhone,
  extractBookingDetails,
  renderBookingTemplate,
  getRecommendedTemplateId,
  createWhatsAppInquiryUrl,
  createPaymentProofWhatsAppUrl,
  TOUR_TEMPLATES,
  FLEET_TEMPLATES,
} from '../whatsappTemplates';

describe('WhatsApp Notification & Dispatch Engine', () => {
  describe('Phone Sanitizer & Validator', () => {
    test('sanitizes 10-digit Indian phone numbers with 91 prefix', () => {
      expect(sanitizeWhatsAppPhone('9876543210')).toBe('919876543210');
      expect(sanitizeWhatsAppPhone('+91 98765-43210')).toBe('919876543210');
      expect(sanitizeWhatsAppPhone('09876543210')).toBe('919876543210');
    });

    test('validates valid phone numbers', () => {
      expect(isValidWhatsAppPhone('9876543210')).toBe(true);
      expect(isValidWhatsAppPhone('+91 90676 17451')).toBe(true);
      expect(isValidWhatsAppPhone('')).toBe(false);
      expect(isValidWhatsAppPhone('123')).toBe(false);
    });

    test('formats phone for display', () => {
      expect(formatDisplayPhone('9876543210')).toBe('+91 98765 43210');
    });
  });

  describe('Booking Details Normalizer & Template Engine', () => {
    test('extracts booking details resiliently from diverse object structures', () => {
      const rawBooking = {
        booking_no: 'CCG-8821',
        customer: { name: 'Rahul Sharma', phone: '9876543210' },
        vehicle_snapshot: { title: 'Mahindra Thar 4x4', reg_number: 'GA 03 X 9999' },
        start_date: '2026-09-01',
        end_date: '2026-09-04',
        total_amount: 12000,
        payment_status: 'Paid',
      };

      const extracted = extractBookingDetails(rawBooking);
      expect(extracted.customer_name).toBe('Rahul Sharma');
      expect(extracted.clean_phone).toBe('919876543210');
      expect(extracted.is_fleet).toBe(true);
      expect(extracted.vehicle_name).toBe('Mahindra Thar 4x4');
    });

    test('recommends correct template based on vertical and status', () => {
      expect(getRecommendedTemplateId({ type: 'tour', status: 'Confirmed' })).toBe('tour_confirmation');
      expect(getRecommendedTemplateId({ type: 'tour', status: 'Completed' })).toBe('tour_completed_thanks');
      expect(getRecommendedTemplateId({ type: 'fleet', status: 'Confirmed' })).toBe('self_drive_confirmation');
      expect(getRecommendedTemplateId({ type: 'fleet', status: 'Vehicle Handover' })).toBe('vehicle_handover');
    });

    test('renders variables correctly inside templates', () => {
      const template = TOUR_TEMPLATES[0].template;
      const rendered = renderBookingTemplate(template, {
        customer_name: 'Aditi Rao',
        booking_code: 'TR-1001',
        service_type: 'Goa Coastal Safari',
        total_amount: 8000,
        advance_paid: 2000,
      });

      expect(rendered).toContain('Aditi Rao');
      expect(rendered).toContain('TR-1001');
      expect(rendered).toContain('Goa Coastal Safari');
      expect(rendered).toContain('₹8,000');
    });
  });

  describe('Customer-Side WhatsApp Generators', () => {
    test('generates valid inquiry URL', () => {
      const url = createWhatsAppInquiryUrl({
        hotlinePhone: '918208211478',
        customerName: 'Amit Verma',
        customerPhone: '9876543210',
        serviceTitle: 'South Goa Heritage Tour',
        travelDate: '15th Oct',
      });

      expect(url).toContain('https://wa.me/918208211478?text=');
      expect(decodeURIComponent(url)).toContain('Amit Verma');
      expect(decodeURIComponent(url)).toContain('South Goa Heritage Tour');
    });

    test('generates valid payment proof URL', () => {
      const url = createPaymentProofWhatsAppUrl({
        accountPhone: '918208211478',
        bookingCode: 'CCG-9901',
        customerName: 'Karan Patel',
        customerPhone: '9876543210',
        amountPaid: 3000,
        utrNumber: '423190823412',
      });

      expect(url).toContain('https://wa.me/918208211478?text=');
      expect(decodeURIComponent(url)).toContain('CCG-9901');
      expect(decodeURIComponent(url)).toContain('423190823412');
    });
  });
});
