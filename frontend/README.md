# DriveHub Goa — React TypeScript SPA Frontend

High-conversion customer booking portal, dynamic fare breakdown engine, and executive CRM dashboard built with React 19, TypeScript, and Tailwind CSS.

---

## Folder Architecture & Purpose

| Directory / File | Layer | Purpose |
| :--- | :--- | :--- |
| `src/App.tsx` / `src/App.js` | Composition Root | React router provider, route guards, toast container, and suspense fallback setup. |
| `src/api/` | Service Layer | Centralized API client (`axios-client.ts`) and modular domain service methods (`auth.api.ts`, `vehicles.api.ts`, `bookings.api.ts`, etc.) — zero direct fetch/axios calls in components. |
| `src/assets/` | Static Assets | Brand images, vector icons, and static webp assets. |
| `src/website/` | Public Website Domain (`@website`) | All public website screens (`pages/`) and website components (`components/`: `SearchWidget`, `VehicleCard`, `Navbar`, `Footer`, `SEO`). |
| `src/crm/` | Admin CRM Domain (`@crm`) | All executive CRM screens (`pages/`: `Dashboard`, `FleetManage`, `BookingsManage`, `CalendarView`) and CRM components (`components/`: `OfflineBookingModal`, `EnquiryModal`, `ConfirmModal`). |
| `src/components/ui/` | UI Primitives | Reusable UI design tokens & Radix UI primitives (`button`, `dialog`, `card`, etc.). |
| `src/constants/` | App Constants | Hub locations, default vehicle categories, and config constants. |
| `src/context/` | State Context | `AuthContext` provider managing customer & admin user authentication state. |
| `src/hooks/` | Custom Hooks | Custom hooks (`useAuth`, `useMobile`, `useToast`). |
| `src/types/` | TypeScript Types | Ambient and domain interfaces (`IUser`, `IVehicle`, `IBooking`, `ICoupon`, `IEnquiry`). |

---

## Environment Setup

Configure environment variables in `frontend/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8000
PORT=3000
REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

---

## Running Commands

```bash
# Install dependencies
npm install

# Start development server on port 3000 (Craco dev server)
npm start

# Build production bundle with Craco
npm run build

# Run unit / component tests
npm test
```
