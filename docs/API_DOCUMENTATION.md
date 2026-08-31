# DriveHub Goa — REST API Reference Documentation

**Base API URL:** `/api` (or `http://localhost:8000/api` in development)  
**Authentication:** JWT Bearer Token in `Authorization: Bearer <token>` header or `access_token` HttpOnly Cookie.  
**Content-Type:** `application/json` (or `multipart/form-data` for file uploads)

---

## 1. System & Public Endpoints

### `GET /api/healthz` or `GET /api/health`
Returns real-time backend operational status, uptime, and database connection state.

**Response `200 OK`:**
```json
{
  "ok": true,
  "status": "healthy",
  "database": "connected",
  "service": "drivehub-goa-backend",
  "version": "2.0.0",
  "uptime_seconds": 1420,
  "timestamp": "2026-08-21T01:30:00.000Z"
}
```

### `GET /api/locations`
Returns delivery locations, airport hubs, and surcharge brackets.

### `GET /api/reviews`
Returns verified customer reviews and ratings.

### `GET /api/trip-planner`
Returns curated Goan itineraries and route recommendations.

---

## 2. Public Fleet & Vehicle Endpoints

### `GET /api/vehicles`
List active fleet vehicles with optional category, status, and text search filtering.

**Query Parameters:**
- `category` (optional): `All` | `Sedan` | `SUV` | `Hatchback` | `Convertible` | `Thar 4x4`
- `status_filter` (optional): `All` | `Available` | `Booked` | `Maintenance`
- `q` (optional): Free-text search matching vehicle title or registration number.

### `GET /api/vehicles/:vehicle_id`
Retrieve detailed metadata, multi-image gallery URLs (up to 5 photos), transmission rates, and specifications for a single vehicle.

---

## 3. Customer Authentication & Profile

### `POST /api/auth/register`
Create a new customer account.

**Request Body:**
```json
{
  "name": "Kushal Patel",
  "email": "kushal@example.com",
  "phone": "+91 98765 43210",
  "password": "StrongPassword@123"
}
```

### `POST /api/auth/login`
Authenticate a customer or admin with email and password.

### `POST /api/auth/google`
Authenticate using Google Sign-In identity token.

### `GET /api/auth/me`
Retrieve authenticated user profile (Customer or Admin). Requires JWT.

### `PUT /api/auth/profile`
Update customer profile details, driving license, and Aadhaar documents.

### `POST /api/auth/change-password`
Update customer account password.

### `POST /api/auth/logout`
Clear session cookie and invalidate login state.

---

## 4. Booking, Quotes & Payments

### `POST /api/bookings/quote`
Calculate real-time rental pricing, duration days, airport surcharges, add-on costs, coupon discounts, and GST.

**Request Body:**
```json
{
  "vehicle_id": "v-thar-4x4",
  "start_date": "2026-09-01T10:00:00.000Z",
  "end_date": "2026-09-04T10:00:00.000Z",
  "pickup_location": "Candolim (Main Hub)",
  "airport_pickup": false,
  "add_ons": { "helmets": 0, "infant_seat": false, "airport_pickup": false },
  "coupon_code": "GOA10",
  "transmission_choice": "Automatic"
}
```

### `POST /api/bookings`
Submit and confirm a new customer booking. Protected with 300s idempotency lock and concurrent double-booking mutex.

### `POST /api/bookings/upload-document`
Upload customer Aadhaar or Driving License to Cloudinary (`drivehub_goa/kyc_documents`). Accepts `multipart/form-data`.

### `GET /api/bookings/:booking_id`
Retrieve booking status, summary snapshot, and customer metadata.

### `GET /api/customer/bookings/search?q={query}`
Retrieve customer bookings isolated by email, phone, or booking number.

### `GET /api/bookings/:booking_id/invoice?fmt=pdf|html`
Download or stream invoice in PDF format (using PDFKit) or HTML responsive view.

### `POST /api/payments/create-order`
Create Razorpay order instance for payment collection.

### `POST /api/payments/verify` *(Alias: `POST /api/bookings/:booking_id/verify-payment`)*
Verify Razorpay HMAC payment signature, mark booking as `Paid`, and send confirmation email.

---

## 5. Public & Admin Coupon System

### `GET /api/coupons/public`
List all currently active and non-expired owner coupons for display on the checkout drawer.

### `POST /api/coupons/validate`
Validate coupon code eligibility against booking cart total.

### `GET /api/admin/coupons` *(Admin only)*
List all coupon codes including expired and inactive codes.

### `POST /api/admin/coupons` *(Admin only)*
Create a new discount coupon (Percentage or Fixed amount).

### `PUT /api/admin/coupons/:coupon_id` *(Admin only)*
Update coupon expiry, discount value, minimum cart amount, or active toggle.

### `DELETE /api/admin/coupons/:coupon_id` *(Admin only)*
Soft-delete coupon.

---

## 6. Executive CRM & Fleet Management

*(Requires Admin Role — JWT with `role: 'admin'`)*

### `GET /api/admin/analytics`
Instant dashboard analytics: Total revenue, active bookings, fleet utilization %, occupancy rate, 6-month revenue series, and weekly peak dispatch chart.

### `GET /api/admin/bookings`
Searchable and filterable master bookings table. Supports `q`, `status_filter`, and `source` (`Online` vs `Offline`).

### `POST /api/admin/bookings/offline`
Create walk-in or offline direct booking.

### `PATCH /api/admin/bookings/:booking_id/status`
Update booking status (`Confirmed`, `Completed`, `Cancelled`). Automatically syncs vehicle availability.

### `PATCH /api/admin/bookings/:booking_id/reschedule`
Reschedule booking dates with automatic vehicle collision check.

### `POST /api/admin/bookings/:booking_id/refund`
Process customer refund (full or partial) with audit reason logging, payment status update to `Refunded`, and immediate vehicle release.

### `GET /api/admin/bookings/calendar-summary?year=YYYY&month=M`
Retrieve monthly booking timeline density and dispatch schedule matrix.

### `GET /api/admin/bookings/by-date?date=YYYY-MM-DD`
Retrieve day-specific dispatch sheet with pickups, returns, and ongoing rentals.

### `POST /api/admin/vehicles`
Create a new vehicle listing with 5-slot image gallery support.

### `PUT /api/admin/vehicles/:vehicle_id`
Update vehicle title, rates (manual/automatic), status, seating, category, or reorder cover photo.

### `DELETE /api/admin/vehicles/:vehicle_id`
Soft-delete vehicle from active inventory.

### `POST /api/admin/upload-photo`
Upload vehicle photo to Cloudinary organized by dynamic vehicle folder (`drivehub_goa/vehicles/<car_slug>`).

### `GET /api/admin/enquiries`
List customer enquiries with lead conversion funnel and city-wise demand analytics.

### `POST /api/admin/enquiries`
Log a new phone call, WhatsApp, or walk-in enquiry.

### `PATCH /api/admin/enquiries/:enquiry_id/status`
Update enquiry lead status (`New`, `Contacted`, `Follow-up`, `Converted`, `Lost`).

### `DELETE /api/admin/enquiries/:enquiry_id`
Delete enquiry record.

### `GET /api/admin/export/excel`
Stream Excel (`.xlsx`) workbook of all bookings.

### `GET /api/admin/export/pdf` (Alias: `/api/admin/export/bookings/pdf`)
Stream Executive Bookings Abstract PDF report with cover statistics, individual booking KYC sheets, and summary roster table.

### `GET /api/admin/export/enquiries/excel`
Stream Excel (`.xlsx`) workbook of all customer enquiries and leads.

### `GET /api/admin/settings` & `PUT /api/admin/settings`
Get/update executive contact info, support email, auto-confirm toggle, and notification preferences.

### `POST /api/admin/change-password`
Update admin account password.
