# Cab Castle Goa — System Architecture, User Flows & Data Flow Specification

**Version:** 2.0.0 (Enterprise Release)  
**Date:** September 2026  
**Stack:** React 18 (CRA / Tailwind / CSS Tokens), Node.js (Express / TypeScript), MongoDB (Mongoose), Cloudinary CDN, Google OAuth 2.0, Razorpay

---

## 1. System Architecture Overview

```mermaid
graph TD
    subgraph Client Layer
        Web[Web / Mobile Customer Browser]
        AdminCRM[Admin CRM Dashboard]
    end

    subgraph CDN & Auth
        Cloudinary[Cloudinary CDN - Vehicle Photos]
        GoogleOAuth[Google OAuth 2.0 / GSI]
    end

    subgraph Backend Layer (Node.js + Express + TS)
        API[Express REST API - Port 8000]
        Security[Security Middleware: Rate Limit, Helmet, JWT, CSRF]
        AuthCtrl[Auth Controller]
        BookingCtrl[Booking Controller]
        VehicleCtrl[Vehicle Controller]
        PaymentCtrl[Payment & Razorpay Controller]
        AdminCtrl[Admin & Analytics Controller]
    end

    subgraph Data Layer
        MongoDB[(MongoDB Database: cab_castle_goa)]
    end

    Web -->|HTTP / JSON| API
    AdminCRM -->|HTTP / Bearer JWT| API
    Web -->|Google Sign-In Token| GoogleOAuth
    AdminCRM -->|Image Upload Multi-part| API
    API -->|Base64 Data URI| Cloudinary
    API -->|Mongoose Queries .lean()| MongoDB
```

---

## 2. Comprehensive User Flows

### 2.1 Customer Booking Flow (Online Web Experience)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 👤 Customer
    participant UI as 🖥️ Fleet & Booking UI
    participant Auth as 🔐 AuthContext / Google
    participant API as ⚙️ Express Backend API
    participant DB as 🗄️ MongoDB

    Customer->>UI: Lands on Home / Fleet page (`/`, `/fleet`)
    UI->>API: GET `/api/vehicles` (Cached 60s)
    API->>DB: VehicleModel.find({ is_deleted: false })
    DB-->>API: Active vehicles with Cloudinary photos
    API-->>UI: Vehicle Catalog JSON
    UI-->>Customer: Renders Responsive Fleet Grid with Filters & Features

    Customer->>UI: Clicks "Book Now" or selects vehicle (`/booking/:id`)
    UI->>API: GET `/api/vehicles/:id`
    API-->>UI: Full specs & multi-image gallery
    UI-->>Customer: Step 1: Car details, fullscreen lightbox preview, rate picker, duration & dates

    Customer->>UI: Selects Dates, Pickup Location & clicks "Continue"
    UI-->>Customer: Step 2: Guest Details (Name, Phone, Email, Aadhaar ID)

    alt Customer opts for Google 1-Click Login
        Customer->>Auth: Clicks Google Sign In
        Auth->>API: POST `/api/auth/google` (id_token)
        API->>DB: Upsert Customer Record
        API-->>Auth: JWT Cookie + User Session
        Auth-->>UI: Auto-fills Name, Email, Phone
    end

    Customer->>UI: Clicks "Confirm & Book Car"
    UI->>API: POST `/api/bookings`
    API->>DB: BookingModel.create({ status: 'Confirmed', payment_status: 'Pending' })
    DB-->>API: Saved Booking Record
    API-->>UI: Booking Voucher Object with `booking_no` (e.g. `CCG-82914`)
    UI-->>Customer: Redirects to `/booking-success/:bookingId` (Voucher, WhatsApp Dispatch Button, PDF Download)
```

**Step-by-Step Breakdown:**
1. **Fleet Exploration:** Customer selects from Hatchback, Sedan, SUV, or Premium models. Real-time rates calculate per day or 8h/80km packages.
2. **Interactive Vehicle Gallery:** Customer can view photos, and click to open a high-res fullscreen zoomable Lightbox.
3. **Step 1 — Itinerary & Schedule:** Selection of Service Type (Hourly Sightseeing Package vs. Airport Transfer: Mopa / Dabolim / Margao / Thivim), Start Date, Start Time, End Date, Drop Time.
4. **Step 2 — Guest Verification:** Captures Name, WhatsApp Phone, Email, and Government ID (Aadhaar).
5. **Zero Advance Reservation:** Booking confirmed immediately without mandatory payment friction; pay-to-driver on trip completion.
6. **Voucher & WhatsApp Integration:** Automated WhatsApp dispatch message pre-filled with pickup coordinates and booking details.

---

### 2.2 Admin Offline Booking Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 👨‍💼 Admin / Dispatcher
    participant CRM as 📊 CRM Dashboard (`/admin`)
    participant API as ⚙️ Backend API
    participant DB as 🗄️ MongoDB

    Admin->>CRM: Navigates to Bookings or Dashboard
    Admin->>CRM: Opens "Create Offline Booking" Modal
    Admin->>CRM: Selects Vehicle, Customer Details, Dates & Custom Agreed Rate
    Admin->>API: POST `/api/admin/bookings/offline` (Bearer Token)
    API->>DB: Creates Booking record marked `source: "offline"`, status `Confirmed`
    DB-->>API: Created Booking Document
    API-->>CRM: 201 Created & triggers real-time fleet calendar update
    CRM-->>Admin: Success notification + Instant PDF Invoice Generator
```

---

### 2.3 Authentication Flows

#### A. Customer Email/Password Registration & Login
- **Sign Up:** `POST /api/auth/register` with Name, Phone, Email, Password. Password is validated for minimum strength and hashed with `bcryptjs` (salt rounds: 10).
- **Sign In:** `POST /api/auth/login` checks credentials, issues HttpOnly secure JWT cookie `access_token` (24-hour expiration) and JSON response payload.
- **Session Persistence:** `GET /api/auth/me` validates token and returns active session state.

#### B. Google OAuth 2.0 Flow
- Customer clicks Google Sign-In button powered by Google Identity Services (GSI).
- Client acquires Google `id_token` JWT.
- Backend `POST /api/auth/google` verifies the `id_token` with Google OAuth tokeninfo service using `GOOGLE_CLIENT_ID`.
- System creates or updates user in MongoDB with `google_id`, avatar URL, verified email status, and returns session token.

#### C. Admin Authentication Guard
- Admin signs in via `/admin/login`.
- JWT contains `role: "admin"`.
- Backend middleware `getCurrentAdmin` enforces:
  - Valid cryptographic JWT signature with server `JWT_SECRET`.
  - Admin role check `decoded.role === 'admin'`.
  - Strict user identification against database admin records.

---

### 2.4 Vehicle Management Flow (Admin CRM)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 👨‍💼 Admin
    participant FleetUI as 🚗 Fleet Manage CRM (`/admin/fleet`)
    participant API as ⚙️ Backend
    participant Cloudinary as ☁️ Cloudinary CDN
    participant DB as 🗄️ MongoDB

    Admin->>FleetUI: Clicks "Add Vehicle" or "Edit"
    Admin->>FleetUI: Uploads high-res photos from device (Drag & drop)
    FleetUI->>API: POST `/api/admin/upload-photo` (Multipart/form-data)
    API->>Cloudinary: Streams image buffer to Cloudinary `cab_castle_fleet`
    Cloudinary-->>API: Secure HTTPS CDN URL (`https://res.cloudinary.com/...`)
    API-->>FleetUI: Returns image URL
    Admin->>FleetUI: Fills Rates, Seating, Fuel, Features & clicks "Save"
    FleetUI->>API: POST/PUT `/api/admin/vehicles`
    API->>DB: VehicleModel.save()
    DB-->>API: Updated document
    API-->>FleetUI: Refreshed fleet list
```

---

## 3. Database Schema & Entity Relationships

```mermaid
erDiagram
    USERS ||--o{ BOOKINGS : "places"
    VEHICLES ||--o{ BOOKINGS : "reserved_in"
    COUPONS ||--o{ BOOKINGS : "applied_to"
    USERS ||--o{ ENQUIRIES : "submits"

    USERS {
        string id PK
        string email UK
        string password_hash
        string name
        string phone
        string role "customer | admin"
        string google_id
        string picture
        boolean email_verified
        string created_at
    }

    VEHICLES {
        string id PK
        string title
        string subtitle
        string reg_no
        string category "Hatchback | Sedan | SUV | Luxury"
        string fuel_type "Petrol | Diesel | Electric"
        string transmission "Manual | Automatic"
        number seating
        number daily_rate
        number airport_rate
        number security_deposit
        number delivery_fee
        string status "Available | Booked | Maintenance"
        string image_url
        string_array images
        string description
        boolean is_deleted
        string created_at
    }

    BOOKINGS {
        string id PK
        string booking_no UK
        string user_id FK
        string vehicle_id FK
        string service_type "tour | transfer | hourly"
        string start_date
        string end_date
        string pickup_time
        string drop_time
        string pickup_location
        string drop_location
        number days
        number total_amount
        number paid_amount
        string status "Pending | Confirmed | In-Progress | Completed | Cancelled"
        string payment_status "Pending | Paid | Refunded"
        string payment_method "Cash_to_Driver | UPI | Card | Razorpay"
        object customer "name, phone, email, aadhaar"
        object vehicle_snapshot "title, reg_no, category, daily_rate"
        string notes
        string source "online | offline"
        string created_at
    }

    COUPONS {
        string id PK
        string code UK
        string type "Percentage | Fixed"
        number value
        number min_amount
        string expiry
        boolean active
        string created_at
    }

    ENQUIRIES {
        string id PK
        string name
        string phone
        string email
        string message
        string vehicle_id
        string status "New | Contacted | Converted | Closed"
        string created_at
    }

    SETTINGS {
        string id PK
        string key UK
        any value
        string updated_at
    }
```

---

## 4. End-to-End Data Flow Specification

### 4.1 Input Sources
1. **Customer Inputs:**
   - Vehicle selection and duration/package parameters.
   - Itinerary & Pickup/Drop locations (text & select menus).
   - Guest identity data: Name, WhatsApp Phone, Email, Aadhaar ID.
   - Google OAuth credential tokens (GSI response).
   - Promotional discount coupons.

2. **Admin Inputs:**
   - Vehicle catalog details, category tags, seating specs, base rates, airport transfer rates.
   - Multi-image file uploads (JPEG, PNG, WebP up to 10MB).
   - Offline booking dispatch entries.
   - Booking status transitions (`Confirmed` → `In-Progress` → `Completed`).
   - Coupon codes, expiry dates, and percentage/fixed discount rules.

### 4.2 Processing Layer
- **Input Validation & Sanitization:** Regex sanitization for email, phone, and dates. MongoDB queries sanitized against NoSQL injection via `escapeRegex`.
- **Image Processing Pipeline:**
  $$\text{Browser File} \xrightarrow{\text{Multer Memory Storage}} \text{Base64 URI} \xrightarrow{\text{Cloudinary API}} \text{Optimized CDN URL}$$
  URLs are formatted with `w_600,f_auto,q_auto` dynamic transformation parameters for ultra-low latency on 3G/4G networks.
- **Fare Computation Engine:**
  $$\text{Total Amount} = (\text{Days} \times \text{Daily Rate}) + \text{Airport / Night Surcharges} - \text{Coupon Discount}$$

### 4.3 Output Generation
- **REST JSON Responses:** Lean, sanitized JSON payloads.
- **Client Render Engine:** Smooth React tree with skeleton loading fallbacks, touch-optimized interactions, and fullscreen image lightbox.
- **Statutory Invoices:** Dynamic printable invoices with standard tax details, booking breakdown, and print styles.
- **Excel & PDF Exports:** Admin report streams for booking registries and driver dispatch sheets.
- **Security Audit Logs:** Structured console audit logs for critical authentication and data manipulation events.
