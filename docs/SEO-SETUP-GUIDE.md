# DriveHub Goa — Search Engine & Webmaster Setup Guide

This guide provides step-by-step instructions for verifying domain ownership, configuring Google Search Console, Bing Webmaster Tools, Google Analytics 4, and optimizing Google Business Profile for local SEO.

---

## 1. Environment Variables Overview

Add the following variables to your `frontend/.env` file in production:

```ini
# Google Analytics 4 Measurement ID (e.g. G-ABC123XYZ)
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Search Console HTML Meta Verification Code (string inside content="")
REACT_APP_GSC_VERIFICATION=your_google_verification_code_here

# Bing Webmaster Tools Meta Verification Code (string inside content="")
REACT_APP_BING_VERIFICATION=your_bing_verification_code_here
```

---

## 2. Google Search Console (GSC) Setup

### Step 1: Add Property
1. Go to [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property**.
3. Choose **URL prefix**: `https://drivehubgoa.in` (or your production domain).

### Step 2: Verification Method
- **Method A (HTML Tag - Recommended):**
  1. Select **HTML tag** under Other verification methods.
  2. Copy the code inside `content="..."` (e.g., `dBx_...`).
  3. Paste it into `frontend/.env`:
     ```ini
     REACT_APP_GSC_VERIFICATION=dBx_your_verification_string
     ```
  4. Deploy or rebuild the frontend (`npm run build`).
  5. Click **Verify** in Search Console.
- **Method B (DNS TXT Record):**
  1. If verifying via Domain level, copy the TXT record from Google and add it to your DNS registrar (Hostinger / GoDaddy / Cloudflare).

### Step 3: Submit Sitemap
1. In Search Console, click **Sitemaps** in the left sidebar.
2. Under "Add a new sitemap", enter: `sitemap.xml`
3. Click **Submit**. Google will crawl `https://drivehubgoa.in/sitemap.xml`.

### Step 4: Request Indexing for Key Pages
1. Use the **URL Inspection** search bar at the top of GSC.
2. Enter:
   - `https://drivehubgoa.in/`
   - `https://drivehubgoa.in/fleet`
3. Click **Test Live URL** -> **Request Indexing**.

---

## 3. Bing Webmaster Tools Setup

1. Visit [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Sign in and click **Add a site** (you can also import directly from Google Search Console with one click).
3. If adding manually via HTML meta tag, copy the verification code from the tag and add it to `frontend/.env`:
   ```ini
   REACT_APP_BING_VERIFICATION=your_bing_code_here
   ```
4. Click **Verify**.
5. Submit your sitemap: `https://drivehubgoa.in/sitemap.xml`.

---

## 4. Google Analytics 4 (GA4) Setup

1. Go to [Google Analytics](https://analytics.google.com/).
2. Create an Account & Property for **DriveHub Goa**.
3. Set Data Stream URL to `https://drivehubgoa.in` (Stream name: "DriveHub Goa Web").
4. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`).
5. Add it to `frontend/.env`:
   ```ini
   REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
6. The application automatically initializes `gtag.js` and tracks page views and conversions.

---

## 5. Google Business Profile (Local SEO)

1. Claim or create your profile on [Google Business Profile](https://business.google.com/).
2. Use exact NAP (Name, Address, Phone) consistency:
   - **Business Name:** DriveHub Goa — Self-Drive Car Rentals
   - **Primary Category:** Car Rental Agency
   - **Address:** Fort Aguada Road, Candolim, North Goa, 403515
   - **Phone:** `+91 85305 33505`
   - **Website:** `https://drivehubgoa.in`
   - **Service Areas:** North Goa, South Goa, Candolim, Calangute, Baga, Panaji, Mopa Airport (GOX), Dabolim Airport (GOI).
3. Once verified, copy your Google review sharing link and set `GOOGLE_PROFILE_REVIEWS_URL` in [Landing.jsx](file:///e:/DriveHub-Goa-main/frontend/src/website/pages/Landing.jsx#L32) to showcase verified Google reviews.

---

## 6. Generative Engine Optimization (GEO) & AI Crawlers

The website includes `llms.txt` located at `https://drivehubgoa.in/llms.txt`.  
AI crawlers (**GPTBot**, **ClaudeBot**, **PerplexityBot**, **Google-Extended**) are permitted in `robots.txt` to index fleet details, pricing, and airport delivery specifications for AI search engines.
