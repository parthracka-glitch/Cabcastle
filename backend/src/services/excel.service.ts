import ExcelJS from 'exceljs';

export async function buildBookingsExcel(bookings: any[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Bookings');

  const headers = [
    'Booking No',
    'Customer Name',
    'Phone',
    'Email',
    'Vehicle',
    'Start Date',
    'End Date',
    'Days',
    'Pickup Location',
    'Total Amount (INR)',
    'Payment Method',
    'Payment Status',
    'Source',
    'Status',
    'Created At',
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.height = 24;

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0B2B36' },
    };
    cell.font = {
      name: 'Arial',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.alignment = { horizontal: 'left', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE5E1D8' } },
      left: { style: 'thin', color: { argb: 'FFE5E1D8' } },
      bottom: { style: 'thin', color: { argb: 'FFE5E1D8' } },
      right: { style: 'thin', color: { argb: 'FFE5E1D8' } },
    };
  });

  for (const b of bookings) {
    const cust = b.customer || {};
    const vs = b.vehicle_snapshot || {};
    worksheet.addRow([
      b.booking_no || '',
      cust.name || '',
      cust.phone || '',
      cust.email || '',
      vs.title || '',
      b.start_date || '',
      b.end_date || '',
      b.days || '',
      b.pickup_location || '',
      b.total_amount || 0,
      b.payment_method || '',
      b.payment_status || '',
      b.source || '',
      b.status || '',
      b.created_at || '',
    ]);
  }

  worksheet.columns.forEach((column) => {
    let maxLen = 12;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      if (cell.value !== null && cell.value !== undefined) {
        maxLen = Math.max(maxLen, Math.min(40, String(cell.value).length + 2));
      }
    });
    column.width = maxLen;
  });

  worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function buildEnquiriesExcel(enquiries: any[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Enquiries');

  const headers = [
    'Enquiry ID',
    'Customer Name',
    'Phone',
    'Email',
    'City',
    'Car Model Interested',
    'Lead Source',
    'Status',
    'Notes',
    'Created At',
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.height = 24;

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0B2B36' },
    };
    cell.font = {
      name: 'Arial',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.alignment = { horizontal: 'left', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE5E1D8' } },
      left: { style: 'thin', color: { argb: 'FFE5E1D8' } },
      bottom: { style: 'thin', color: { argb: 'FFE5E1D8' } },
      right: { style: 'thin', color: { argb: 'FFE5E1D8' } },
    };
  });

  for (const eq of enquiries) {
    worksheet.addRow([
      eq.enquiry_no || eq.id || '',
      eq.customer_name || '',
      eq.phone || '',
      eq.email || '',
      eq.city || '',
      eq.car_model_interested || '',
      eq.source || '',
      eq.status || '',
      eq.notes || '',
      eq.created_at || '',
    ]);
  }

  worksheet.columns.forEach((column) => {
    let maxLen = 12;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      if (cell.value !== null && cell.value !== undefined) {
        maxLen = Math.max(maxLen, Math.min(40, String(cell.value).length + 2));
      }
    });
    column.width = maxLen;
  });

  worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
