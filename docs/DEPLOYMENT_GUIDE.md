# DriveHub Goa — Step-by-Step Production Deployment Guide

This guide provides complete, step-by-step instructions for deploying **Drivehub Goa** for **100% free production hosting** using:
- **MongoDB Atlas** (Database)
- **Render** (Python FastAPI Backend)
- **Vercel** (React Frontend)
- **Cron-Job.org / UptimeRobot** (24/7 Backend Keep-Alive)

---

## Deployment Architecture Overview

```mermaid
flowchart TD
    User([Customer / Admin]) -->|HTTPS| Vercel[Vercel Edge CDN - Frontend]
    Vercel -->|API Requests| Render[Render Web Service - FastAPI Backend]
    Cron[Cron-Job.org / UptimeRobot] -->|Ping every 10 mins| Render
    Render -->|Async Driver| Atlas[(MongoDB Atlas M0 Free Cluster)]
    Render -->|Image Storage| Cloudinary[Cloudinary CDN]
```

---

## Step 1: MongoDB Atlas Setup (Database)

1. Sign up / Log into [MongoDB Atlas](https://cloud.mongodb.com).
2. **Create a Free Cluster**:
   - Select **M0 Free Tier** (512 MB).
   - Region: AWS / Singapore or Mumbai (`ap-south-1`).
   - Cluster Name: `Cluster0` or `drivehub-cluster`.
3. **Database User Setup**:
   - Go to **Security** $\rightarrow$ **Database Access**.
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: `drivehubgoa_db_user`
   - Password: Generate a strong password (e.g. `Saieshdesai`).
   - User Privileges: **Read and write to any database**.
   - Click **Add User**.
4. **Network Access Setup (Crucial)**:
   - Go to **Security** $\rightarrow$ **Network Access**.
   - Click **Add IP Address**.
   - Click **ALLOW ACCESS FROM ANYWHERE** (`0.0.0.0/0`).
   - Click **Confirm** *(This allows Render cloud servers to connect dynamically)*.
5. **Get Connection String**:
   - Go to **Database** $\rightarrow$ Click **Connect**.
   - Select **Drivers** (Python).
   - Copy connection string:
     ```text
     mongodb+srv://drivehubgoa_db_user:<password>@cluster0.sujtj5v.mongodb.net/?appName=Cluster0
     ```
   - Replace `<password>` with your actual database user password.

---

## Step 2: Render Backend Deployment (FastAPI)

1. Push your complete code repository to **GitHub**.
2. Sign up / Log into [Render.com](https://render.com).
3. Click **New +** $\rightarrow$ Select **Web Service**.
4. Connect your GitHub repository.
5. **Configure Web Service**:
   - **Name**: `drivehub-goa-backend`
   - **Region**: Singapore or Frankfurt
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Select **Free** (512 MB RAM / 0.1 CPU).

6. **Configure Environment Variables in Render**:
   Scroll down to **Environment Variables** and add the following keys:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `MONGO_URL` | `mongodb+srv://drivehubgoa_db_user:password@cluster0.sujtj5v.mongodb.net/?appName=Cluster0` | MongoDB Atlas Connection URL |
| `DB_NAME` | `drivehub_goa` | MongoDB Database Name |
| `JWT_SECRET` | `dh_jwt_sec_9f7a8b3c2d1e0f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a` | Secret key for signing user JWTs |
| `ADMIN_EMAIL` | `admin@drivehubgoa.com` | Production Admin Email |
| `ADMIN_PASSWORD` | `Admin@123` | Production Admin Password |
| `CLOUDINARY_CLOUD_NAME` | `z2zrt5md` | Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | `111781868266235` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | `vpw9fiB1hj2O654fzOpDqptDMZE` | Cloudinary API Secret |
| `CORS_ORIGINS` | `*` *(Update after Vercel deployment)* | Allowed origins |

7. Click **Create Web Service**.
8. Wait 2–3 minutes for build completion.
9. Copy your backend service URL: e.g. `https://drivehub-goa-backend.onrender.com`.

---

## Step 3: Vercel Frontend Deployment (React)

1. Sign up / Log into [Vercel.com](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository.
4. **Configure Project**:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: Click **Edit** $\rightarrow$ Select `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. **Environment Variables in Vercel**:
   Add the following environment variable:

| Key | Value | Description |
| :--- | :--- | :--- |
| `REACT_APP_BACKEND_URL` | `https://drivehub-goa-backend.onrender.com` | Render Backend Service URL |

6. Click **Deploy**.
7. Vercel will build and assign your live website URL: e.g. `https://drivehub-goa.vercel.app` (or your custom domain `https://drivehubgoa.com`).

---

## Step 4: Lock Down CORS on Render Backend

Once Vercel gives you your live domain (e.g. `https://drivehub-goa.vercel.app`):

1. Go back to **Render Dashboard** $\rightarrow$ Select `drivehub-goa-backend` $\rightarrow$ **Environment**.
2. Update `CORS_ORIGINS`:
   ```text
   https://drivehub-goa.vercel.app,https://drivehubgoa.com
   ```
3. Click **Save Changes** (Render will automatically redeploy backend).

---

## Step 5: Setup Free 24/7 Keep-Alive Cron-Job

Render free tier web services go to sleep after 15 minutes of inactivity. Setting up a free 10-minute HTTP cron-job keeps your server awake so users never experience a 30-second cold start delay.

### Using Cron-Job.org (Recommended)
1. Sign up for a free account at [Cron-Job.org](https://cron-job.org).
2. Go to **Cronjobs** $\rightarrow$ Click **Create Cronjob**.
3. **Title**: `DriveHub Goa Backend KeepAlive`
4. **URL**: `https://drivehub-goa-backend.onrender.com/api/healthz`
5. **Execution Schedule**: Select **Every 10 minutes** (`*/10 * * * *`).
6. **Request Method**: `GET`
7. Click **Create**.

### Alternative: Using UptimeRobot
1. Sign up for a free account at [UptimeRobot.com](https://uptimerobot.com).
2. Click **Add New Monitor**.
3. Monitor Type: **HTTP(s)**
4. Friendly Name: `DriveHub Backend`
5. URL: `https://drivehub-goa-backend.onrender.com/api/healthz`
6. Monitoring Interval: **5 or 10 minutes**.
7. Click **Create Monitor**.

---

## Step 6: Final Verification Checklist

After deployment, perform these 5 quick checks:

- [ ] **Health Endpoint**: Open `https://drivehub-goa-backend.onrender.com/api/healthz` in browser. Expect `{"status": "healthy", "database": "connected"}`.
- [ ] **Admin Login**: Go to `https://drivehub-goa.vercel.app/admin/login` and log in with `admin@drivehubgoa.com` / `Admin@123`.
- [ ] **Fleet Verification**: Verify 21 cars display on `https://drivehub-goa.vercel.app/fleet`.
- [ ] **Quote Calculation**: Select dates on booking page and verify total fare calculation.
- [ ] **Robots & Sitemap**: Check `https://drivehub-goa.vercel.app/robots.txt`, `sitemap.xml`, and `llms.txt`.
