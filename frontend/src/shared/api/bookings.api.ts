import apiClient from './axios-client';

export async function getQuote(payload: any) {
  const res = await apiClient.post('/bookings/quote', payload);
  return res.data;
}

export async function createBooking(payload: any) {
  const res = await apiClient.post('/bookings', payload);
  return res.data;
}

export async function getBookingById(id: string) {
  const res = await apiClient.get(`/bookings/${id}`);
  return res.data;
}

export async function searchCustomerBookings(q: string) {
  const res = await apiClient.get('/customer/bookings/search', { params: { q } });
  return res.data;
}

export async function listAdminBookings(params?: { q?: string; status_filter?: string; source?: string }) {
  const res = await apiClient.get('/admin/bookings', { params });
  return res.data;
}

export async function createOfflineBooking(payload: any) {
  const res = await apiClient.post('/admin/bookings/offline', payload);
  return res.data;
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const res = await apiClient.patch(`/admin/bookings/${bookingId}/status`, { status });
  return res.data;
}

export async function rescheduleBooking(bookingId: string, newStartDate: string) {
  const res = await apiClient.patch(`/admin/bookings/${bookingId}/reschedule`, { new_start_date: newStartDate });
  return res.data;
}

export async function getCalendarSummary(year: number, month: number) {
  const res = await apiClient.get('/admin/bookings/calendar-summary', { params: { year, month } });
  return res.data;
}

export async function getBookingsByDate(date: string) {
  const res = await apiClient.get('/admin/bookings/by-date', { params: { date } });
  return res.data;
}

export async function refundBooking(bookingId: string, payload?: { amount?: number; reason?: string }) {
  const res = await apiClient.post(`/admin/bookings/${bookingId}/refund`, payload || {});
  return res.data;
}

export async function exportBookingsPdf() {
  const res = await apiClient.get('/admin/export/pdf', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  const ts = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `Cab_Castle_Goa_Bookings_Abstract_${ts}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

