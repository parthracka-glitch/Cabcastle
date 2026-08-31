# MIGRATION MAP: Drivehub Goa (FastAPI/Python -> MERN + TypeScript)

This document presents a zero-breakage full audit and migration map for re-platforming **Drivehub Goa** to a full MERN stack (MongoDB, Express.js, React, Node.js) with TypeScript end-to-end.

---

## 1. Executive Summary & Migration Objective
- **Source Architecture**: Python 3.12, FastAPI, Motor (`AsyncIOMotorClient`), Pydantic v2, ReportLab, Openpyxl, PyJWT, Passlib/Bcrypt.
- **Target Architecture**: Node.js v20+, Express.js v4+ (with TypeScript `express`), Mongoose v8+ (MongoDB ODM), `pdfkit` / HTML-to-PDF invoice engine, `exceljs` export engine, `jsonwebtoken`, `bcryptjs`, React 18 + Vite + TypeScript.
- **Core Principle**: Strict Re-platforming (ZERO Breakage). All API contracts, route paths, payload structures, HTTP status codes, error response formats, database document structures, frontend routes, forms, query parameters, state flows, and PDF/Excel export formats MUST be preserved 1:1.

---

## 2. Backend Audit & API Contract Specification

### 2.1 Server Configuration & Environment Variables
| Environment Variable | Source Default / Example | MERN Target Usage |
| :--- | :--- | :--- |
| `PORT` | `8000` | Express server port (default 8000) |
| `MONGO_URL` | `mongodb://localhost:27017` | Mongoose connection string |
| `DB_NAME` | `drivehub_goa` | MongoDB database name |
| `JWT_SECRET` | `default_secret_dh_goa_prod_2026` | JWT signing secret |
| `ADMIN_EMAIL` | `admin@drivehubgoa.com` | Initial admin account email |
| `ADMIN_PASSWORD` | `Admin@123` | Initial admin account password |
| `CORS_ORIGINS` | `*` | Allowed CORS origins (comma-separated or `*`) |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Cloudinary SDK configuration |
| `CLOUDINARY_API_KEY` | `your_api_key` | Cloudinary SDK key |
| `CLOUDINARY_API_SECRET` | `your_api_secret` | Cloudinary SDK secret |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth token verification |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth token verification |
| `EMAIL_BASE_URL` | Optional | Transactional email REST service URL |
| `EMAIL_KEY` | Optional | Transactional email API header key (`X-Email-Key`) |
| `EMAIL_FROM_NAME` | `Drivehub Goa` | Transactional email sender display name |

### 2.2 Cross-Cutting Concerns & Middleware
1. **Security Headers Middleware**:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: geolocation=(), microphone=(), camera=()`
2. **Rate Limiter Middleware**:
   - In-memory sliding window (max 120 requests per 60 seconds) on sensitive POST endpoints (`/auth/` and `/bookings`).
   - Error Response: HTTP `429 Too Many Requests` -> `{"detail": "Rate limit exceeded. Please try again later."}`.
3. **CORS Middleware**:
   - Parses `CORS_ORIGINS`. Supports credentials (`credentials: true`), allowed methods `*`, allowed headers `*`.
4. **Authentication Middleware**:
   - `get_current_user`: Extracts token from `Authorization: Bearer <token>` header or `access_token` cookie. Decodes JWT using `JWT_SECRET` (HS256). Looks up user by `id`. Returns HTTP `401 Unauthorized` -> `{"detail": "Not authenticated" | "Token expired" | "Invalid token" | "User not found"}`.
   - `get_current_admin`: Performs `get_current_user` checks + verifies `user.role === 'admin'`. Returns HTTP `403 Forbidden` -> `{"detail": "Admin access required"}` if not admin.
5. **Startup & Automated Database Seeding**:
   - Verifies MongoDB connection and ensures collection indexes (`users.email` unique, `vehicles.id` unique, `vehicles.reg_no` unique, `coupons.code` unique, `bookings` compound `{ vehicle_id: 1, start_date: 1, end_date: 1 }`, `bookings.status`, `bookings.customer.email`).
   - Seeds Admin User (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) if missing or updates password if hash mismatch.
   - Seeds Demo Customer (`demo@drivehub.goa` / `Demo@1234`).
   - Seeds 21 Default Vehicles if `vehicles` collection is empty.
   - Seeds Default Coupons (`GOA10`, `FLAT500`) if `coupons` collection is empty.

---

### 2.3 Backend API Endpoints Master Map

| Method | Path | Auth Required | Parameters / Query | Request Body | Success Response (200/201) | Error Codes & Details |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | None | None | None | `{"status": "online", "service": "Drivehub Goa API", "version": "2.0.0", "health": "/api/healthz", "docs": "/docs"}` | None |
| `GET` | `/api/` | None | None | None | `{"status": "ok", "app": "Drivehub Goa"}` | None |
| `GET` | `/api/healthz`, `/api/health` | None | None | None | `{"status": "healthy" \| "degraded", "database": "connected" \| "disconnected", "service": "drivehub-goa-backend"}` | None |
| `POST` | `/api/auth/register` | None | None | `{ name, phone, email, password }` | `{ token, user: { id, email, name, phone, role } }` + Cookie `access_token` | `400`: `{"detail": "An account with this email already exists"}` |
| `POST` | `/api/auth/login` | None | None | `{ email, password }` | `{ token, user: { id, email, name, phone, role } }` + Cookie `access_token` | `401`: `{"detail": "Invalid email or password"}` |
| `POST` | `/api/auth/google` | None | None | `{ email, name, picture?, google_id?, id_token? }` | `{ token, user: { id, email, name, phone, role, picture } }` + Cookie `access_token` | `500`: `{"detail": "Database uninitialized"}` |
| `GET` | `/api/auth/me` | User | None | None | User object (without `password_hash` and `_id`) | `401`: `{"detail": "Not authenticated" \| "Token expired" \| "Invalid token"}` |
| `POST` | `/api/auth/logout` | None | None | None | `{"ok": true}` (clears `access_token` cookie) | None |
| `POST` | `/api/admin/upload-photo` | Admin | Multipart Form | `file: UploadFile` | `{"url": "https://res.cloudinary.com/..."}` | `500`: `{"detail": "Image upload failed: <err>"}` |
| `GET` | `/api/vehicles` | None | `category?`, `status_filter?`, `q?` | None | `Vehicle[]` (triggers status auto-flip) | None |
| `GET` | `/api/vehicles/:vehicle_id` | None | `vehicle_id` (path) | None | `Vehicle` | `404`: `{"detail": "Vehicle not found"}` |
| `POST` | `/api/admin/vehicles` | Admin | None | `VehicleIn` schema | Created `Vehicle` (with generated `id`, `created_at`) | `422`: Validation error |
| `PUT` | `/api/admin/vehicles/:vehicle_id` | Admin | `vehicle_id` (path) | `VehicleIn` schema | Updated `Vehicle` | `404`: `{"detail": "Vehicle not found"}` |
| `DELETE` | `/api/admin/vehicles/:vehicle_id` | Admin | `vehicle_id` (path) | None | `{"ok": true}` | `404`: `{"detail": "Vehicle not found"}` |
| `POST` | `/api/bookings/quote` | None | None | `BookingCreateIn` | `{ vehicle, days, base_amount, addon_amount, airport_surcharge, discount, coupon_code, tax, total_amount }` | `404`: Vehicle not found |
| `POST` | `/api/bookings` | None | None | `BookingCreateIn` | Created `Booking` object | `400`: `{"detail": "This vehicle is already booked for the selected date range."}` |
| `GET` | `/api/bookings/:booking_id` | None | `booking_id` (path) | None | `Booking` object | `404`: `{"detail": "Booking not found"}` |
| `GET` | `/api/customer/bookings/search` | None | `q` (query) | None | `Booking[]` (with embedded `vehicle`) | None (returns `[]` if `q` length < 3) |
| `GET` | `/api/admin/bookings` | Admin | `q?`, `status_filter?`, `source?` | None | `Booking[]` sorted by `created_at` desc | None |
| `POST` | `/api/admin/bookings/offline` | Admin | None | `OfflineBookingIn` | Created `Booking` object | `400`: Overlapping booking conflict |
| `PATCH` | `/api/admin/bookings/:booking_id/status` | Admin | `booking_id` (path) | `{ status }` | Updated `Booking` object | `404`: `{"detail": "Not found"}` |
| `PATCH` | `/api/admin/bookings/:booking_id/reschedule` | Admin | `booking_id` (path) | `{ new_start_date }` | Updated `Booking` object | `400`: Invalid date format, `404`: Booking not found |
| `GET` | `/api/admin/bookings/calendar-summary` | Admin | `year`, `month` | None | Object keyed by `YYYY-MM-DD` with metrics | `400`: `{"detail": "Invalid month"}` |
| `GET` | `/api/admin/bookings/by-date` | Admin | `date` (`YYYY-MM-DD`) | None | `{ date, count, pickups_count, returns_count, ongoing_count, bookings: [...] }` | `400`: `{"detail": "Invalid date. Use YYYY-MM-DD"}` |
| `POST` | `/api/payments/create-order` | None | None | `{ booking_id }` | `{ order_id, amount, currency: "INR", key_id, booking_no }` | `404`: `{"detail": "Booking not found"}` |
| `POST` | `/api/payments/verify` | None | None | `{ booking_id, razorpay_order_id, razorpay_payment_id, razorpay_signature }` | `{ ok: true, booking }` + triggers transactional email | `400`: `{"detail": "Invalid signature"}` |
| `GET` | `/api/bookings/:booking_id/invoice` | None | `booking_id` (path), `fmt?` | None | PDF Stream (`application/pdf`) or HTML (`text/html`) | `404`: `{"detail": "Booking not found"}` |
| `POST` | `/api/coupons/validate` | None | None | `{ code, amount }` | `{ code, type, value, discount }` | `400`: Invalid, expired, or subtotal too low |
| `GET` | `/api/admin/coupons` | Admin | None | None | `Coupon[]` (with auto-expiration check) | None |
| `POST` | `/api/admin/coupons` | Admin | None | `CouponIn` | Created `Coupon` | `400`: `{"detail": "Coupon code already exists"}` |
| `PUT` | `/api/admin/coupons/:coupon_id` | Admin | `coupon_id` (path) | `CouponIn` | Updated `Coupon` | `404`: `{"detail": "Not found"}` |
| `DELETE` | `/api/admin/coupons/:coupon_id` | Admin | `coupon_id` (path) | None | `{"ok": true}` | `404`: `{"detail": "Not found"}` |
| `GET` | `/api/admin/enquiries` | Admin | `q?`, `city_filter?`, `status_filter?` | None | `{ items, total_enquiries, city_analytics, top_city }` | None |
| `POST` | `/api/admin/enquiries` | Admin | None | `EnquiryIn` | Created `Enquiry` (with `enquiry_no`) | None |
| `PATCH` | `/api/admin/enquiries/:enquiry_id/status` | Admin | `enquiry_id` (path) | `{ status }` | Updated `Enquiry` | `404`: `{"detail": "Enquiry not found"}` |
| `DELETE` | `/api/admin/enquiries/:enquiry_id` | Admin | `enquiry_id` (path) | None | `{"ok": true}` | `404`: `{"detail": "Enquiry not found"}` |
| `GET` | `/api/admin/export/enquiries/excel` | Admin | None | None | Excel file stream (`.xlsx`) | None |
| `GET` | `/api/admin/analytics` | Admin | None | None | Metrics object (`total_revenue`, `fleet_utilization_pct`, etc.) | None |
| `GET` | `/api/admin/export/excel` | Admin | None | None | Excel file stream (`.xlsx`) | None |
| `GET` | `/api/reviews` | None | None | None | Array of 6 static review objects | None |
| `GET` | `/api/locations` | None | None | None | `{ free_hubs, airports, airport_surcharge_min, airport_surcharge_max }` | None |
| `GET` | `/api/trip-planner` | None | None | None | Array of 3 trip itinerary items | None |

---

## 3. Database Audit & Mongoose Schema Mapping

### 3.1 `User` Schema
- **Collection Name**: `users`
- **TypeScript Interface & Mongoose Schema**:
  ```typescript
  export interface IUser {
    id: string; // UUIDv4
    email: string;
    name: string;
    phone?: string;
    password_hash?: string;
    role: 'admin' | 'customer';
    google_id?: string;
    picture?: string;
    created_at: string; // ISO-8601
  }
  ```
- **Indexes**: `email` (unique).

### 3.2 `Vehicle` Schema
- **Collection Name**: `vehicles`
- **TypeScript Interface & Mongoose Schema**:
  ```typescript
  export interface IVehicle {
    id: string; // UUIDv4
    title: string;
    reg_no: string;
    category: 'Sedan' | 'SUV' | 'Hatchback' | 'Convertible' | 'Thar 4x4';
    fuel_type: 'Petrol' | 'Diesel' | 'EV';
    transmission: 'Manual' | 'Automatic';
    seating: number; // 2..9
    daily_rate: number;
    security_deposit: number;
    image_url: string;
    status: 'Available' | 'Booked' | 'Maintenance';
    description?: string;
    created_at: string;
  }
  ```
- **Indexes**: `id` (unique), `reg_no` (unique).

### 3.3 `Booking` Schema
- **Collection Name**: `bookings`
- **TypeScript Interface & Mongoose Schema**:
  ```typescript
  export interface IBookingCustomer {
    name: string;
    phone: string;
    email: string;
    aadhar?: string;
  }
  export interface IAddOns {
    helmets: number;
    infant_seat: boolean;
    airport_pickup: boolean;
  }
  export interface IBooking {
    id: string; // UUIDv4
    booking_no: string; // DHG-YYMMDD-XXXX or DHG-OFF-YYMMDD-XXXX
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
    start_date: string; // ISO-8601
    end_date: string; // ISO-8601
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
    payment_status: 'Pending' | 'Paid' | 'Partial';
    payment_method: 'Razorpay' | 'Cash' | 'UPI' | 'Card' | 'Other';
    razorpay_order_id?: string | null;
    razorpay_payment_id?: string | null;
    razorpay_signature?: string | null;
    source: 'Online' | 'Offline';
    status: 'Confirmed' | 'Completed' | 'Cancelled';
    notes?: string;
    created_at: string;
  }
  ```
- **Indexes**: `id` (unique), `booking_no` (unique), compound `{ vehicle_id: 1, start_date: 1, end_date: 1 }`, `status: 1`, `customer.email: 1`.

### 3.4 `Coupon` Schema
- **Collection Name**: `coupons`
- **TypeScript Interface & Mongoose Schema**:
  ```typescript
  export interface ICoupon {
    id: string;
    code: string; // Uppercase
    type: 'Percentage' | 'Fixed';
    value: number;
    min_amount: number;
    expiry: string;
    active: boolean;
    is_expired?: boolean;
    created_at: string;
  }
  ```
- **Indexes**: `code` (unique).

### 3.5 `Enquiry` Schema
- **Collection Name**: `enquiries`
- **TypeScript Interface & Mongoose Schema**:
  ```typescript
  export interface IEnquiry {
    id: string;
    enquiry_no: string; // ENQ-YYMMDD-XXXX
    customer_name: string;
    phone: string;
    email?: string;
    city: string;
    car_model_interested: string;
    source: 'Phone Call' | 'WhatsApp' | 'Walk-in' | 'Website' | 'Instagram' | 'Referral' | 'Other';
    status: 'New' | 'Contacted' | 'Follow-up' | 'Converted' | 'Lost';
    notes?: string;
    created_at: string;
  }
  ```
- **Indexes**: `id` (unique), `enquiry_no` (unique).

---

## 4. Frontend Audit & Route / Component Blueprint

### 4.1 Pages & Routing (React Router v6)
- `/` -> `Landing.jsx` (Customer landing page)
- `/fleet` -> `FleetPage.jsx` (Car catalog page with category and search filters)
- `/booking/:vehicleId` -> `BookingPage.jsx` (Protected customer booking flow)
- `/booking-success/:bookingId` -> `BookingSuccess.jsx` (Booking receipt & invoice download)
- `/login` -> `CustomerAuth.jsx` (Customer authentication)
- `/signup` -> `CustomerAuth.jsx` (Customer registration)
- `/admin/login` -> `AdminLogin.jsx` (Admin login)
- `/admin` -> `AdminLayout.jsx` (Admin shell with Sidebar/Navbar navigation)
  - `/admin` (index) -> `Dashboard.jsx` (Executive business metrics, CRM stats, offline booking modal)
  - `/admin/calendar` -> `CalendarView.jsx` (Interactive fleet timeline grid)
  - `/admin/fleet` -> `FleetManage.jsx` (Vehicle management CRUD)
  - `/admin/bookings` -> `BookingsManage.jsx` (Booking management, status updates, rescheduling)
  - `/admin/coupons` -> `CouponsManage.jsx` (Coupon code management)

### 4.2 State Management & Client API Layer
- **Auth Context**: `AuthContext.jsx` manages `user`, `loading`, `login()`, `loginWithGoogle()`, `logout()`. Stores token in `localStorage.setItem("dh_token")` and httpOnly cookie.
- **API Helper**: `src/lib/api.js` configures `axios` instance with `baseURL = REACT_APP_BACKEND_URL/api` and `withCredentials: true`. Attaches `Authorization: Bearer <dh_token>` header.

---

## 5. Technology Stack Mapping (Zero-Breakage Re-platform)

| Layer | Source Stack | MERN Target Stack | Selection Rationale |
| :--- | :--- | :--- | :--- |
| **Language** | Python 3.12 (Backend) + JS (Frontend) | **TypeScript 5.x** (End-to-End) | Strict type safety, single language across full stack |
| **Backend Framework** | FastAPI (ASGI / Python) | **Express.js** + `express` TS definitions | Industry standard Node.js server framework, 1:1 route matching |
| **Database ODM** | Motor (`AsyncIOMotorClient`) | **Mongoose v8** | High-performance MongoDB ODM with strong TypeScript schema definitions |
| **Password Security** | Passlib / Bcrypt | **`bcryptjs`** | 1:1 password verification compatibility with standard bcrypt hashes |
| **JWT Library** | PyJWT | **`jsonwebtoken`** | 1:1 JWT creation & verification with identical secret and HS256 algorithm |
| **File Upload CDN** | Cloudinary Python SDK | **Cloudinary Node.js SDK** + `multer` | Identical Cloudinary upload folder (`drivehub_goa`) and public URL format |
| **PDF Generation** | ReportLab (Python) | **`pdfkit`** | Direct PDF byte buffer generation with identical A4 dimensions and styling |
| **Excel Export** | Openpyxl (Python) | **`exceljs`** | Generates identical formatted `.xlsx` workbooks for Bookings and Enquiries |
| **Frontend Framework**| React 18 (CRA / JS) | **React 18 + Vite + TypeScript** | Modern fast build tool, full TypeScript support, identical UI components |
| **Styling** | Tailwind CSS v3 | **Tailwind CSS v3** | Identical design system tokens, color palette, and custom utility classes |

---

## 6. Migration Execution Plan Checklist
1. **Phase 1: Node.js / Express TypeScript Backend Initialization**
   - Setup `package.json`, `tsconfig.json`, Mongoose connection (`db.ts`), config environment variables (`config.ts`), security headers and rate limiter middleware (`middleware/security.ts`).
2. **Phase 2: Database Models & Business Logic Services**
   - Translate MongoDB models to Mongoose Schemas with identical UUIDv4 primary keys and indexes.
   - Implement `bookingService.ts` for fare calculation (`calc_fare`), vehicle availability checks (`check_vehicle_available`), vehicle status auto-flipping (`refresh_vehicle_status`), and coupon auto-expiration (`refresh_coupon_statuses`).
3. **Phase 3: Route Handlers & Utilities Porting**
   - Re-implement all 42 REST endpoints across Auth, Vehicles, Bookings, Coupons, Enquiries, Admin, and Public controllers.
   - Re-create PDF generator (`pdfKitGenerator.ts`), HTML invoice renderer (`htmlInvoiceGenerator.ts`), and Excel exporter (`excelExporter.ts`).
4. **Phase 4: Frontend TypeScript Migration**
   - Migrate React frontend codebase to TypeScript (`.tsx`/`.ts`), retaining all components, UI designs, Radix UI primitives, Framer Motion animations, Sonner toasts, and Lucide icons.
5. **Phase 5: Verification & Zero-Breakage Testing**
   - Run complete backend test suite against the Express API server to confirm 100% endpoint pass rate and identical JSON responses.
