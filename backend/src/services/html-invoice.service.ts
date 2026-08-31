import fs from 'node:fs';
import path from 'node:path';

function getLogoBase64(): string {
  try {
    const candidates = [
      path.join(__dirname, '../assets/logo.png'),
      path.join(__dirname, '../../src/assets/logo.png'),
      path.join(process.cwd(), 'src/assets/logo.png'),
      path.join(process.cwd(), 'dist/assets/logo.png'),
      path.join(process.cwd(), '../frontend/public/logo.png'),
      path.join(process.cwd(), 'frontend/public/logo.png'),
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
    return `Rupees ${n.toFixed(2)}`;
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cab Castle Goa — Tax Invoice & Voucher #${bookingNo}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&family=Cinzel:wght@700;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #070A11;
      background: #F4F6F8;
      padding: 32px 16px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .serif-brand { font-family: 'Cinzel', serif; }
    
    .invoice-card {
      max-width: 840px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 20px;
      border: 1px solid #E2E8F0;
      box-shadow: 0 16px 40px rgba(0,0,0,0.08);
      overflow: hidden;
    }

    .action-bar {
      max-width: 840px;
      margin: 0 auto 16px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .print-btn {
      background: linear-gradient(135deg, #070A11, #1E293B);
      color: #FFFFFF;
      border: 1px solid #E5A93C;
      padding: 10px 24px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
      letter-spacing: 0.5px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.15);
      transition: all 0.2s ease;
    }
    .print-btn:hover { background: #E5A93C; color: #070A11; transform: translateY(-1px); }

    /* Top Royal Brand Header */
    .header-banner {
      background: linear-gradient(135deg, #070A11 0%, #0F172A 100%);
      color: #FFFFFF;
      padding: 32px 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #E5A93C;
    }
    .brand-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo-crest {
      width: 58px;
      height: 58px;
      border-radius: 14px;
      border: 1.5px solid #E5A93C;
      background: #0B1120;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      box-shadow: 0 0 16px rgba(229,169,60,0.25);
    }
    .brand-title {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.3px;
      color: #FFFFFF;
    }
    .brand-tagline {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #E5A93C;
      margin-top: 2px;
    }
    .brand-meta {
      font-size: 11px;
      color: #94A3B8;
      margin-top: 4px;
      line-height: 1.4;
    }

    .voucher-meta-box {
      text-align: right;
    }
    .voucher-pill {
      display: inline-block;
      background: rgba(229,169,60,0.15);
      color: #F6D285;
      border: 1px solid rgba(229,169,60,0.4);
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 9.5px;
      font-weight: 900;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .voucher-number {
      font-size: 18px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: 0.5px;
    }
    .voucher-date {
      font-size: 11px;
      color: #94A3B8;
      margin-top: 2px;
    }
    .status-badge {
      display: inline-block;
      font-size: 10.5px;
      font-weight: 800;
      color: #34D399;
      margin-top: 4px;
      background: rgba(52,211,153,0.1);
      padding: 2px 8px;
      border-radius: 6px;
    }

    /* Main Content Body */
    .invoice-body {
      padding: 32px 36px;
    }

    /* 3-Column Info Summary */
    .info-summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .summary-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 16px;
      text-align: left;
    }
    .card-label {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #64748B;
      margin-bottom: 6px;
    }
    .card-main {
      font-size: 13.5px;
      font-weight: 800;
      color: #0F172A;
      line-height: 1.3;
    }
    .card-sub {
      font-size: 11.5px;
      color: #475569;
      margin-top: 4px;
      line-height: 1.4;
    }

    /* Itinerary Schedule Card */
    .itinerary-card {
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 14px;
      padding: 18px 22px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }
    .route-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
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
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .route-node.pickup .node-type { color: #0284C7; }
    .route-node.drop .node-type { color: #0F172A; }
    .route-node .datetime {
      font-size: 13px;
      font-weight: 800;
      color: #0F172A;
    }
    .route-node .address {
      font-size: 12px;
      color: #475569;
      margin-top: 2px;
    }
    .route-arrow-icon {
      font-size: 18px;
      color: #94A3B8;
      font-weight: bold;
    }

    /* Itemized Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    thead th {
      text-align: left;
      padding: 12px 14px;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #475569;
      background: #F1F5F9;
      border-top: 1px solid #E2E8F0;
      border-bottom: 1px solid #CBD5E1;
    }
    tbody td {
      padding: 14px 14px;
      font-size: 12.5px;
      border-bottom: 1px solid #F1F5F9;
      color: #0F172A;
      vertical-align: top;
    }
    .table-desc-title { font-weight: 800; color: #0F172A; }
    .table-desc-sub { font-size: 11px; color: #64748B; margin-top: 2px; }
    .col-rate { text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 600; }
    .col-amount { text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 800; }

    /* Total Box */
    .total-card {
      background: linear-gradient(135deg, #070A11 0%, #0F172A 100%);
      color: #FFFFFF;
      border-radius: 14px;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid rgba(229,169,60,0.35);
      margin-bottom: 24px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    .total-label {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #F6D285;
    }
    .total-terms {
      font-size: 11px;
      color: #CBD5E1;
      margin-top: 3px;
    }
    .total-amount {
      font-size: 26px;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: -0.5px;
    }

    /* Guidelines & Support */
    .notice-box {
      padding: 16px 20px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-left: 4px solid #E5A93C;
      border-radius: 10px;
      font-size: 11.5px;
      color: #334155;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .invoice-footer {
      padding-top: 16px;
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
      .invoice-card { box-shadow: none; border: none; border-radius: 0; max-width: 100%; }
      .header-banner { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .total-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .summary-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  
  <div class="no-print action-bar">
    <button onclick="window.print()" class="print-btn">
      <span>🖨️ Print or Save as PDF</span>
    </button>
  </div>

  <div class="invoice-card">
    
    <!-- Top Royal Brand Header -->
    <div class="header-banner">
      <div class="brand-left">
        <div class="brand-logo-crest">👑</div>
        <div>
          <div class="brand-title serif-brand">CAB CASTLE GOA</div>
          <div class="brand-tagline">PREMIUM CABS &amp; TOUR TRAVELS</div>
          <div class="brand-meta">
            Assagao, Bardez, Goa 403507<br>
            24/7 Dispatch &amp; Helpline: <strong>+91 70266 48960</strong>
          </div>
        </div>
      </div>

      <div class="voucher-meta-box">
        <div class="voucher-pill">Official Booking Voucher</div>
        <div class="voucher-number mono">#${bookingNo}</div>
        <div class="voucher-date">Issue Date: ${invoiceDateFmt}</div>
        <div class="status-badge">CONFIRMED · PAY TO DRIVER</div>
      </div>
    </div>

    <div class="invoice-body">
      
      <!-- 3-Column Info Summary -->
      <div class="info-summary-grid">
        
        <!-- Column 1: Passenger Info -->
        <div class="summary-card">
          <div class="card-label">Passenger Information</div>
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
          <div class="card-sub text-[11px] text-[#059669] font-bold">✓ Verified Driver Included</div>
        </div>

        <!-- Column 3: Service & Duration -->
        <div class="summary-card">
          <div class="card-label">Service &amp; Booking Type</div>
          <div class="card-main">${partitionType}</div>
          <div class="card-sub font-bold">${days} Day(s) Package</div>
          <div class="card-sub text-[11px] text-[#0284C7] font-mono">${days * 8}h · ${days * 80}km Allowance</div>
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
              <div class="table-desc-title">${carTitle} Tour Cab with Driver</div>
              <div class="table-desc-sub">${days} Day(s) (${days * 8} Hours / ${days * 80} KM Included) · Sanitized AC Cab</div>
            </td>
            <td class="col-rate">&#8377; ${Number(ratePerDay).toLocaleString('en-IN')} &times; ${days} d</td>
            <td class="col-amount">&#8377; ${Number(totalAmount).toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>

      <!-- Grand Total Card -->
      <div class="total-card">
        <div>
          <div class="total-label">Total Amount Payable to Driver</div>
          <div class="total-terms">Zero Advance Paid · Pay &#8377; ${Number(totalAmount).toLocaleString('en-IN')} (${numToWords(totalAmount)}) upon trip completion via UPI or Cash</div>
        </div>
        <div class="total-amount mono">&#8377; ${Number(totalAmount).toLocaleString('en-IN')}</div>
      </div>

      <!-- Important Guidelines -->
      <div class="notice-box">
        <strong>📌 Important Passenger Guidelines:</strong><br>
        • <strong>Driver Dispatch:</strong> Driver name, contact number, and vehicle registration number will be shared on WhatsApp 2 hours before pickup.<br>
        • <strong>Inclusions:</strong> Package includes fuel, air conditioning, and driver allowances. Extra hours: &#8377;250/hr · Extra distance: &#8377;25/km.<br>
        • <strong>Support:</strong> For instant coordination, call or WhatsApp our 24/7 Goa dispatch at <strong>+91 70266 48960</strong>.
      </div>

      <!-- Footer -->
      <div class="invoice-footer">
        <div>Cab Castle Goa · Official Tour &amp; Travel Voucher</div>
        <div>Hotline: +91 70266 48960 · dasgiradur@gmail.com</div>
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
