import apiClient from './axios-client';

export async function login(credentials: { email?: string; password?: string }) {
  const res = await apiClient.post('/auth/login', credentials);
  return res.data;
}

export async function register(data: { name: string; email: string; password: string; phone?: string }) {
  const res = await apiClient.post('/auth/register', data);
  return res.data;
}

export async function googleAuth(payload: { email?: string; name?: string; picture?: string; google_id?: string; id_token?: string }) {
  const res = await apiClient.post('/auth/google', payload);
  return res.data;
}

export async function getMe() {
  const res = await apiClient.get('/auth/me');
  return res.data;
}

export async function logout() {
  const res = await apiClient.post('/auth/logout');
  return res.data;
}

export async function uploadPhoto(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post('/admin/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
