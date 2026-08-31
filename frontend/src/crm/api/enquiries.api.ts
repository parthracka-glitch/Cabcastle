import apiClient from '@shared/api/axios-client';

export async function getEnquiries(params?: { q?: string; city_filter?: string; status_filter?: string }) {
  const res = await apiClient.get('/admin/enquiries', { params });
  return res.data;
}

export async function createEnquiry(data: any) {
  const res = await apiClient.post('/admin/enquiries', data);
  return res.data;
}

export async function updateEnquiryStatus(enquiryId: string, status: string) {
  const res = await apiClient.patch(`/admin/enquiries/${enquiryId}/status`, { status });
  return res.data;
}

export async function deleteEnquiry(enquiryId: string) {
  const res = await apiClient.delete(`/admin/enquiries/${enquiryId}`);
  return res.data;
}

export async function exportEnquiriesExcel() {
  const res = await apiClient.get('/admin/export/enquiries/excel', { responseType: 'blob' });
  return res.data;
}
