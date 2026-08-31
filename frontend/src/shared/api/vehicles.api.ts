import apiClient from './axios-client';

export async function getVehicles(params?: { category?: string; status_filter?: string; q?: string }) {
  const res = await apiClient.get('/vehicles', { params });
  return res.data;
}

export async function getVehicleById(id: string) {
  const res = await apiClient.get(`/vehicles/${id}`);
  return res.data;
}

export async function createVehicle(data: any) {
  const res = await apiClient.post('/admin/vehicles', data);
  return res.data;
}

export async function updateVehicle(id: string, data: any) {
  const res = await apiClient.put(`/admin/vehicles/${id}`, data);
  return res.data;
}

export async function deleteVehicle(id: string) {
  const res = await apiClient.delete(`/admin/vehicles/${id}`);
  return res.data;
}
