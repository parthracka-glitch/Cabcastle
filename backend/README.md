# DriveHub Goa — Express TypeScript API Backend

Enterprise REST API backend for the DriveHub Goa self-drive car rental platform and fleet CRM.

---

## Folder Architecture & Purpose

| Directory / File | Layer | Purpose |
| :--- | :--- | :--- |
| `src/app.ts` | Composition Root | Express application initialization, CORS, body parsers, cookie parser, and middleware setup. |
| `src/server.ts` | Entrypoint Listener | Server startup script listening on `PORT` (8000) and initializing MongoDB database connection. |
| `src/config/` | Configuration | Environment variable loading (`dotenv`), API secrets, and domain pricing constants. |
| `src/db/` | Database Layer | Database connection (`connection.ts`) and startup database seeders (`seed.ts`). |
| `src/controllers/` | HTTP Controllers | HTTP layer only — parses request body/query, calls domain services, and returns formatted JSON/responses. |
| `src/models/` | Data Models | Mongoose ODM schemas & TypeScript interfaces (`user.model.ts`, `vehicle.model.ts`, etc.). |
| `src/routes/` | API Routers | Route-to-controller wiring only (~10 lines per route file) mounted under `/api`. |
| `src/services/` | Business Logic | Domain business logic, fare calculation, promo validation, PDF invoice generation, and Excel exports. |
| `src/middleware/` | Middleware | Authentication guards (`getCurrentUser`, `getCurrentAdmin`), security headers, rate limiting. |
| `src/tests/` | Test Suite | Vitest integration test suite covering 100% of REST API endpoint contracts. |

---

## Local Database Connection & Setup

The backend connects to **MongoDB** (NoSQL document store) using **Mongoose v8 ODM**.

### Local MongoDB Connection
1. Ensure MongoDB 7.0+ is running locally on port `27017` or provide a MongoDB Atlas connection string.
2. Set the `MONGO_URL` and `DB_NAME` environment variables in `backend/.env`:
   ```env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=drivehub_goa
   PORT=8000
   JWT_SECRET=your_jwt_secret_key
   ADMIN_EMAIL=admin@drivehubgoa.com
   ADMIN_PASSWORD=Admin@123
   ```
3. Upon initial launch (`npm run dev`), the server automatically connects to `drivehub_goa` database and seeds default admin credentials (`ADMIN_EMAIL` / `ADMIN_PASSWORD`), demo customer account (`demo@drivehub.goa`), 21 fleet vehicles, and default promo coupons (`GOA10`, `FLAT500`).

---

## Running Commands

```bash
# Install dependencies
npm install

# Run backend in development mode (hot reloading with tsx)
npm run dev

# Run test suite (Vitest)
npm test

# Build production TypeScript output to dist/
npm run build

# Start production server
npm start
```
