import fs from 'node:fs';
import path from 'node:path';

function getLogoBase64(): string {
  try {
    const candidates = [
      path.join(__dirname, '../../../../frontend/public/logo.png'),
      path.join(__dirname, '../../../frontend/public/logo.png'),
      path.join(__dirname, '../../frontend/public/logo.png'),
      path.join(__dirname, '../frontend/public/logo.png'),
      path.join(process.cwd(), '../frontend/public/logo.png'),
      path.join(process.cwd(), 'frontend/public/logo.png'),
      path.join(process.cwd(), 'public/logo.png'),
      path.join(__dirname, '../assets/logo.png'),
      path.join(process.cwd(), 'src/assets/logo.png'),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const buf = fs.readFileSync(p);
        return `data:image/png;base64,${buf.toString('base64')}`;
      }
    }
  } catch {}
  return '/logo.png';
}

function fmtDt(isoStr: string): string {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return isoStr;
  }
}

export function numToWords(n: number): string {
  try {
    const val = Math.round(n);
    if (val <= 0) return 'Rupees Zero Only';
    const units = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
    ];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function convert(num: number): string {
      if (num < 20) return units[num];
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + units[num % 10] : '');
      if (num < 1000) return units[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convert(num % 100) : '');
      if (num < 100000)
        return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convert(num % 1000) : '');
      if (num < 10000000)
        return convert(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convert(num % 100000) : '');
      return (
        convert(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + convert(num % 10000000) : '')
      );
    }

    return `Rupees ${convert(val)} Only`;
  } catch {
    return `Rupees ${n.toLocaleString('en-IN')}`;
  }
}

export function renderInvoiceHtml(booking: any): string {
  const cust = booking.customer || {};
  const vs = booking.vehicle_snapshot || booking.vehicle || {};

  const bookingNo = booking.booking_no || `CCG-${(booking.id || 'INV').slice(0, 8).toUpperCase()}`;
  const invoiceDateFmt = fmtDt(booking.created_at || new Date().toISOString());
  const startDateFmt = booking.pickup_date || fmtDt(booking.start_date || '');
  const endDateFmt = booking.drop_date || fmtDt(booking.end_date || '');
  const pickupTime = booking.pickup_time || '09:00 AM';
  const dropTime = booking.drop_time || '06:00 PM';

  const custName = cust.name || 'Valued Guest';
  const custPhone = cust.phone || booking.phone || '—';
  const custEmail = cust.email || 'customer@cabcastlegoa.com';
  const aadhaarNumber = cust.aadhar || cust.aadhaar_no || cust.aadhaarNumber || '';

  const carTitle = vs.title || booking.vehicle_title || (vs.make ? `${vs.make} ${vs.model}` : 'Tour Rental Cab');
  const carCategory = vs.category || (carTitle.includes('Swift') || carTitle.includes('Baleno') ? 'Hatchback' : carTitle.includes('Innova') || carTitle.includes('Ertiga') ? 'SUV / MPV' : 'Sedan');
  const partitionType = booking.service_type === 'transfer' ? 'Airport / Station Transfer' : 'Tour & Sightseeing Cab (With Driver)';

  const days = Math.max(1, Number(booking.days) || 1);
  const pickupLoc = booking.pickup_location || 'Candolim Beach Resort, North Goa';
  const dropLoc = booking.drop_location || 'Candolim Beach Resort, North Goa';

  const totalAmount = Number(booking.total_amount) || Number(booking.base_amount) || 2500;
  const ratePerDay = booking.per_day_rate ? Number(booking.per_day_rate) : Math.round(totalAmount / days);

  const logoBase64 = getLogoBase64();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cab Castle Goa — Tax Invoice #${bookingNo}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&family=Cinzel:wght@700;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0F172A;
      background: #F8FAFC;
      padding: 32px 16px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .serif-brand { font-family: 'Cinzel', serif; }
    
    .invoice-wrapper {
      max-width: 860px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .action-bar {
      max-width: 860px;
      margin: 0 auto 12px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .print-btn {
      background: #063247;
      color: #FFFFFF;
      border: 1px solid #E5A93C;
      padding: 10px 24px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(6,50,71,0.15);
      transition: all 0.2s ease;
    }
    .print-btn:hover { background: #E5A93C; color: #063247; transform: translateY(-1px); }

    /* Page 1: Main Invoice Card */
    .invoice-card {
      background: #FFFFFF;
      border-radius: 20px;
      border: 1px solid #E2E8F0;
      box-shadow: 0 4px 24px rgba(0,0,0,0.03);
      overflow: hidden;
      page-break-after: always;
    }

    /* Clean Minimal Header */
    .header-banner {
      background: #FAF8F5;
      padding: 28px 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid #E8E0D2;
    }
    .brand-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo-img {
      height: 52px;
      width: auto;
      max-width: 140px;
      object-fit: contain;
      border-radius: 10px;
    }
    .brand-info {
      text-align: left;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 900;
      color: #063247;
      letter-spacing: -0.3px;
    }
    .brand-tagline {
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #D4901F;
      margin-top: 1px;
    }
    .brand-meta {
      font-size: 11px;
      color: #64748B;
      margin-top: 3px;
      line-height: 1.4;
    }

    .voucher-meta-box {
      text-align: right;
    }
    .voucher-pill {
      display: inline-block;
      background: #063247;
      color: #FFFFFF;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .voucher-number {
      font-size: 16px;
      font-weight: 900;
      color: #063247;
      letter-spacing: 0.5px;
    }
    .voucher-date {
      font-size: 11px;
      color: #64748B;
      margin-top: 2px;
    }
    .status-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 800;
      color: #047857;
      margin-top: 4px;
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      padding: 2px 8px;
      border-radius: 6px;
    }

    /* Invoice Content Body */
    .invoice-body {
      padding: 28px 36px;
    }

    /* 3-Column Info Summary */
    .info-summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 14px;
      margin-bottom: 22px;
    }
    .summary-card {
      background: #FAF8F5;
      border: 1px solid #E8E0D2;
      border-radius: 14px;
      padding: 14px 16px;
      text-align: left;
    }
    .card-label {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #64748B;
      margin-bottom: 4px;
    }
    .card-main {
      font-size: 13px;
      font-weight: 800;
      color: #063247;
      line-height: 1.3;
    }
    .card-sub {
      font-size: 11px;
      color: #475569;
      margin-top: 3px;
      line-height: 1.4;
    }

    /* Itinerary Schedule Card */
    .itinerary-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 16px 20px;
      margin-bottom: 22px;
      text-align: left;
    }
    .route-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #F1F5F9;
    }
    .route-grid {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 16px;
    }
    .route-node .node-type {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .route-node.pickup .node-type { color: #0284C7; }
    .route-node.drop .node-type { color: #0F172A; }
    .route-node .datetime {
      font-size: 12.5px;
      font-weight: 800;
      color: #063247;
    }
    .route-node .address {
      font-size: 11.5px;
      color: #475569;
      margin-top: 2px;
    }
    .route-arrow-icon {
      font-size: 16px;
      color: #94A3B8;
      font-weight: bold;
    }

    /* Itemized Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
    }
    thead th {
      text-align: left;
      padding: 10px 14px;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #475569;
      background: #F1F5F9;
      border-top: 1px solid #E2E8F0;
      border-bottom: 1px solid #CBD5E1;
    }
    tbody td {
      padding: 12px 14px;
      font-size: 12px;
      border-bottom: 1px solid #F1F5F9;
      color: #0F172A;
      vertical-align: top;
      text-align: left;
    }
    .table-desc-title { font-weight: 800; color: #063247; }
    .table-desc-sub { font-size: 11px; color: #64748B; margin-top: 2px; }
    .col-rate { text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 600; }
    .col-amount { text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #063247; }

    /* Minimalist Total Card */
    .total-card {
      background: #FAF8F5;
      border: 1.5px solid #E8E0D2;
      border-radius: 14px;
      padding: 18px 22px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 22px;
      text-align: left;
    }
    .total-label {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #063247;
    }
    .total-terms {
      font-size: 11px;
      color: #64748B;
      margin-top: 2px;
    }
    .total-amount {
      font-size: 24px;
      font-weight: 900;
      color: #063247;
      letter-spacing: -0.5px;
    }

    /* Two Signature Boxes (Owner & Customer) */
    .signatures-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px dashed #CBD5E1;
      text-align: left;
    }
    .sign-box {
      border: 1px solid #E2E8F0;
      background: #FFFFFF;
      border-radius: 14px;
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 120px;
    }
    .sign-box-title {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #063247;
    }
    .sign-box-desc {
      font-size: 10px;
      color: #64748B;
      margin-top: 2px;
    }
    .sign-line {
      margin-top: 36px;
      border-top: 1px solid #94A3B8;
      padding-top: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #475569;
      font-weight: 700;
    }

    /* Page 2: Terms and Conditions Card */
    .terms-card {
      background: #FFFFFF;
      border-radius: 20px;
      border: 1px solid #E2E8F0;
      box-shadow: 0 4px 24px rgba(0,0,0,0.03);
      padding: 32px 36px;
      text-align: left;
    }
    .terms-header {
      border-bottom: 1.5px solid #E2E8F0;
      padding-bottom: 14px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .terms-title {
      font-size: 16px;
      font-weight: 900;
      color: #063247;
    }
    .terms-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .term-item {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 14px 16px;
    }
    .term-item-title {
      font-size: 11px;
      font-weight: 800;
      color: #063247;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .term-item-body {
      font-size: 10.5px;
      color: #475569;
      line-height: 1.5;
    }

    .terms-footer-sign {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px dashed #CBD5E1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .invoice-footer {
      padding-top: 14px;
      margin-top: 18px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748B;
    }

    @media print {
      .no-print { display: none !important; }
      body { padding: 0; background: #FFFFFF; }
      .invoice-wrapper { gap: 0; }
      .invoice-card, .terms-card {
        box-shadow: none;
        border: none;
        border-radius: 0;
        max-width: 100%;
        padding: 20px 24px;
      }
      .invoice-card {
        page-break-after: always;
      }
      .terms-card {
        page-break-before: always;
      }
      .header-banner, .total-card, .summary-card, .term-item, .sign-box {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  
  <div class="no-print action-bar">
    <button onclick="window.print()" class="print-btn">
      <span>🖨️ Print / Save Tax Invoice</span>
    </button>
  </div>

  <div class="invoice-wrapper">
    
    <!-- ================= PAGE 1: INVOICE & TRIP DETAILS ================= -->
    <div class="invoice-card">
      
      <!-- Top Royal Brand Header with Official Logo -->
      <div class="header-banner">
        <div class="brand-left">
          <img src="${logoBase64}" alt="Cab Castle Goa" class="brand-logo-img" onerror="this.style.display='none'" />
          <div class="brand-info">
            <div class="brand-title serif-brand">CAB CASTLE GOA</div>
            <div class="brand-tagline">PREMIUM CABS &amp; TOUR TRAVELS</div>
            <div class="brand-meta">
              Assagao, Bardez, Goa 403507<br>
              24/7 Dispatch &amp; Helpline: <strong>+91 70266 48960</strong>
            </div>
          </div>
        </div>

        <div class="voucher-meta-box">
          <div class="voucher-pill">Tax Invoice &amp; Voucher</div>
          <div class="voucher-number mono">#${bookingNo}</div>
          <div class="voucher-date">Issue Date: ${invoiceDateFmt}</div>
          <div class="status-badge">✓ CONFIRMED · ZERO ADVANCE</div>
        </div>
      </div>

      <div class="invoice-body">
        
        <!-- 3-Column Info Summary -->
        <div class="info-summary-grid">
          
          <!-- Column 1: Passenger Info -->
          <div class="summary-card">
            <div class="card-label">Passenger Details</div>
            <div class="card-main">${custName}</div>
            <div class="card-sub mono font-bold">📱 ${custPhone}</div>
            ${custEmail ? `<div class="card-sub truncate">✉️ ${custEmail}</div>` : ''}
            ${aadhaarNumber ? `<div class="card-sub mono text-[10.5px]">🆔 Aadhaar: XXXX-XXXX-${aadhaarNumber.replace(/\\D/g, '').slice(-4)}</div>` : ''}
          </div>

          <!-- Column 2: Vehicle & Category -->
          <div class="summary-card">
            <div class="card-label">Vehicle &amp; Inclusions</div>
            <div class="card-main">${carTitle}</div>
            <div class="card-sub">🚘 ${carCategory} · Sanitized AC</div>
            <div class="card-sub text-[11px] text-emerald-700 font-bold">✓ Fuel &amp; Driver Included</div>
          </div>

          <!-- Column 3: Service & Duration -->
          <div class="summary-card">
            <div class="card-label">Service &amp; Booking Type</div>
            <div class="card-main">${partitionType}</div>
            <div class="card-sub font-bold">${days} Day(s) Package</div>
            <div class="card-sub text-[11px] text-[#0284C7] font-mono">${days * 8}h · ${days * 80}km Included</div>
          </div>

        </div>

        <!-- Route & Itinerary Schedule -->
        <div class="itinerary-card">
          <div class="route-header">
            <span class="card-label" style="margin-bottom: 0;">Pickup &amp; Drop-off Itinerary</span>
            <span class="mono text-xs font-bold text-[#64748B]">${days} Day Tour Schedule</span>
          </div>
          <div class="route-grid">
            <div class="route-node pickup">
              <div class="node-type">● Pick-up Schedule</div>
              <div class="datetime">${startDateFmt} at ${pickupTime}</div>
              <div class="address">📍 ${pickupLoc}</div>
            </div>

            <div class="route-arrow-icon">→</div>

            <div class="route-node drop">
              <div class="node-type">■ Drop-off Schedule</div>
              <div class="datetime">${endDateFmt} at ${dropTime}</div>
              <div class="address">📍 ${dropLoc}</div>
            </div>
          </div>
        </div>

        <!-- Itemized Table -->
        <table>
          <thead>
            <tr>
              <th style="width: 52%;">Item &amp; Service Description</th>
              <th class="col-rate" style="width: 25%;">Rate Structure</th>
              <th class="col-amount" style="width: 23%;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="table-desc-title">${carTitle} Tour Cab with Chauffeur</div>
                <div class="table-desc-sub">${days} Day(s) (${days * 8} Hours / ${days * 80} KM Included) · Sanitized AC Cab</div>
              </td>
              <td class="col-rate">&#8377; ${Number(ratePerDay).toLocaleString('en-IN')} &times; ${days} d</td>
              <td class="col-amount">&#8377; ${Number(totalAmount).toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        <!-- Minimalist Total Card -->
        <div class="total-card">
          <div>
            <div class="total-label">Total Estimated Tariff (Pay to Driver)</div>
            <div class="total-terms">Zero Advance Paid · Pay &#8377; ${Number(totalAmount).toLocaleString('en-IN')} (${numToWords(totalAmount)}) upon trip completion via UPI or Cash</div>
          </div>
          <div class="total-amount mono">&#8377; ${Number(totalAmount).toLocaleString('en-IN')}</div>
        </div>

        <!-- Two Signature Boxes (Owner & Customer) -->
        <div class="signatures-grid">
          <!-- Box 1: Owner / Fleet Signatory -->
          <div class="sign-box">
            <div>
              <div class="sign-box-title">Authorized Signatory (Fleet Owner)</div>
              <div class="sign-box-desc">For Cab Castle Goa — Assagao, Bardez, Goa</div>
            </div>
            <div class="sign-line">
              <span>Signature &amp; Seal</span>
              <span>Date: ${invoiceDateFmt}</span>
            </div>
          </div>

          <!-- Box 2: Customer Acceptance -->
          <div class="sign-box">
            <div>
              <div class="sign-box-title">Customer / Traveler Acceptance</div>
              <div class="sign-box-desc">I confirm service receipt &amp; agree to tariff &amp; terms.</div>
            </div>
            <div class="sign-line">
              <span>${custName} (Sign)</span>
              <span>Date: ____________</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="invoice-footer">
          <div>Cab Castle Goa · Official Tour &amp; Travel Voucher #${bookingNo}</div>
          <div>Page 1 of 2 · Dispatch Helpline: +91 70266 48960</div>
        </div>

      </div>
    </div>

    <!-- ================= PAGE 2: TERMS & CONDITIONS ================= -->
    <div class="terms-card">
      <div class="terms-header">
        <div>
          <div class="terms-title serif-brand">TERMS &amp; CONDITIONS OF SERVICE</div>
          <div class="brand-tagline">CAB CASTLE GOA · CHAUFFEUR &amp; TOUR RENTAL POLICIES</div>
        </div>
        <div class="voucher-number mono text-xs">Voucher Ref: #${bookingNo}</div>
      </div>

      <div class="terms-grid">
        <div class="term-item">
          <div class="term-item-title">1. Service Scope &amp; Inclusions</div>
          <div class="term-item-body">
            All rentals include clean, sanitized air-conditioned vehicle, dedicated commercial driver allowance, and standard vehicle fuel. Rates are based on agreed route and duration.
          </div>
        </div>

        <div class="term-item">
          <div class="term-item-title">2. Working Hours &amp; Excess Usage</div>
          <div class="term-item-body">
            Full-day tour package covers up to 8 hours and 80 km per day. Excess usage beyond package limits will be charged at standard rates (Extra hour: &#8377;250/hr, Extra distance: &#8377;25/km).
          </div>
        </div>

        <div class="term-item">
          <div class="term-item-title">3. Tolls, Parking &amp; Entry Fees</div>
          <div class="term-item-body">
            Parking charges, airport entry fees, monument tickets, and state border permits (if applicable) are not included in base tariff and shall be paid directly by the passenger.
          </div>
        </div>

        <div class="term-item">
          <div class="term-item-title">4. Safety, Luggage &amp; Conduct</div>
          <div class="term-item-body">
            Smoking, consuming alcohol, and carrying hazardous or illegal substances inside the vehicle is strictly prohibited. Passengers are responsible for personal belongings.
          </div>
        </div>

        <div class="term-item">
          <div class="term-item-title">5. Payment Policy (Zero Advance)</div>
          <div class="term-item-body">
            No advance deposit is required. 100% payment is due upon trip completion and can be paid directly to the chauffeur via UPI, Google Pay, PhonePe, or Cash.
          </div>
        </div>

        <div class="term-item">
          <div class="term-item-title">6. Cancellation &amp; Support</div>
          <div class="term-item-body">
            Free cancellations are allowed up to 3 hours before scheduled pickup time. For 24/7 route updates or emergency support, contact Goa Dispatch at <strong>+91 70266 48960</strong>.
          </div>
        </div>
      </div>

      <!-- Second Signature Block on Terms Sheet -->
      <div class="terms-footer-sign">
        <div class="sign-box" style="min-height: 100px;">
          <div>
            <div class="sign-box-title">Authorized Signatory (Cab Castle Goa)</div>
            <div class="sign-box-desc">Verified Dispatch Stamp &amp; Signature</div>
          </div>
          <div class="sign-line">
            <span>Official Seal</span>
            <span>Date: ${invoiceDateFmt}</span>
          </div>
        </div>

        <div class="sign-box" style="min-height: 100px;">
          <div>
            <div class="sign-box-title">Customer Acknowledgment</div>
            <div class="sign-box-desc">I have read and accepted all terms &amp; conditions.</div>
          </div>
          <div class="sign-line">
            <span>Customer Signature</span>
            <span>Date: ____________</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="invoice-footer">
        <div>Cab Castle Goa · Assagao, Bardez, Goa 403507 · support@cabcastlegoa.com</div>
        <div>Page 2 of 2 · Official Customer &amp; Owner Copy</div>
      </div>
    </div>

  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>`;
}
