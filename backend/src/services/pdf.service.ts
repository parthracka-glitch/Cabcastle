import PDFDocument from 'pdfkit';
import fs from 'node:fs';
import path from 'node:path';

function fmtDate(isoStr: string): string {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} · ${hours}:${mins}`;
  } catch {
    return isoStr || '—';
  }
}

export function buildInvoicePdf(booking: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    const brandDark = '#063247'; // Dark Prussian
    const brandTeal = '#2A8FA8'; // Coastal Teal
    const brandBg = '#F7F7F7';   // Chiffon Beige
    const brandBorder = '#DFE8EC';

    const cust = booking.customer || {};
    const vs = booking.vehicle_snapshot || booking.vehicle || {};
    const carTitle = vs.title || booking.vehicle_title || vs.name || 'Vehicle Details N/A';
    const carReg = vs.reg_no || booking.reg_no || booking.vehicle_reg_no || 'N/A';
    const carCat = vs.category || booking.category || '';

    // Find Logo Image
    let logoPath = '';
    try {
      const candidates = [
        path.join(__dirname, '../assets/logo.png'),
        path.join(process.cwd(), 'src/assets/logo.png'),
        path.join(process.cwd(), 'dist/assets/logo.png'),
        path.join(process.cwd(), '../frontend/public/logo.png'),
        path.join(process.cwd(), 'frontend/public/logo.png'),
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          logoPath = p;
          break;
        }
      }
    } catch {}

    // Header
    if (logoPath) {
      try {
        doc.image(logoPath, 50, 44, { width: 44, height: 44 });
      } catch {}
      doc.fillColor(brandDark).fontSize(20).font('Helvetica-Bold').text('CAB CASTLE GOA', 104, 48);
      doc.fillColor('#4C606E').fontSize(9).font('Helvetica').text('Assagao, Bardez, Goa · +91 70266 48960 · dasgiradur@gmail.com', 104, 74);
    } else {
      doc.fillColor(brandDark).fontSize(22).font('Helvetica-Bold').text('CAB CASTLE GOA', 50, 50);
      doc.fillColor('#4C606E').fontSize(9).font('Helvetica').text('Assagao, Bardez, Goa · +91 70266 48960 · dasgiradur@gmail.com', 50, 78);
    }

    doc.fillColor(brandTeal).fontSize(16).font('Helvetica-Bold').text('INVOICE', 400, 50, { align: 'right' });
    doc.fillColor(brandDark).fontSize(10).font('Helvetica-Bold').text(booking.booking_no || '', 400, 70, { align: 'right' });
    doc.fillColor('#4C606E').fontSize(8).font('Helvetica').text(fmtDate(booking.created_at), 400, 84, { align: 'right' });

    // Divider
    doc.rect(50, 100, 495, 2).fill(brandTeal);

    // Customer & Vehicle Info Box
    let y = 115;
    doc.fillColor(brandDark).fontSize(10).font('Helvetica-Bold').text('Billed To', 50, y);
    doc.text('Vehicle Details', 300, y);

    y += 15;
    doc.fillColor(brandDark).fontSize(9).font('Helvetica-Bold').text(cust.name || 'Valued Customer', 50, y);
    doc.fillColor('#333333').font('Helvetica').text(`Phone: ${cust.phone || 'N/A'}`, 50, y + 14);
    doc.text(`Email: ${cust.email || 'N/A'}`, 50, y + 26);

    doc.fillColor(brandDark).font('Helvetica-Bold').text(`Model: ${carTitle}`, 300, y);
    doc.fillColor('#333333').font('Helvetica').text(`Registration No: ${carReg}`, 300, y + 14);
    if (carCat) {
      doc.text(`Category: ${carCat}`, 300, y + 26);
    }

    // Trip Details Table
    y = 175;
    doc.fillColor(brandDark).fontSize(10).font('Helvetica-Bold').text('Trip Specification', 50, y);
    y += 15;

    const tripData = [
      ['Vehicle Rented', `${carTitle} (${carReg})`],
      ['Registration No.', carReg],
      ['Pickup Date', fmtDate(booking.start_date)],
      ['Drop-off Date', fmtDate(booking.end_date)],
      ['Pickup Location', booking.pickup_location || ''],
      ['Rental Duration', `${booking.days || 1} day(s)`],
      ['Booking Channel', booking.source || 'Online'],
    ];

    tripData.forEach(([lbl, val]) => {
      doc.rect(50, y, 140, 18).fill(brandBg);
      doc.rect(190, y, 355, 18).stroke(brandBorder);
      doc.fillColor(brandDark).fontSize(9).font('Helvetica-Bold').text(lbl, 55, y + 4);
      doc.fillColor('#333333').fontSize(9).font('Helvetica').text(val, 195, y + 4);
      y += 18;
    });

    y += 15;
    // Fare Breakdown Header
    doc.rect(50, y, 355, 20).fill(brandDark);
    doc.rect(405, y, 140, 20).fill(brandDark);
    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold').text('Description', 58, y + 5);
    doc.text('Amount (INR)', 410, y + 5, { width: 130, align: 'right' });
    y += 20;

    const fareRows: [string, string][] = [
      [`Base Rate × ${booking.days || 1} day(s)`, (booking.base_amount || 0).toFixed(2)],
    ];
    if (booking.addon_amount) {
      fareRows.push(['Add-ons', (booking.addon_amount || 0).toFixed(2)]);
    }
    if (booking.airport_surcharge) {
      fareRows.push(['Airport Delivery Surcharge', (booking.airport_surcharge || 0).toFixed(2)]);
    }
    if (booking.discount) {
      fareRows.push([`Discount (${booking.coupon_code || ''})`, `- ${(booking.discount || 0).toFixed(2)}`]);
    }
    if (booking.tax) {
      fareRows.push(['GST @ 5%', (booking.tax || 0).toFixed(2)]);
    }

    fareRows.forEach(([desc, amt]) => {
      doc.rect(50, y, 355, 18).stroke(brandBorder);
      doc.rect(405, y, 140, 18).stroke(brandBorder);
      doc.fillColor('#333333').fontSize(9).font('Helvetica').text(desc, 58, y + 4);
      doc.text(amt, 410, y + 4, { width: 130, align: 'right' });
      y += 18;
    });

    // Total Row
    doc.rect(50, y, 355, 22).fill(brandBg);
    doc.rect(405, y, 140, 22).fill(brandBg);
    doc.fillColor(brandDark).fontSize(10).font('Helvetica-Bold').text('TOTAL', 58, y + 5);
    doc.text(`₹ ${(booking.total_amount || 0).toFixed(2)}`, 410, y + 5, { width: 130, align: 'right' });
    y += 30;

    // Payment Info
    doc.fillColor('#333333').fontSize(9).font('Helvetica');
    let payText = `Payment Status: ${booking.payment_status || 'Pending'}   |   Method: ${booking.payment_method || 'Razorpay'}`;
    if (booking.razorpay_payment_id) {
      payText += `   |   Payment ID: ${booking.razorpay_payment_id}`;
    }
    doc.text(payText, 50, y);
    y += 25;

    // Footer Note
    doc.fillColor('#4C606E').fontSize(8).font('Helvetica').text(
      'Thank you for choosing Cab Castle Goa. Wishing you safe & memorable travels in Goa.',
      50,
      y,
      { width: 495, align: 'center' }
    );

    doc.end();
  });
}
