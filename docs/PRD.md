# DriveHub Goa — Product Requirements Document (PRD)

## Overview
Full-stack Car Rental CRM & Self-Drive Booking Platform for **DriveHub Goa** — premier Goa-based car rental business.

**Technology Stack:**
- **Frontend:** React 18, TypeScript, Tailwind CSS, Radix UI primitives, Lucide Icons, Apple UI Design System.
- **Backend:** Node.js (Express TypeScript), Mongoose ODM, JWT Authentication, Multer, ExcelJS, PDFKit.
- **Database:** MongoDB / MongoDB Atlas.
- **Cloud Storage:** Cloudinary (Fleet photos & document uploads).
- **Authentication:** Dual auth system (Customer Google OAuth / Email + Admin tactical JWT credentials).

---

## Personas & User Roles
1. **Customer / Traveller**
   - Browse fleet with real-time category & transmission filters (Sedan, SUV, Thar 4x4, Hatchback, Convertible).
   - Dynamic fare calculator with 24/7 airport pickup/drop surcharges, discount coupon validation, and refundable deposit calculation.
   - Multi-step checkout wizard with Terms & NDA legal compliance.
   - Profile management, booking history, and instant PDF invoice downloads.

2. **Admin / Fleet Manager**
   - Tactical dark CRM dashboard with 4 KPI cards (revenue, active fleet, booking counts, utilization).
   - Interactive calendar timeline showing vehicle reservations and availability.
   - Fleet CRUD with Cloudinary multi-image upload, specs, rates, and active/maintenance status toggles.
   - Bookings management with live status updates (Confirmed, Completed, Cancelled) and manual offline booking entry.
   - Coupon management (Percentage / Fixed discount, minimum order, validity periods).
   - One-click Excel spreadsheet export and automated PDF invoice generation.
