import apiClient from './axios-client';

export async function validateCoupon(code: string, amount: number) {
  const res = await apiClient.post('/coupons/validate', { code, amount });
  return res.data;
}

export async function getCoupons() {
  const res = await apiClient.get('/admin/coupons');
  return res.data;
}

export async function createCoupon(data: any) {
  const res = await apiClient.post('/admin/coupons', data);
  return res.data;
}

export async function updateCoupon(id: string, data: any) {
  const res = await apiClient.put(`/admin/coupons/${id}`, data);
  return res.data;
}

export async function deleteCoupon(id: string) {
  const res = await apiClient.delete(`/admin/coupons/${id}`);
  return res.data;
}
