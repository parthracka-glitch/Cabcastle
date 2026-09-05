# Cab Castle Goa — Production Deployment Guide

Complete step-by-step deployment guide for hosting the **Frontend on Vercel** and the **Backend on Render**, connected to **MongoDB Atlas** and **Cloudinary**.

---

## 📋 Pre-Flight Checklist: What You Need Before Deploying

Before deploying to live production, ensure you have these 5 items ready:

| # | Item | Status / Where to get | Required In |
|---|:---|:---|:---|
| 1 | **MongoDB Atlas Connection String** | Create a free/dedicated cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) -> Database -> Connect -> Drivers -> copy connection URI (e.g. `mongodb+srv://admin:<password>@cluster0.xxx.mongodb.net/?retryWrites=true&w=majority`) | Render Backend (`MONGO_URL`, `DB_NAME`) |
| 2 | **JWT Secret Key** | Generate a strong 64-character random string (e.g. `openssl rand -base64 32`) | Render Backend (`JWT_SECRET`) |
| 3 | **Cloudinary Credentials** | Get your credentials from [Cloudinary Console](https://console.cloudinary.com) | Render Backend (`CLOUDINARY_*`) & Vercel (`REACT_APP_CLOUDINARY_CLOUD_NAME`) |
| 4 | **Google OAuth 2.0 Credentials** | Get Client ID and Secret from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and add production domains to **Authorized JavaScript Origins** | Vercel (`REACT_APP_GOOGLE_CLIENT_ID`) & Render Backend |
| 5 | **Admin Master Credentials** | Set your production admin email and strong password | Render Backend (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) |

---

## 🚀 Part 1: Deploy Backend on Render (Node.js Web Service)

### Step 1: Create a Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.

### Step 2: Configure Service Settings
- **Name:** `cab-castle-backend` (or your chosen name)
- **Region:** `Singapore (Southeast Asia)` or `Frankfurt` (closest to India for low latency)
- **Root Directory:** `backend` *(Important: specify `backend` if deploying from a monorepo/subfolder)*
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Instance Type:** `Free` or `Starter` ($7/mo recommended for 24/7 uptime without cold starts)

### Step 3: Set Environment Variables on Render
Under the **Environment** tab, add the following key-value pairs:

```env
NODE_ENV=production
PORT=8000
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
DB_NAME=cab_castle_goa
JWT_SECRET=YOUR_SUPER_SECURE_PRODUCTION_JWT_SECRET_KEY_MIN_32_CHARS
ADMIN_EMAIL=your_admin_email@example.com
ADMIN_PASSWORD=YourStrongAdminPasswordHere

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
```

### Step 4: Health Check Path
- Under **Advanced Settings**, set **Health Check Path** to: `/api/health`

### Step 5: Deploy
Click **Create Web Service**. Once deployed, Render will provide your live URL (e.g. `https://cab-castle-backend.onrender.com`).
Copy this URL — you will need it for the frontend!

---

## 🌐 Part 2: Deploy Frontend on Vercel

### Step 1: Import Project on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your Git repository.

### Step 2: Configure Project Settings
- **Framework Preset:** `Create React App`
- **Root Directory:** Click **Edit** and choose `frontend` *(Important: set to `frontend` folder)*
- **Build Command:** `npm run build` (or default `craco build`)
- **Output Directory:** `build`
- **Install Command:** `npm install`

### Step 3: Set Environment Variables on Vercel
Under **Environment Variables**, add:

```env
REACT_APP_BACKEND_URL=https://cab-castle-backend.onrender.com
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CI=false
GENERATE_SOURCEMAP=false
DISABLE_ESLINT_PLUGIN=true
```
*(Replace `https://cab-castle-backend.onrender.com` with your actual Render backend URL)*

### Step 4: Verify Single-Page-App (SPA) Routing (`vercel.json`)
The `frontend/vercel.json` file is already included in your repository:
```json
{
  "outputDirectory": "build",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This ensures direct URLs (like `/legal/privacy-policy`, `/booking/v-sedan-dzire`, `/admin`) reload without 404 errors.

### Step 5: Deploy
Click **Deploy**. Vercel will build and assign your production domain (e.g. `https://cabcastlegoa.vercel.app` or your custom domain `https://cabcastlegoa.com`).

---

## 🔑 Part 3: Post-Deployment Steps (Crucial!)

### 1. Update Google Cloud Console Authorized Origins
1. Open [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Click your OAuth 2.0 Client ID.
3. Under **Authorized JavaScript origins**, add:
   - `https://your-frontend-domain.vercel.app`
   - `https://cabcastlegoa.com` (if using custom domain)
4. Under **Authorized redirect URIs**, add:
   - `https://your-frontend-domain.vercel.app`
   - `https://your-frontend-domain.vercel.app/login`
5. Click **Save** (takes ~5 minutes to propagate across Google servers).

### 2. Configure CORS in Backend (if using custom domain)
The backend already supports dynamic origin reflections and localhost. When using a custom domain (e.g. `https://cabcastlegoa.com`), it automatically allows requests with cookies and authorization headers.

---

## 🧪 Verification Matrix After Deployment

| Action | Expected Result |
|---|---|
| Open Frontend URL (`/`) | Fast load with responsive fleet cards and clean design |
| Open `/legal/privacy-policy` | Sidebar navigation works and all 14 policies load |
| Click a Car -> `/booking/v-sedan-dzire` | Vehicle specs load, Lightbox opens on clicking photos |
| Submit Booking | Instant confirmation + prefilled WhatsApp dispatch link |
| Open `/admin/login` | Clean login screen without autofill links |
| Login with Admin Email & Password | Redirects to `/admin` dashboard with full management capabilities |
| Backend `/api/health` | Returns `{ ok: true, status: "healthy", database: "connected" }` |
