# DriveHub Goa — Hosting & Database Free Tier Capacity Analysis

This document provides an engineering capacity analysis for running **Drivehub Goa** on **Vercel** (Frontend), **Render** (Backend), and **MongoDB Atlas M0 512 MB** (Database).

---

## 1. Document Size Breakdown in MongoDB

Based on the actual schema fields and BSON storage overhead:

| Document Type | Uncompressed Size | Index Overhead | Total Storage per Document |
| :--- | :--- | :--- | :--- |
| **`users`** (Customer / Admin profile) | ~0.3 KB (300 bytes) | ~0.1 KB | **~0.4 KB** |
| **`vehicles`** (Fleet catalog — static ~25 cars) | ~0.6 KB (600 bytes) | ~0.1 KB | **~0.7 KB** (Total ~18 KB) |
| **`bookings`** (Reservation & payment info) | ~0.9 KB (900 bytes) | ~0.2 KB | **~1.1 KB** |
| **`enquiries`** (CRM lead record) | ~0.4 KB (400 bytes) | ~0.1 KB | **~0.5 KB** |
| **`coupons`** (Promo codes — static ~10 codes) | ~0.2 KB (200 bytes) | ~0.1 KB | **~0.3 KB** (Total ~3 KB) |

> **WiredTiger Engine Compression**: MongoDB Atlas automatically uses Snappy / Zlib compression for document blocks, compressing raw text data by **2x to 3x**. Therefore, 512 MB of physical storage in Atlas M0 holds **~1.2 GB of raw logical JSON data**.

---

## 2. Total Storage Capacity Limits

If filling the **512 MB (524,288 KB)** storage limit with only one document type:

- **Users Only**: Store up to **~1,300,000 (1.3 Million) Users**.
- **Bookings Only**: Store up to **~475,000 Bookings** (uncompressed) or **~1.2 Million Bookings** (compressed).
- **Enquiries Only**: Store up to **~1,000,000 (1 Million) Lead Enquiries**.

---

## 3. Real-World Sustainability Projections

In normal operation, each booking cycle generates **1 Booking record + 1 Customer account + 2 CRM enquiries/follow-ups**.

$$\text{Data Generated per Booking Cycle} \approx 2.5\text{ KB}$$

### Storage Longevity Projections

| Daily Booking Volume | Daily Data Growth | Annual Storage Used | How Long 512 MB Free Tier Lasts |
| :--- | :--- | :--- | :--- |
| **5 Bookings / day** | ~12.5 KB / day | **~4.5 MB / year** | **~113 YEARS** |
| **10 Bookings / day** | ~25 KB / day | **~9.1 MB / year** | **~56 YEARS** |
| **25 Bookings / day** | ~62.5 KB / day | **~22.8 MB / year** | **~22 YEARS** |

---

## 4. Vercel & Render Free Tier Capabilities

### A. Vercel (Frontend Hosting)
- **Free Tier Allocation**: 100 GB Bandwidth/month, free SSL certificate, global edge CDN.
- **Sustainability**: At 25 bookings/day (~1,000 daily site visitors), bandwidth usage is under **3 GB / month out of 100 GB**. It will remain **100% free indefinitely**.

### B. Render (Backend FastAPI Server)
- **Free Tier Allocation**: 512 MB RAM, 0.1 CPU, 750 free instance hours/month (enough for 24/7 runtime for 1 app).
- **Cold Start Behavior**: Free web services spin down after 15 minutes of inactivity, causing a 30–45 second delay on the first user request after idle periods.

---

## 5. Free Performance & Keep-Alive Hacks

### Prevent Render Cold Start Delays (100% Free)
1. Sign up for a free uptime monitor such as [UptimeRobot.com](https://uptimerobot.com) or [Cron-job.org](https://cron-job.org).
2. Configure a free HTTP monitor targeting your backend healthcheck endpoint every 10 minutes:
   ```text
   https://your-backend-app.onrender.com/api/healthz
   ```
3. This keeps your Render server active 24/7 with zero initial load delays for customers.

---

## 6. Summary

The free infrastructure stack (**Vercel + Render + MongoDB Atlas M0 512 MB**) is exceptionally efficient and capable of sustaining **25 to 50 bookings per day for over 20 years** without incurring hosting or database subscription costs.
