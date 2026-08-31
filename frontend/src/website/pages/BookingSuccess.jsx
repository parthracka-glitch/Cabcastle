/* Cab Castle Goa Design System */
import React from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import SEO from "../components/seo/SEO";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Download,
  MessageSquare,
  MapPin,
  Calendar,
  Car,
  ShieldCheck,
  Phone,
  Mail,
  User,
  ArrowRight,
  Clock,
  FileText,
  Compass,
} from "lucide-react";
import api, { formatINR, safeFormatDate } from "@/lib/api";
import WhatsAppPaymentProofModal from "../components/WhatsAppPaymentProofModal";

export default function BookingSuccess() {
  const { bookingId } = useParams();
  const location = useLocation();

  // 1. Resolve booking data with multi-layer fallback
  const [b, setB] = React.useState(() => {
    if (location.state?.booking) {
      return location.state.booking;
    }

    try {
      if (bookingId) {
        const specific = localStorage.getItem(`ccg_booking_${bookingId}`);
        if (specific) return JSON.parse(specific);
      }
      const last = localStorage.getItem("ccg_last_booking");
      if (last) {
        const parsed = JSON.parse(last);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch {}

    return {
      booking_no: bookingId || `CCG-${Date.now().toString().slice(-6)}`,
      vehicle_title: "Maruti Dzire AC",
      service_partition: "tour",
      days: 1,
      total_amount: 2500,
      payment_status: "Pay to Driver (Zero Advance)",
      pickup_location: "Candolim Beach Resort, North Goa",
      drop_location: "Candolim Beach Resort, North Goa",
      pickup_date: new Date().toISOString().split("T")[0],
      pickup_time: "09:00 AM",
      drop_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      drop_time: "06:00 PM",
      customer: {
        name: localStorage.getItem("ccg_customer_name") || "Guest Traveler",
        phone: localStorage.getItem("ccg_customer_phone") || "+91 70266 48960",
        email: localStorage.getItem("ccg_customer_email") || "dasgiradur@gmail.com",
      },
    };
  });

  // 2. Fetch from backend if available
  React.useEffect(() => {
    if (bookingId && !bookingId.startsWith("CCG-")) {
      api
        .get(`/bookings/${bookingId}`)
        .then(({ data }) => {
          if (data && typeof data === "object") {
            setB((prev) => ({ ...prev, ...data }));
          }
        })
        .catch(() => {});
    }
  }, [bookingId]);

  // Extract Clean Field Values
  const bookingNo = b.booking_no || bookingId || "CCG-RESERVATION";
  const vehicleTitle = b.vehicle_title || b.vehicle_snapshot?.title || "Maruti Dzire AC";
  const vehicleSubtitle = b.vehicle_snapshot?.subtitle || "Comfortable AC Cab with Driver";
  const vehicleCategory = b.vehicle_snapshot?.category || (vehicleTitle.includes("Swift") || vehicleTitle.includes("Baleno") ? "Hatchback" : vehicleTitle.includes("Innova") || vehicleTitle.includes("Ertiga") ? "SUV / MPV" : "Sedan");
  const partitionType = b.service_type === "transfer" ? "Airport / Station Transfer" : "Tour & Sightseeing Cab (With Driver)";
  
  const customerName = b.customer?.name || localStorage.getItem("ccg_customer_name") || "Guest Traveler";
  const customerPhone = b.customer?.phone || localStorage.getItem("ccg_customer_phone") || "+91 70266 48960";
  const customerEmail = b.customer?.email || localStorage.getItem("ccg_customer_email") || "customer@cabcastlegoa.com";
  const customerAadhaar = b.customer?.aadhar || b.customer?.aadhaar || localStorage.getItem("ccg_customer_aadhar") || "";

  const pickupLoc = b.pickup_location || "Candolim Beach Resort, North Goa";
  const dropLoc = b.drop_location || "Candolim Beach Resort, North Goa";
  const pickupDate = b.pickup_date || safeFormatDate(b.start_date, "dd MMM yyyy") || new Date().toISOString().split("T")[0];
  const pickupTime = b.pickup_time || "09:00 AM";
  const dropDate = b.drop_date || safeFormatDate(b.end_date, "dd MMM yyyy") || new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const dropTime = b.drop_time || "06:00 PM";
  const days = Math.max(1, b.days || 1);

  const totalFare = b.total_amount || 2500;
  const perDayRate = b.per_day_rate || Math.round(totalFare / days);

  // Generate Luxury PDF / HTML Invoice
  const handleDownloadInvoice = () => {
    const invoiceWindow = window.open("", "_blank");
    if (!invoiceWindow) {
      alert("Please allow popups to download your invoice.");
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Cab Castle Goa — Tax Invoice & Voucher #${bookingNo}</title>
        <meta charset="utf-8">
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
              <div class="voucher-date">Issue Date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
              <div class="status-badge">CONFIRMED · PAY TO DRIVER</div>
            </div>
          </div>

          <div class="invoice-body">
            
            <!-- 3-Column Info Summary -->
            <div class="info-summary-grid">
              
              <!-- Column 1: Passenger Info -->
              <div class="summary-card">
                <div class="card-label">Passenger Information</div>
                <div class="card-main">${customerName}</div>
                <div class="card-sub mono font-bold">📱 ${customerPhone}</div>
                ${customerEmail ? `<div class="card-sub truncate">✉️ ${customerEmail}</div>` : ""}
                ${customerAadhaar ? `<div class="card-sub mono text-[10.5px]">🆔 Aadhaar: XXXX-XXXX-${customerAadhaar.replace(/\\D/g, "").slice(-4)}</div>` : ""}
              </div>

              <!-- Column 2: Vehicle & Category -->
              <div class="summary-card">
                <div class="card-label">Vehicle &amp; Inclusions</div>
                <div class="card-main">${vehicleTitle}</div>
                <div class="card-sub">🚘 ${vehicleCategory} · Sanitized AC</div>
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
                  <div class="datetime">${pickupDate} at ${pickupTime}</div>
                  <div class="address">📍 ${pickupLoc}</div>
                </div>

                <div class="route-arrow-icon">→</div>

                <div class="route-node drop">
                  <div class="node-type">■ Drop-off Schedule</div>
                  <div class="datetime">${dropDate} at ${dropTime}</div>
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
                    <div class="table-desc-title">${vehicleTitle} Tour Cab with Driver</div>
                    <div class="table-desc-sub">${days} Day(s) (${days * 8} Hours / ${days * 80} KM Included) · Sanitized AC Cab</div>
                  </td>
                  <td class="col-rate">₹${Number(perDayRate).toLocaleString("en-IN")} × ${days} d</td>
                  <td class="col-amount">₹${Number(totalFare).toLocaleString("en-IN")}</td>
                </tr>
              </tbody>
            </table>

            <!-- Grand Total Card -->
            <div class="total-card">
              <div>
                <div class="total-label">Total Amount Payable to Driver</div>
                <div class="total-terms">Zero Advance Paid · Pay ₹${Number(totalFare).toLocaleString("en-IN")} upon trip completion via UPI or Cash</div>
              </div>
              <div class="total-amount mono">₹${Number(totalFare).toLocaleString("en-IN")}</div>
            </div>

            <!-- Important Guidelines -->
            <div class="notice-box">
              <strong>📌 Important Passenger Guidelines:</strong><br>
              • <strong>Driver Dispatch:</strong> Driver name, contact number, and vehicle registration number will be shared on WhatsApp 2 hours before pickup.<br>
              • <strong>Inclusions:</strong> Package includes fuel, air conditioning, and driver allowances. Extra hours: ₹250/hr · Extra distance: ₹25/km.<br>
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
      </html>
    `;

    invoiceWindow.document.write(html);
    invoiceWindow.document.close();
  };

  const [paymentProofOpen, setPaymentProofOpen] = React.useState(false);

  const whatsappMsg = `*Reservation Inquiry — Cab Castle Goa*%0A` +
    `• *Booking ID:* ${bookingNo}%0A` +
    `• *Customer:* ${customerName} (${customerPhone})%0A` +
    `• *Vehicle:* ${vehicleTitle}%0A` +
    `• *Pickup:* ${pickupDate} at ${pickupTime} (${pickupLoc})%0A` +
    `• *Total:* ₹${totalFare}%0A` +
    `Please confirm the cab details.`;
  const whatsappUrl = `https://wa.me/917026648960?text=${whatsappMsg}`;

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#063247] font-body no-scroll-x antialiased">
      <SEO
        title={`Booking Confirmed #${bookingNo} | Cab Castle Goa`}
        description="Your cab and tour reservation in Goa has been confirmed with zero advance payment."
        noindex={true}
      />
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16 md:pb-20 text-left">
        
        {/* Top Celebration Card */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E4F2F5] text-[#288DA6] mb-4 shadow-sm border border-[#288DA6]/30">
            <CheckCircle2 size={36} className="text-[#288DA6]" />
          </div>
          <div className="text-xs uppercase tracking-widest text-[#4C606E] font-bold mb-2">
            Reservation Confirmed
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-[#063247] font-black mb-3 tracking-tight">
            You're all set!
          </h1>
          <p className="text-xs sm:text-sm text-[#4C606E] max-w-md mx-auto leading-relaxed font-normal">
            Booking <span className="font-bold font-mono text-[#063247]" data-testid="booking-no">#{bookingNo}</span> is confirmed. Our local dispatch team is preparing your cab.
          </p>
        </div>

        {/* Full Details Box */}
        <div className="bg-white rounded-[24px] border border-[#DFE8EC] overflow-hidden shadow-sm">
          
          {/* Top Details Grid */}
          <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-[#DFE8EC]">
            
            {/* Customer Details */}
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#8496A2] flex items-center gap-1">
                <User size={12} className="text-[#288DA6]" /> Customer Details
              </div>
              <div className="font-display text-base font-bold text-[#063247]">
                {customerName}
              </div>
              <div className="text-xs text-[#4C606E] flex items-center gap-1.5">
                <Phone size={12} className="text-[#8496A2]" /> {customerPhone}
              </div>
              {customerEmail && (
                <div className="text-xs text-[#4C606E] flex items-center gap-1.5">
                  <Mail size={12} className="text-[#8496A2]" /> {customerEmail}
                </div>
              )}
            </div>

            {/* Total Fare */}
            <div className="space-y-1 sm:text-right">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#8496A2]">Total Amount</div>
              <div className="font-display text-2xl font-black text-[#063247]" data-testid="success-amount">
                {formatINR(totalFare)}
              </div>
              <div className="text-xs font-bold text-[#288DA6] uppercase tracking-wider">
                {b.payment_status || "Pay to Driver (Zero Advance)"}
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#8496A2] flex items-center gap-1">
                <Car size={12} className="text-[#288DA6]" /> Vehicle Reserved
              </div>
              <div className="font-display text-base font-bold text-[#063247] flex items-center gap-1.5">
                <span>{vehicleTitle}</span>
              </div>
              <div className="text-xs text-[#4C606E]">
                {vehicleCategory} · {days} Day(s) Tour · Sanitized AC
              </div>
            </div>

            {/* Service Option */}
            <div className="space-y-1 sm:text-right">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#8496A2] flex items-center sm:justify-end gap-1">
                <Compass size={12} className="text-[#288DA6]" /> Service Type
              </div>
              <div className="text-xs font-bold text-[#063247]">
                Tour Cab (With Professional Driver)
              </div>
              <div className="text-xs text-[#4C606E]">
                Zero Advance Deposit
              </div>
            </div>

          </div>

          {/* Schedule & Handover Details */}
          <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-[#DFE8EC] bg-[#F7F7F7]">
            {/* Pickup */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#063247] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#288DA6]" /> Pick-up Schedule &amp; Address
              </div>
              <div className="text-xs font-bold text-[#063247] flex items-center gap-1.5">
                <Calendar size={13} className="text-[#8496A2] shrink-0" />
                <span>{pickupDate} at {pickupTime}</span>
              </div>
              <div className="text-xs text-[#4C606E] flex items-center gap-1.5">
                <MapPin size={13} className="text-[#288DA6] shrink-0" />
                <span>{pickupLoc}</span>
              </div>
            </div>

            {/* Dropoff */}
            <div className="space-y-1.5 sm:text-right">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#063247] flex items-center sm:justify-end gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#288DA6]" /> Drop-off Schedule
              </div>
              <div className="text-xs font-bold text-[#063247] flex items-center sm:justify-end gap-1.5">
                <Calendar size={13} className="text-[#8496A2] shrink-0" />
                <span>{dropDate} at {dropTime}</span>
              </div>
              <div className="text-xs text-[#4C606E] flex items-center sm:justify-end gap-1.5">
                <MapPin size={13} className="text-[#063247] shrink-0" />
                <span>{dropLoc}</span>
              </div>
            </div>
          </div>

          {/* Policy Highlights */}
          <div className="p-4 sm:p-6 bg-white border-b border-[#DFE8EC] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#4C606E]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#288DA6]" />
              <span>Zero Advance Payment · Pay to Driver</span>
            </div>
            <div>
              <span>Clean AC Cab Guarantee</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 md:p-8 flex flex-col sm:flex-row flex-wrap gap-3 bg-[#F7F7F7]">
            
            {/* Download Invoice Button */}
            <Button
              type="button"
              onClick={handleDownloadInvoice}
              className="flex-1 min-w-[190px] h-12 bg-[#288DA6] hover:bg-[#22768C] text-white font-black text-xs uppercase tracking-wider rounded-full shadow-md border-t border-white/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Download size={16} className="text-white" />
              <span>Download Invoice (PDF)</span>
            </Button>

            {/* My Bookings Button */}
            <Link to="/my-bookings" className="flex-1 min-w-[160px]">
              <Button className="w-full h-12 bg-[#063247] hover:bg-[#042433] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95">
                <FileText size={15} className="text-[#288DA6]" />
                <span>My Bookings</span>
              </Button>
            </Link>

            {/* Chat on WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 min-w-[180px]"
            >
              <Button className="w-full h-12 bg-gradient-to-r from-[#25D366] via-[#22be5c] to-[#1a9a49] hover:from-[#2ce06e] hover:to-[#1ea750] text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-md hover:shadow-lg border-t border-white/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95">
                <MessageSquare size={16} />
                <span>WhatsApp Dispatch</span>
              </Button>
            </a>

            {/* Call Support */}
            <a
              href="tel:+917026648960"
              className="flex-1 min-w-[140px]"
            >
              <Button variant="outline" className="w-full h-12 border-[#DFE8EC] bg-white hover:bg-[#E4F2F5] text-[#063247] font-bold text-xs uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-2xs">
                <Phone size={15} />
                <span>Support</span>
              </Button>
            </a>

            {/* Back to Fleet */}
            <Link to="/fleet" className="flex-1 min-w-[140px]">
              <Button variant="outline" className="w-full h-12 border-[#DFE8EC] bg-white hover:bg-[#063247] hover:text-white text-[#063247] font-bold text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer">
                <span>Fleet</span>
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>

          </div>

        </div>

      </main>

      <WhatsAppPaymentProofModal
        isOpen={paymentProofOpen}
        onClose={() => setPaymentProofOpen(false)}
        bookingCode={bookingNo}
        customerName={customerName}
        customerPhone={customerPhone}
        amount={500}
      />

      <Footer />
    </div>
  );
}
