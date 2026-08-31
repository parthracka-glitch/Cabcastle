# 🚗 Contributing to DriveHub Goa

Welcome to **DriveHub Goa** — an enterprise car rental fleet management and customer self-drive booking platform.

---

## 🏛️ Architecture Overview

The system is split into two core workspaces:
- **`backend/`**: Node.js 20+ Express server written in TypeScript with Mongoose 8.x and MongoDB.
- **`frontend/`**: React 19 SPA built with CRACO, Tailwind CSS, Lucide icons, and Brex Design System.

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js `20.x` or higher
- Yarn `1.22.x` and npm `10.x`
- MongoDB 7.0+ (Local or MongoDB Atlas cluster URI)

### 2. Backend Initialization
```bash
cd backend
cp .env.example .env
npm install
npm run dev
# Backend runs at http://localhost:8000
```

### 3. Frontend Initialization
```bash
cd frontend
yarn install
yarn start
# Frontend runs at http://localhost:3000
```

---

## 🧪 Testing & Code Quality Guidelines

Before submitting a Pull Request, make sure all test suites and type checks pass:

### Backend Tests
```bash
cd backend
npx tsc --noEmit
npm test
```

### Frontend Build Verification
```bash
cd frontend
yarn build
```

---

## 🔒 Security & Data Conventions

1. **Idempotency**: All payment-related POST requests must include an `Idempotency-Key` or Razorpay transaction token.
2. **Soft Deletes**: Entities (`vehicles`, `coupons`, `bookings`) use `is_deleted: true` and `deleted_at: Date` rather than hard database deletes.
3. **OWASP Compliance**: No raw SQL/NoSQL query parameters without sanitization (`cleanNoSqlOperators`).
4. **KYC Privacy**: Customer identity documents must never be made public; always use authenticated delivery URLs.

---

## 🌿 Git Branching Strategy
- `main` / `master`: Production branch. Protected; all changes require PR and passing CI.
- `develop`: Staging / Integration branch.
- `feat/feature-name` or `fix/issue-description`: Topic branches.
