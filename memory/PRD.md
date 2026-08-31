# Drivehub Goa — Car Rental CRM & Booking Engine
_Last updated: 2026-07-21_

## Original Problem Statement
Full-stack Car Rental CRM & Booking Engine for "Drivehub Goa" — Goa-based rental business.
Stack requested: React/Next + Tailwind + Framer Motion frontend; Node/Express + MongoDB backend; Razorpay, Nodemailer, PDFKit, ExcelJS integrations.
Implemented as: **FastAPI + Python + MongoDB + React (CRA)**.

## Personas
1. **Customer / Traveller** — browses fleet, books a car (online), pays via Razorpay (mocked).
2. **Admin / Ops** — manages fleet, bookings (online & offline), coupons, exports data.

## Core Requirements (Static)
- Customer landing page with hero search, fleet grid, trip planner, reviews, footer.
- Multi-step booking wizard: dates+add-ons → customer+coupon → review+pay.
- Airport pickup surcharge (₹800-1,200; flat ₹1,000 applied in backend).
- Mock Razorpay checkout with modal + verify + PDF invoice generation.
- Post-payment PDF invoice + confirmation email.
- Admin JWT auth (bcrypt + PyJWT) with default admin seeding.
- Admin dashboard: 4 metric cards, monthly revenue chart, recent activity.
- Fleet CRUD, Booking CRUD + status changes, Manual Offline Booking entry.
- Coupon CRUD (Percentage / Fixed / min amount / expiry / active toggle).
- PDF invoice download for any booking; Excel export of bookings.

## Architecture
- **Backend** (`/app/backend/server.py` + `/app/backend/utils/*.py`)
  - FastAPI + Motor (async MongoDB) with `/api` prefix.
  - Models: User, Vehicle, Booking, Coupon (UUID string ids).
  - Utilities: `pdf_generator.py` (ReportLab), `excel_exporter.py` (openpyxl).
  - Startup: seeds admin + 6 vehicles + 2 coupons; creates unique indexes.
- **Frontend** (`/app/frontend/src/`)
  - Customer routes: `/`, `/fleet`, `/booking/:vehicleId`, `/booking-success/:bookingId`
  - Admin routes: `/admin/login`, `/admin`, `/admin/fleet`, `/admin/bookings`, `/admin/coupons`
  - Auth via localStorage Bearer token (`dh_token`) with cookie fallback.
  - Design: Cormorant Garamond + Manrope (customer, earthy luxe); Space Grotesk + IBM Plex Sans (admin, dark tactical).

## What's Been Implemented (2026-07-21)
- MVP fully functional end-to-end.
- Backend: 44/44 pytest cases passing.
- Frontend: 100% of tested flows passing via Playwright.
- All key features from the problem statement delivered:
  - Hero search (dates, location, category, airport toggle w/ surcharge callout)
  - Live reviews marquee (6 seeded reviews)
  - Trip Planner tabs (1/3/5 day itineraries)
  - Multi-step booking with mock Razorpay checkout modal
  - PDF invoice (ReportLab branded template)
  - Email confirmation
  - Admin dashboard (metrics + area chart + activity)
  - Fleet, Bookings, Coupons CRUD
  - Manual offline booking entry
  - Excel export

## Backlog (P0/P1/P2)
- **P0** — none blocking.
- **P1** — auto-mark vehicle status "Booked" during active booking date ranges so utilization % is accurate.
- **P1** — Real Razorpay integration (currently MOCKED — see server.py `verify_payment`).
- **P2** — Attach PDF invoice as email attachment.
- **P2** — Dynamic airport surcharge per airport (Dabolim vs Mopa) to align with "₹800-1,200" range copy.
- **P2** — Split server.py into routers (auth, vehicles, bookings, admin) once file grows beyond ~1000 lines.
- **P2** — Migrate `@app.on_event` to FastAPI `lifespan` context manager.
- **P2** — Google Places API integration for live reviews (currently static seeded).
