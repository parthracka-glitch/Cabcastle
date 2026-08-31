import apiClient from '@shared/api/axios-client';

export async function getAnalytics() {
  const res = await apiClient.get('/admin/analytics');
  return res.data;
}

export async function exportBookingsExcel() {
  const res = await apiClient.get('/admin/export/excel', { responseType: 'blob' });
  return res.data;
}
