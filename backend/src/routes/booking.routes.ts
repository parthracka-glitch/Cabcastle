import { Router } from 'express';
import multer from 'multer';
import {
  getCurrentUser,
  getCurrentAdmin,
  idempotencyMiddleware,
  bookingRateLimiter,
  botTrapMiddleware,
} from '../middlewares/security.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { QuoteSchema, CreateBookingSchema, CreateOfflineBookingSchema } from '../schemas/index.js';
import * as bookingController from '../controllers/booking.controller.js';
import * as authController from '../controllers/auth.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

export const bookingsRouter = Router();

// Public Rate-Limited Booking & Fare endpoints
bookingsRouter.post(
  '/bookings/quote',
  bookingRateLimiter,
  validateBody(QuoteSchema),
  bookingController.calculateQuote
);

bookingsRouter.post(
  '/bookings',
  bookingRateLimiter,
  botTrapMiddleware(),
  validateBody(CreateBookingSchema),
  idempotencyMiddleware(300),
  bookingController.createBooking
);

bookingsRouter.post(
  '/bookings/upload-document',
  upload.single('file'),
  authController.uploadDocument
);

bookingsRouter.get('/bookings/:booking_id', bookingController.getBookingById);
bookingsRouter.get('/customer/bookings/search', bookingController.searchCustomerBookings);
bookingsRouter.get('/bookings/:booking_id/invoice', bookingController.downloadInvoice);

// Customer Authenticated Self-Service (IDOR Protected)
bookingsRouter.post(
  '/customer/bookings/:booking_id/reschedule',
  getCurrentUser,
  bookingController.rescheduleBooking
);

bookingsRouter.post(
  '/customer/bookings/:booking_id/cancel',
  getCurrentUser,
  bookingController.cancelBooking
);

// Payment endpoints
bookingsRouter.post('/payments/create-order', bookingController.createPaymentOrder);
bookingsRouter.post('/payments/verify', idempotencyMiddleware(300), bookingController.verifyPayment);
bookingsRouter.post('/bookings/:booking_id/verify-payment', idempotencyMiddleware(300), bookingController.verifyPayment);

// Admin Booking Management endpoints
bookingsRouter.get('/admin/bookings', getCurrentAdmin, bookingController.listAdminBookings);
bookingsRouter.post('/admin/bookings/offline', getCurrentAdmin, validateBody(CreateOfflineBookingSchema), bookingController.createOfflineBooking);
bookingsRouter.patch('/admin/bookings/:booking_id/status', getCurrentAdmin, bookingController.updateBookingStatus);
bookingsRouter.patch('/admin/bookings/:booking_id/reschedule', getCurrentAdmin, bookingController.rescheduleBooking);
bookingsRouter.post('/admin/bookings/:booking_id/refund', getCurrentAdmin, bookingController.refundBooking);
bookingsRouter.get('/admin/bookings/calendar-summary', getCurrentAdmin, bookingController.getCalendarSummary);
bookingsRouter.get('/admin/bookings/by-date', getCurrentAdmin, bookingController.getBookingsByDate);
