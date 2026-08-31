import PDFDocument from 'pdfkit';

function fmtDate(d?: string | Date): string {
  if (!d) return 'N/A';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(d);
  }
}

function fmtDateTime(d?: string | Date): string {
  if (!d) return 'N/A';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return String(d);
  }
}

function rupees(n: any): string {
  if (n == null || isNaN(Number(n))) return '₹0';
  return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function safe(v: any): string {
  return v != null && v !== '' ? String(v) : '—';
}

export async function buildBookingsPdfAbstract(bookings: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Brand Palette
      const BRAND_DARK = '#063247'; // Dark Prussian
      const ACCENT_TEAL = '#2A8FA8'; // Coastal Teal
      const HEADER_BG = '#E4F2F5'; // Light Cyan
      const BORDER_COLOR = '#DFE8EC'; // Light Border
      const LIGHT_GRAY = '#F7F7F7'; // Chiffon Beige
      const GREEN = '#16A34A';
      const RED = '#DC2626';
      const ORANGE = '#EA580C';
      const BLUE = '#2563EB';

      const statusColor = (s: string) => {
        const lower = String(s || '').toLowerCase();
        switch (lower) {
          case 'confirmed':
          case 'active':
          case 'completed':
            return GREEN;
          case 'cancelled':
            return RED;
          case 'pending':
            return ORANGE;
          default:
            return '#063247';
        }
      };

      const paymentColor = (s: string) => {
        const lower = String(s || '').toLowerCase();
        switch (lower) {
          case 'paid':
            return GREEN;
          case 'refunded':
            return RED;
          case 'pay_at_car':
          case 'partial':
            return BLUE;
          case 'pending':
            return ORANGE;
          default:
            return '#063247';
        }
      };

      const drawSectionHeader = (label: string, y: number) => {
        doc.rect(40, y, doc.page.width - 80, 18).fill(HEADER_BG).stroke(BORDER_COLOR);
        doc.fill(BRAND_DARK).fontSize(9).font('Helvetica-Bold')
           .text(label, 48, y + 4, { width: doc.page.width - 96 });
        doc.fill('#000000');
        return y + 22;
      };

      const drawRow = (label: string, value: string, y: number, opts: { color?: string } = {}) => {
        if (y > doc.page.height - 50) {
          doc.addPage();
          y = 45;
        }
        doc.font('Helvetica-Bold').fontSize(8.5).fill('#4C606E')
           .text(label, 48, y, { width: 140 });
        doc.font('Helvetica').fontSize(8.5).fill(opts.color || '#063247')
           .text(safe(value), 195, y, { width: doc.page.width - 245 });
        doc.fill('#000000');
        return y + 14;
      };

      // ─── 1. COVER PAGE ──────────────────────────────────────────
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(BRAND_DARK);

      doc.fill(ACCENT_TEAL).fontSize(14).font('Helvetica-Bold')
         .text('CAB CASTLE GOA', 0, 180, { align: 'center', characterSpacing: 2 });
      doc.fill('#FFFFFF').fontSize(26).font('Helvetica-Bold')
         .text('EXECUTIVE BOOKINGS ABSTRACT', 0, 210, { align: 'center' });
      doc.fill('#C3E7FA').fontSize(12).font('Helvetica')
         .text('Official Fleet Audit & Reservation Records', 0, 245, { align: 'center' });

      // Summary Stats Calculation
      const stats = {
        total: bookings.length,
        pending: bookings.filter((b) => String(b.status).toLowerCase() === 'pending').length,
        confirmed: bookings.filter((b) => String(b.status).toLowerCase() === 'confirmed').length,
        completed: bookings.filter((b) => String(b.status).toLowerCase() === 'completed').length,
        cancelled: bookings.filter((b) => String(b.status).toLowerCase() === 'cancelled').length,
      };

      const totalRevenue = bookings
        .filter((b) => String(b.status).toLowerCase() !== 'cancelled')
        .reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);

      doc.roundedRect(60, 310, doc.page.width - 120, 150, 12).fill('#042433').stroke(ACCENT_TEAL);
      
      doc.fill('#FFFFFF').fontSize(11).font('Helvetica-Bold')
         .text('REPORT OVERVIEW', 80, 330);

      doc.font('Helvetica').fontSize(9.5).fill('#DFE8EC');
      doc.text(`Generated On: ${fmtDateTime(new Date())}`, 80, 355);
      doc.text(`Total Bookings Logged: ${stats.total}`, 80, 375);
      doc.text(
        `Status Breakdown:  ${stats.confirmed} Confirmed  |  ${stats.completed} Completed  |  ${stats.pending} Pending  |  ${stats.cancelled} Cancelled`,
        80,
        395
      );
      doc.font('Helvetica-Bold').fontSize(11).fill(ACCENT_TEAL)
         .text(`Total Net Revenue (excl. cancelled): ${rupees(totalRevenue)}`, 80, 422);

      doc.fill('#8496A2').fontSize(8.5).font('Helvetica')
         .text('Cab Castle Goa Fleet Management • Confidential Document', 0, doc.page.height - 50, { align: 'center' });

      // ─── 2. DETAILED BOOKING SHEETS ────────────────────────────
      bookings.forEach((b, idx) => {
        doc.addPage();

        const cust = b.customer || {};
        const vs = b.vehicle_snapshot || b.vehicle || {};
        const addons = b.add_ons || {};

        // Top Header Banner
        doc.rect(40, 35, doc.page.width - 80, 42).fill(BRAND_DARK);
        doc.fill('#FFFFFF').font('Helvetica-Bold').fontSize(13)
           .text(`Booking Record #${idx + 1}`, 50, 44);
        doc.fill(ORANGE).fontSize(9.5).font('Helvetica')
           .text(`Booking No: ${safe(b.booking_no || b.id)}`, 50, 60);

        doc.fill('#FFFFFF').font('Helvetica-Bold').fontSize(10)
           .text(safe(cust.name || 'Valued Customer'), doc.page.width - 240, 48, { width: 190, align: 'right' });

        doc.fill('#000000');
        let y = 88;

        // Customer Details
        y = drawSectionHeader('1. CUSTOMER INFORMATION', y);
        y = drawRow('Full Name', cust.name, y);
        y = drawRow('Contact Phone', cust.phone || b.phone, y);
        y = drawRow('Email Address', cust.email, y);
        y = drawRow('Driving License No.', cust.driving_license_no || cust.drivingLicenceNumber, y);
        y = drawRow('Aadhaar / ID No.', cust.aadhaar_no || cust.aadhaarNumber, y);
        y = drawRow('Address / City', cust.address || cust.city, y);
        y += 4;

        // Vehicle Details
        y = drawSectionHeader('2. VEHICLE SPECIFICATIONS', y);
        const carName = vs.title || b.vehicle_title || (vs.make ? `${vs.make} ${vs.model}` : 'Self-Drive Vehicle');
        y = drawRow('Vehicle Model', carName, y);
        y = drawRow('Registration No.', vs.reg_no || b.reg_no, y);
        y = drawRow('Category / Fuel', `${safe(vs.category)} · ${safe(vs.fuel_type)}`, y);
        y = drawRow('Transmission', vs.transmission, y);
        y = drawRow('Base Daily Rate', rupees(b.days ? (b.base_amount || b.total_amount) / b.days : b.base_amount), y);
        y += 4;

        // Reservation & Schedule Details
        y = drawSectionHeader('3. RESERVATION & SCHEDULE', y);
        y = drawRow('Booking Status', String(b.status || '').toUpperCase(), y, { color: statusColor(b.status) });
        y = drawRow('Payment Status', String(b.payment_status || '').toUpperCase(), y, { color: paymentColor(b.payment_status) });
        y = drawRow('Pickup Date & Time', fmtDateTime(b.start_date), y);
        y = drawRow('Return Date & Time', fmtDateTime(b.end_date), y);
        y = drawRow('Rental Duration', `${b.days || 1} Day(s)`, y);
        y = drawRow('Pickup / Drop Location', b.pickup_location || 'North Goa Hub / Airport', y);
        y = drawRow('Booking Source', b.source || 'Online Website', y);
        y += 4;

        // Financial Breakdown
        y = drawSectionHeader('4. FINANCIAL BREAKDOWN', y);
        y = drawRow('Base Rental Amount', rupees(b.base_amount || b.total_amount), y);
        if (b.airport_surcharge) y = drawRow('Airport Delivery Surcharge', rupees(b.airport_surcharge), y);
        if (addons.helmets) y = drawRow('Add-on: Extra Helmets', `${addons.helmets} unit(s) (${rupees(addons.helmets * 100)})`, y);
        if (addons.infant_seat) y = drawRow('Add-on: Child Safety Seat', rupees(300), y);
        if (b.discount) y = drawRow('Discount Applied', `- ${rupees(b.discount)} (${safe(b.coupon_code)})`, y, { color: GREEN });
        if (b.tax) y = drawRow('Taxes (GST)', rupees(b.tax), y);
        y = drawRow('Security Deposit', rupees(vs.security_deposit || 5000), y);
        y = drawRow('TOTAL PAYABLE', rupees(b.total_amount), y, { color: ORANGE });
        if (b.razorpay_payment_id) y = drawRow('Transaction Reference', b.razorpay_payment_id, y);
        y += 4;

        // Notes / Timestamps
        y = drawSectionHeader('5. AUDIT TIMESTAMPS & NOTES', y);
        y = drawRow('Created At', fmtDateTime(b.created_at), y);
        if (b.notes) y = drawRow('Admin / Booking Notes', b.notes, y);

        // Footer Line
        doc.moveTo(40, doc.page.height - 25)
           .lineTo(doc.page.width - 40, doc.page.height - 25)
           .strokeColor(BORDER_COLOR).stroke();
        doc.fill('#8496A2').fontSize(7.5).font('Helvetica')
           .text(`Cab Castle Goa • Booking Reference ${safe(b.booking_no || b.id)} • Sheet ${idx + 2}`, 40, doc.page.height - 20, {
             width: doc.page.width - 80,
             align: 'center',
           });
      });

      // ─── 3. SUMMARY TABLE ──────────────────────────────────────
      doc.addPage();
      doc.rect(40, 35, doc.page.width - 80, 26).fill(BRAND_DARK);
      doc.fill('#FFFFFF').font('Helvetica-Bold').fontSize(11)
         .text('EXECUTIVE BOOKING SUMMARY ROSTER', 50, 42);
      doc.fill('#000000');

      const colX = [40, 95, 185, 275, 325, 385, 455];
      const colW = [50, 85, 85, 45, 55, 65, 75];
      const headers = ['#', 'Customer', 'Vehicle', 'Days', 'Amount', 'Status', 'Payment'];
      let ty = 70;

      doc.rect(40, ty, doc.page.width - 80, 16).fill(HEADER_BG);
      headers.forEach((h, i) => {
        doc.fill(BRAND_DARK).font('Helvetica-Bold').fontSize(7.5)
           .text(h, colX[i] + 3, ty + 4, { width: colW[i] });
      });
      ty += 18;

      bookings.forEach((b, idx) => {
        if (ty > doc.page.height - 45) {
          doc.addPage();
          ty = 45;
          doc.rect(40, ty, doc.page.width - 80, 16).fill(HEADER_BG);
          headers.forEach((h, i) => {
            doc.fill(BRAND_DARK).font('Helvetica-Bold').fontSize(7.5)
               .text(h, colX[i] + 3, ty + 4, { width: colW[i] });
          });
          ty += 18;
        }

        if (idx % 2 === 0) {
          doc.rect(40, ty, doc.page.width - 80, 14).fill(LIGHT_GRAY);
        }

        const cust = b.customer || {};
        const vs = b.vehicle_snapshot || b.vehicle || {};
        const vehicleTitle = vs.title || b.vehicle_title || (vs.make ? `${vs.make} ${vs.model}` : 'Car');

        const row = [
          String(idx + 1),
          safe(cust.name).substring(0, 16),
          safe(vehicleTitle).substring(0, 16),
          String(b.days || 1),
          rupees(b.total_amount),
          String(b.status || 'Confirmed').toUpperCase(),
          String(b.payment_status || 'Paid').toUpperCase(),
        ];

        row.forEach((cell, i) => {
          let cellColor = '#0F172A';
          if (i === 5) cellColor = statusColor(b.status);
          if (i === 6) cellColor = paymentColor(b.payment_status);

          doc.fill(cellColor).font('Helvetica').fontSize(7)
             .text(cell, colX[i] + 3, ty + 3, { width: colW[i] });
        });

        ty += 14;
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
