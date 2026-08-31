# DriveHub Goa — System Directory & File Structure

This document describes the canonical repository directory structure for DriveHub Goa following the architectural refactoring into a clean, professional monorepo setup.

---

## 1. Architecture Decision Note

- **Decision:** Retained **Option A** (Single Craco/React-Scripts build with domain-separated feature modules inside `frontend/src/website/` and `frontend/src/crm/`, sharing common infrastructure via `frontend/src/shared/`).
- **Rationale:** Preserves single-command local dev execution (`npm start` on Port 3000), unified production build bundling (`npm run build`), zero logic duplication, and 100% contract stability across all customer and admin flows.

---

## 2. Top-Level Repository Tree

```text
DriveHub-Goa-main/
├── backend/                       # Enterprise Express TypeScript REST API
│   ├── src/                       # Production Express application codebase
│   │   ├── @types/                # Ambient TypeScript declarations
│   │   ├── config/                # Environment variables & runtime constants
│   │   ├── controllers/           # HTTP request handlers
│   │   ├── db/                    # MongoDB connection & database seeds
│   │   ├── middlewares/           # JWT authentication, security headers & rate limiting
│   │   ├── models/                # Mongoose ODM schemas & TypeScript interfaces
│   │   ├── routes/                # Express REST endpoint declarations
│   │   ├── services/              # Dynamic pricing, PDF invoices & Excel exports
│   │   ├── app.ts                 # Express composition root
│   │   └── server.ts              # HTTP server listener bootstrapper
│   ├── tests/                     # Vitest API test suite (tests/server.test.ts)
│   ├── Dockerfile                 # Production backend containerization
│   ├── package.json               # Backend dependencies & npm scripts
│   └── tsconfig.json              # TypeScript compilation setup
│
├── frontend/                      # Customer Website & Admin CRM (React 19, TypeScript, Tailwind)
│   ├── src/                       # React composition root & domain modules
│   │   ├── website/               # Domain 1: Public Customer Website
│   │   │   ├── pages/             # Landing, FleetPage, BookingPage, BookingSuccess, CustomerProfile, CustomerAuth, NotFound
│   │   │   └── components/        # SearchWidget, VehicleCard, CarRollingShowcase, TripPlanner, LocationSection, etc.
│   │   ├── crm/                   # Domain 2: Admin Fleet Management CRM
│   │   │   ├── api/               # Admin-specific API clients (admin.api.ts, enquiries.api.ts)
│   │   │   ├── pages/             # Dashboard, FleetManage, BookingsManage, CalendarView, CouponsManage, AdminLogin, etc.
│   │   │   └── components/        # OfflineBookingModal, EnquiryModal, NotificationCenter, ConfirmModal, NotesModal, etc.
│   │   ├── shared/                # Domain 3: Base UI Primitives & Core Services
│   │   │   ├── ui/                # Radix UI & Tailwind atomic design components
│   │   │   ├── api/               # Centralized shared API clients (vehicles, bookings, auth, payments, coupons)
│   │   │   ├── context/           # AuthContext.tsx (TypeScript session context)
│   │   │   ├── hooks/             # Custom React hooks (use-toast.js)
│   │   │   ├── lib/               # Utility functions (api.ts, utils.js)
│   │   │   ├── types/             # Shared TypeScript type interfaces (index.ts)
│   │   │   ├── constants/         # Shared test ID constants
│   │   │   └── assets/            # Brand logos
│   │   ├── App.tsx                # Master React Router composition root
│   │   ├── index.js               # React DOM entrypoint
│   │   ├── index.css              # Global styles & Tailwind imports
│   │   └── App.css                # App container layout styles
│   ├── craco.config.js            # Craco Webpack build & alias configuration (@website, @crm, @shared, @)
│   ├── tsconfig.json              # TypeScript compiler path mappings
│   ├── tailwind.config.js         # Tailwind theme configuration
│   └── package.json               # Frontend dependencies & npm scripts
│
├── docs/                          # Consolidated Project Documentation
│   ├── DATABASE_SCHEMA.md         # Database collections & relational documentation
│   ├── DEPLOYMENT_CAPACITY_ANALYSIS.md # Capacity & infrastructure planning report
│   ├── DEPLOYMENT_GUIDE.md        # Production deployment walkthrough
│   ├── MIGRATION_MAP.md           # API route migration & mapping document
│   ├── OPERATIONAL_RISK_ASSESSMENT.md # Operational risk assessment & mitigations
│   ├── PROJECT_EXECUTIVE_SUMMARY.md # Business & executive summary
│   ├── PROJECT_STRUCTURE_AUDIT.md # Technical audit report
│   └── STRUCTURE.md               # This directory map
│
├── docker-compose.yml             # Multi-container orchestration
├── start_servers.bat              # One-click Windows dev server launcher
├── design_guidelines.json         # Design tokens & color system
└── README.md                      # Primary workspace README
```

---

## 3. Module Alias Mappings

| Alias | Target Directory | Description |
| :--- | :--- | :--- |
| `@website/*` | `frontend/src/website/*` | Imports public customer website pages and components |
| `@crm/*` | `frontend/src/crm/*` | Imports admin CRM dashboard pages, components, and API services |
| `@shared/*` | `frontend/src/shared/*` | Imports shared UI primitives, API clients, context, types, and helpers |
| `@/components/ui/*` | `frontend/src/shared/ui/*` | Radix / Tailwind atomic UI components |
| `@/*` | `frontend/src/shared/*` | Backward-compatible alias resolving to shared core infrastructure |
