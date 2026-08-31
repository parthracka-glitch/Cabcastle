# DriveHub Goa — Comprehensive System Structure & File Audit Report

**Audit Date:** August 12, 2026  
**Repository:** DriveHub Goa — Enterprise Car Rental Website & Fleet Management CRM  
**Status:** Audit Complete · Production Ready  

---

## 1. Executive Summary & System Overview

DriveHub Goa is a production-grade full-stack vehicle rental platform designed for tourists and fleet operators in Goa. It features two distinct user-facing applications served from a unified architecture:

1. **Public Customer Website:** A high-conversion self-drive vehicle booking portal featuring live fleet availability, real-time pricing calculator, doorstep pickup selector, and instant reservation confirmation.
2. **Admin Fleet Management CRM:** An executive management dashboard featuring live fleet tracking, interactive booking calendar, walk-in counter booking creator, coupon generator, enquiry manager, and financial analytics.

---

## 2. Monorepo Architecture Overview

```
DriveHub-Goa-main/
├── backend/                       # Enterprise Node.js / Express TypeScript REST API
│   ├── src/                       # Production Express application codebase
│   ├── tests/                     # Vitest API test suite
│   ├── package.json               # Backend dependencies & runtime scripts
│   └── tsconfig.json              # TypeScript compilation setup
│
├── frontend/                      # Customer Website & Admin CRM (React 19, TypeScript, Tailwind)
│   ├── src/                       # React composition root & domain modules
│   │   ├── website/               # Domain 1: Public Customer Website
│   │   ├── crm/                   # Domain 2: Admin Fleet Management CRM
│   │   ├── shared/                # Domain 3: Base UI Primitives & Core Services
│   │   └── App.tsx / App.js       # Router composition root
│   ├── craco.config.js            # Craco Webpack build & alias configuration
│   ├── tsconfig.json              # TypeScript path mappings (@website, @crm, @shared, @)
│   └── package.json               # Frontend dependencies & build scripts
│
├── DATABASE_SCHEMA.md             # Database collections & relational documentation
├── DEPLOYMENT_GUIDE.md            # Production deployment walkthrough
├── MIGRATION_MAP.md               # API route migration & mapping document
├── OPERATIONAL_RISK_ASSESSMENT.md  # Production security & reliability audit
├── PROJECT_EXECUTIVE_SUMMARY.md   # High-level business & system summary
├── README.md                      # Primary workspace README
├── STRUCTURE.md                   # Directory tree overview
├── docker-compose.yml             # Containerized environment orchestration
└── start_servers.bat              # One-click Windows development server launcher
```

---

## 3. Root Workspace File Audit

| File Name | Purpose & Functionality |
| :--- | :--- |
| [`README.md`](file:///e:/DriveHub-Goa-main/README.md) | Workspace root entrypoint documentation covering installation, features, and startup instructions. |
| [`STRUCTURE.md`](file:///e:/DriveHub-Goa-main/STRUCTURE.md) | Architectural tree map detailing monorepo directory organization. |
| [`PROJECT_EXECUTIVE_SUMMARY.md`](file:///e:/DriveHub-Goa-main/PROJECT_EXECUTIVE_SUMMARY.md) | High-level summary of business requirements, system capabilities, and key metrics. |
| [`DATABASE_SCHEMA.md`](file:///e:/DriveHub-Goa-main/DATABASE_SCHEMA.md) | Full technical specification for MongoDB collections, indexes, and schema definitions. |
| [`DEPLOYMENT_GUIDE.md`](file:///e:/DriveHub-Goa-main/DEPLOYMENT_GUIDE.md) | Step-by-step production deployment guide for Docker, Nginx, and cloud hosting. |
| [`MIGRATION_MAP.md`](file:///e:/DriveHub-Goa-main/MIGRATION_MAP.md) | Mapping document tracking API endpoint migrations and request/response contracts. |
| [`OPERATIONAL_RISK_ASSESSMENT.md`](file:///e:/DriveHub-Goa-main/OPERATIONAL_RISK_ASSESSMENT.md) | Audit document evaluating security, rate limiting, data protection, and operational risks. |
| [`docker-compose.yml`](file:///e:/DriveHub-Goa-main/docker-compose.yml) | Multi-container setup for running MongoDB, Backend API, and Frontend web server simultaneously. |
| [`start_servers.bat`](file:///e:/DriveHub-Goa-main/start_servers.bat) | Windows batch file to launch Backend (Port 8000) and Frontend (Port 3000) dev servers in parallel windows. |
| [`design_guidelines.json`](file:///e:/DriveHub-Goa-main/design_guidelines.json) | UX/UI design guidelines containing brand colors (`#E8826B` Cinnabar, `#82C4B7` Keppel), fonts, and button styles. |
| [`test_result.md`](file:///e:/DriveHub-Goa-main/test_result.md) | Verification output log recording test run execution. |

---

## 4. Backend Service Audit (`backend/`)

The backend is built with **Node.js**, **Express.js**, **TypeScript**, and **Mongoose ODM (MongoDB)**.

### Core Configuration & Scripts
- [`backend/package.json`](file:///e:/DriveHub-Goa-main/backend/package.json): NPM dependencies (`express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `pdfkit`, `exceljs`, `cors`, `dotenv`) and scripts (`npm run dev`, `npm run build`, `npm test`).
- [`backend/tsconfig.json`](file:///e:/DriveHub-Goa-main/backend/tsconfig.json): TypeScript compilation options targeting ES2022 / Node 20+.
- [`backend/Dockerfile`](file:///e:/DriveHub-Goa-main/backend/Dockerfile): Container setup for production backend containerization.

### Source Code (`backend/src/`)
- [`src/server.ts`](file:///e:/DriveHub-Goa-main/backend/src/server.ts): Application bootstrapper; connects to MongoDB and launches the HTTP listener on port 8000.
- [`src/app.ts`](file:///e:/DriveHub-Goa-main/backend/src/app.ts): Express composition root; registers CORS, JSON body parsers, cookie parsers, logging, and router mounts.
- [`src/config/`](file:///e:/DriveHub-Goa-main/backend/src/config): Environment loading routines (`dotenv`) and static configuration constants.
- [`src/controllers/`](file:///e:/DriveHub-Goa-main/backend/src/controllers): Request handlers translating HTTP endpoints into service calls (Auth, Bookings, Vehicles, Coupons, Enquiries, Analytics).
- [`src/db/`](file:///e:/DriveHub-Goa-main/backend/src/db): MongoDB connection manager and database clean/seed scripts.
- [`src/middleware/`](file:///e:/DriveHub-Goa-main/backend/src/middleware): Authentication JWT verification guards, role authorization (`admin` vs `customer`), rate limiters, and error handling.
- [`src/models/`](file:///e:/DriveHub-Goa-main/backend/src/models): Mongoose schemas and TypeScript interfaces for `User`, `Vehicle`, `Booking`, `Coupon`, `Enquiry`, `AdminSettings`.
- [`src/routes/`](file:///e:/DriveHub-Goa-main/backend/src/routes): Route declarations exposing `/api/auth`, `/api/vehicles`, `/api/bookings`, `/api/coupons`, `/api/admin`, `/api/enquiries`.
- [`src/services/`](file:///e:/DriveHub-Goa-main/backend/src/services): Core business logic:
  - Dynamic pricing calculator (peak season multipliers, weekend rates, duration discounts).
  - Automated PDF invoice generator (`pdfkit`).
  - Excel booking report export engine (`exceljs`).
- [`src/tests/`](file:///e:/DriveHub-Goa-main/backend/src/tests): Automated Vitest test suite testing backend endpoints and business rules.

---

## 5. Frontend Application Audit (`frontend/`)

The frontend is built with **React 19**, **TypeScript**, **Tailwind CSS**, **Craco**, and **Lucide Icons**. It is structured into 3 main domain modules.

### Build & Tooling Configuration
- [`frontend/craco.config.js`](file:///e:/DriveHub-Goa-main/frontend/craco.config.js): Craco configuration handling Webpack aliases (`@website`, `@crm`, `@shared`, `@`) and dev-server settings.
- [`frontend/tsconfig.json`](file:///e:/DriveHub-Goa-main/frontend/tsconfig.json): TypeScript path mappings for clean module resolution.
- [`frontend/tailwind.config.js`](file:///e:/DriveHub-Goa-main/frontend/tailwind.config.js): Tailwind theme tokens, custom colors, fonts (`font-display`, `font-body`, `font-mono`), and animations.
- [`frontend/package.json`](file:///e:/DriveHub-Goa-main/frontend/package.json): Frontend dependencies (`@tanstack/react-query`, `lucide-react`, `date-fns`, `recharts`, `framer-motion`, `sonner`).

---

### Domain 1: Public Customer Website (`frontend/src/website/`)

This domain contains all customer-facing screens, components, and layout elements for vehicle discovery, searching, booking, and customer authentication.

#### Website Pages (`frontend/src/website/pages/`)
| File Name | Description & Purpose |
| :--- | :--- |
| [`Landing.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/pages/Landing.jsx) | Main homepage featuring hero animated vehicle background, search widget, rolling car showcase, trip planner, user reviews marquee, location highlights, and CTA banner. |
| [`FleetPage.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/pages/FleetPage.jsx) | Complete vehicle catalog view with dynamic category filters (SUV, Sedan, Hatchback, Thar 4x4) and fuel type filters. |
| [`BookingPage.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/pages/BookingPage.jsx) | Multi-step booking checkout flow (Dates & Add-ons, Coupon & Review, Payment selection with live price breakdown). |
| [`BookingSuccess.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/pages/BookingSuccess.jsx) | Post-reservation confirmation screen displaying booking ID, trip summary, key handover instructions, and PDF invoice download link. |
| [`CustomerProfile.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/pages/CustomerProfile.jsx) | Customer account dashboard listing active & past reservations, profile details, and voucher downloads. |
| [`CustomerAuth.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/pages/CustomerAuth.jsx) | Unified Customer Login and Sign-Up authentication view with form validation. |
| [`NotFound.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/pages/NotFound.jsx) | Styled 404 Error screen with quick redirection back to homepage and fleet catalog. |

#### Website Components (`frontend/src/website/components/`)
| File Name | Description & Purpose |
| :--- | :--- |
| [`SearchWidget.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/components/SearchWidget.jsx) | Interactive date-picker, pickup location selector (Candolim, Calangute, Baga, Airport), vehicle category filter, and airport pickup checkbox. |
| [`VehicleCard.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/components/VehicleCard.jsx) | 3D-tilt vehicle showcase card displaying photo, seats, transmission, fuel type, price per day, and 'Book Now' trigger. |
| [`CarRollingShowcase.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/components/CarRollingShowcase.jsx) | Animated carousel showcasing featured fleet items with category tabs. |
| [`TripPlanner.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/components/TripPlanner.jsx) | Interactive Goa trip route planner recommending optimal vehicles based on travel itineraries. |
| [`LocationSection.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/components/LocationSection.jsx) | Pickup hub locator showcasing Candolim hub address, airport delivery options, and Google Map directions link. |
| [`HeroAnimatedCarBackground.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/components/HeroAnimatedCarBackground.jsx) | Custom background visual animation component adding motion behind the hero title. |
| [`Tilt3DCard.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/components/Tilt3DCard.jsx) | Reusable mouse-tracking 3D tilt perspective wrapper. |
| [`LegalModals.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/components/LegalModals.jsx) | Modal dialogs rendering Terms & Conditions and Self-Drive NDA legal documents. |
| [`MyBookingsModal.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/components/MyBookingsModal.jsx) | Quick booking lookup modal allowing customers to find reservations using phone number or booking ID. |
| [`AboutUsModal.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/components/AboutUsModal.jsx) | Story and background modal highlighting DriveHub Goa's fleet quality and service guarantee. |
| [`CustomerSkeleton.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/components/CustomerSkeleton.jsx) | Skeleton loading placeholder for public website pages during lazy-load suspense states. |
| [`ScrollCarAnimation.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/components/ScrollCarAnimation.jsx) | Interactive scroll-driven car animation element. |
| [`layout/Navbar.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/components/layout/Navbar.jsx) | Sticky navigation bar featuring logo, fleet links, phone shortcut, dark/light theme toggle, and account button. |
| [`layout/Footer.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/components/layout/Footer.jsx) | Footer section with company info, hub locations, legal links, and social links. |
| [`seo/SEO.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/website/components/seo/SEO.jsx) | Dynamic SEO manager rendering meta title, description, OpenGraph tags, and Schema.org JSON-LD structured data. |

---

### Domain 2: Admin Fleet Management CRM (`frontend/src/crm/`)

This domain contains all administrative CRM tools, dashboards, fleet managers, calendar controls, and counter booking interfaces.

#### CRM Pages (`frontend/src/crm/pages/`)
| File Name | Description & Purpose |
| :--- | :--- |
| [`AdminLayout.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/crm/pages/AdminLayout.jsx) | Master administrative sidebar layout wrapper with navigation links (Dashboard, Calendar, Fleet, Bookings, Coupons, Settings), notification badge, and admin user menu. |
| [`AdminLogin.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/crm/pages/AdminLogin.jsx) | Secure login portal for fleet managers and admins. |
| [`Dashboard.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/crm/pages/Dashboard.jsx) | Central CRM command center rendering key financial metrics (total revenue, active bookings, fleet utilization rate), live pending enquiries, and quick counter booking buttons. |
| [`FleetManage.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/crm/pages/FleetManage.jsx) | Complete vehicle fleet management CRUD interface (add vehicle, update pricing, toggle maintenance status, photo upload, delete vehicle). |
| [`BookingsManage.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/crm/pages/BookingsManage.jsx) | Comprehensive reservation management table with status filtering (Confirmed, Completed, Cancelled), search, Excel export trigger, and status updater. |
| [`CalendarView.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/crm/pages/CalendarView.jsx) | Visual calendar view displaying vehicle availability matrix per day, date-range selections, and booking scheduling grid. |
| [`CouponsManage.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/crm/pages/CouponsManage.jsx) | Promotional coupon generator (add coupon code, percentage/fixed discount, expiry date, active toggle). |
| [`AdminSettings.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/crm/pages/AdminSettings.jsx) | Admin profile configuration, security settings, password change form, and business hub preferences. |

#### CRM Components (`frontend/src/crm/components/`)
| File Name | Description & Purpose |
| :--- | :--- |
| [`AdminSkeleton.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/crm/components/AdminSkeleton.jsx) | Skeleton loading placeholder for admin dashboard components during suspense lazy-load transitions. |
| [`OfflineBookingModal.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/crm/components/OfflineBookingModal.jsx) | Counter walk-in booking creation dialog for physical hub customer bookings (vehicle selection, dates, cash/UPI payment input). |
| [`EnquiryModal.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/crm/components/EnquiryModal.jsx) | Customer enquiry inspection modal allowing staff to mark enquiries as contacted or converted. |
| [`NotificationCenter.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/crm/components/NotificationCenter.jsx) | Real-time notification drawer listing recent customer reservations and urgent maintenance alerts. |
| [`common/ConfirmModal.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/crm/components/common/ConfirmModal.jsx) | Reusable confirmation dialog for destructive actions (deleting vehicles, cancelling bookings). |
| [`common/NotesModal.jsx`](file:///e:/DriveHub-Goa-main/frontend/src/crm/components/common/NotesModal.jsx) | Modal dialog for attaching internal staff notes to specific bookings. |

---

### Domain 3: Shared Infrastructure (`frontend/src/shared/`)

This domain houses all reusable atomic design components, API service methods, application state context, custom hooks, and shared utilities.

| Folder | Contents & Purpose |
| :--- | :--- |
| [`src/shared/ui/`](file:///e:/DriveHub-Goa-main/frontend/src/shared/ui) | Radix UI & Tailwind CSS atomic design components: `button.jsx`, `dialog.jsx`, `badge.jsx`, `card.jsx`, `table.jsx`, `input.jsx`, `label.jsx`, `select.jsx`, `popover.jsx`, `calendar.jsx`, `checkbox.jsx`, `tabs.jsx`, `separator.jsx`, `scroll-area.jsx`, `switch.jsx`, `dropdown-menu.jsx`, `sonner.jsx`. |
| [`src/shared/api/`](file:///e:/DriveHub-Goa-main/frontend/src/shared/api) | Centralized HTTP client methods: `axios-client.ts`, `auth.api.ts`, `vehicles.api.ts`, `bookings.api.ts`, `coupons.api.ts`, `enquiries.api.ts`, `payments.api.ts`, `admin.api.ts`. |
| [`src/shared/context/`](file:///e:/DriveHub-Goa-main/frontend/src/shared/context) | `AuthContext.jsx` & `AuthContext.tsx` managing user authentication, JWT token persistence, and role guards. |
| [`src/shared/hooks/`](file:///e:/DriveHub-Goa-main/frontend/src/shared/hooks) | Custom React hooks (`use-toast.js`). |
| [`src/shared/lib/`](file:///e:/DriveHub-Goa-main/frontend/src/shared/lib) | Utilities (`api.js`, `api.ts`, `utils.js`) for currency formatting (`formatINR`), error parsing (`formatApiError`), and Cloudinary image optimization (`getOptimizedImageUrl`). |
| [`src/shared/types/`](file:///e:/DriveHub-Goa-main/frontend/src/shared/types) | TypeScript interfaces (`IUser`, `IVehicle`, `IBooking`, `ICoupon`, `IEnquiry`). |
| [`src/shared/constants/`](file:///e:/DriveHub-Goa-main/frontend/src/shared/constants) | System constants (`testIds.js`). |
| [`src/shared/assets/`](file:///e:/DriveHub-Goa-main/frontend/src/shared/assets) | Brand logos (`logo.jpeg`, `logo_icon.jpeg`). |

---

## 6. Summary of Architectural Best Practices Applied

1. **Strict Domain Isolation:** Public customer website modules (`website/`) and administrative CRM modules (`crm/`) are cleanly separated into dedicated directories, preventing code clutter and reducing bundle cross-contamination.
2. **Explicit Module Aliases:** Module aliases (`@website`, `@crm`, `@shared`, `@`) configured in `craco.config.js` and `tsconfig.json` eliminate fragile relative imports (`../../../`).
3. **100% Import Compatibility:** Re-export bridges maintained in legacy locations guarantee that legacy references or third-party tests execute without breaking changes.
4. **Verified Production Build:** Fully compiled and validated with `npm run build` in both backend and frontend environments.
