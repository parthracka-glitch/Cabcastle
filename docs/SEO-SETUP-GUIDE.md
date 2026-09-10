# Cab Castle Goa — Advanced Search Engine & Webmaster Setup Guide

Complete step-by-step master checklist for getting **Cab Castle Goa** ranked #1 on Google Search, Google Maps (Local 3-Pack), Bing, and AI Search Engines (ChatGPT, Perplexity, Claude).

---

## 📋 1. Environment Variables Overview

Add the following variables to your **Vercel** environment variables or `frontend/.env` file:

```ini
# Google Analytics 4 Measurement ID (format: G-XXXXXXXXXX)
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Search Console HTML Meta Verification Code (string inside content="")
REACT_APP_GSC_VERIFICATION=your_google_verification_code_here

# Bing Webmaster Tools Meta Verification Code (string inside content="")
REACT_APP_BING_VERIFICATION=your_bing_verification_code_here
```

---

## 🔍 2. Google Search Console (GSC) Setup

### Step 1: Add Property
1. Go to [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property**.
3. Choose **URL prefix**: `https://cabcastlegoa.com` (or your production domain).

### Step 2: Verification Method
- **Method A (HTML Tag - Instant):**
  1. Select **HTML tag** under Other verification methods.
  2. Copy the verification string inside `content="..."`.
  3. Set `REACT_APP_GSC_VERIFICATION` in Vercel environment variables.
  4. Redeploy frontend and click **Verify** in Search Console.
- **Method B (DNS TXT Record - Most Stable):**
  1. In Search Console, select **Domain** verification.
  2. Copy the TXT record and add it to your DNS registrar (GoDaddy / Hostinger / Cloudflare / Namecheap).
  3. Click **Verify**.

### Step 3: Submit XML Sitemap
1. In Search Console, click **Sitemaps** in the left sidebar.
2. Under "Add a new sitemap", enter: `sitemap.xml`
3. Click **Submit**. Google will index all URLs listed in `https://cabcastlegoa.com/sitemap.xml`.

### Step 4: Request Instant Indexing for Key URLs
1. In the top search bar ("Inspect any URL in..."), inspect:
   - `https://cabcastlegoa.com/`
   - `https://cabcastlegoa.com/fleet`
   - `https://cabcastlegoa.com/about`
   - `https://cabcastlegoa.com/booking/v-sedan-dzire`
   - `https://cabcastlegoa.com/booking/v-ertiga`
   - `https://cabcastlegoa.com/booking/v-innova-crysta`
2. Click **Test Live URL** ➔ **Request Indexing**.

---

## 📍 3. Google Business Profile (Local SEO & Google Maps #1 Ranking)

For cab rentals in Goa, **Google Maps (Local Map 3-Pack)** brings over 70% of high-intent bookings.

1. Open [Google Business Profile](https://business.google.com/).
2. Create / Claim your profile with exact **NAP (Name, Address, Phone)** consistency:
   - **Business Name:** Cab Castle Goa — Premium Cab Rental & Tour Travels
   - **Primary Category:** Taxi Service
   - **Secondary Categories:** Car Rental Agency, Tour Agency, Airport Shuttle Service
   - **Address:** Assagao, Bardez, North Goa, 403507
   - **Phone:** `+91 70266 48960`
   - **Website:** `https://cabcastlegoa.com`
   - **Service Areas:** North Goa, South Goa, Candolim, Calangute, Baga, Panaji, Anjuna, Assagao, Dabolim Airport (GOI), Mopa Airport (GOX), Margao Railway Station, Thivim Railway Station.
   - **Opening Hours:** 24 hours / 7 days a week.
3. Add high-quality photos of the fleet (Dzire, Ertiga, Innova Crysta) with the Cab Castle logo.
4. Collect 10–15 verified 5-star customer reviews mentioning keywords like *"Goa airport cab"*, *"8 hrs 80 km tour"*, *"North Goa taxi"*.

---

## 🌐 4. Bing Webmaster Tools & IndexNow

1. Visit [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Sign in and click **Import from Google Search Console** (1-click automatic verification and sitemap sync).
3. Submit sitemap: `https://cabcastlegoa.com/sitemap.xml`.

---

## 📊 5. Google Analytics 4 (GA4) Conversion Tracking

1. Go to [Google Analytics](https://analytics.google.com/).
2. Create an Account & Property for **Cab Castle Goa**.
3. Set Web Data Stream URL to `https://cabcastlegoa.com` (Stream name: "Cab Castle Goa Web").
4. Copy the **Measurement ID** (`G-XXXXXXXXXX`).
5. Add `REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX` in Vercel environment variables.
6. The app automatically initializes `gtag.js` and tracks booking clicks and lead submissions.

---

## 🤖 6. Generative Engine Optimization (GEO) & AI Indexing

The website includes `llms.txt` at `https://cabcastlegoa.com/llms.txt` and permissive AI bot permissions in `robots.txt`:
- **GPTBot** (ChatGPT Search)
- **ClaudeBot** (Anthropic Claude)
- **PerplexityBot** (Perplexity AI Search)
- **Google-Extended** (Google Gemini & AI Overviews)

This ensures when users ask AI search tools *"What is the best cab service in Goa for 8 hour tours or Mopa airport pickup?"*, Cab Castle Goa is directly cited with current rates and phone number (`+91 70266 48960`).
