import apiClient from './axios-client';

export async function createOrder(bookingId: string) {
  const res = await apiClient.post('/payments/create-order', { booking_id: bookingId });
  return res.data;
}

export async function verifyPayment(payload: { booking_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
  const res = await apiClient.post('/payments/verify', payload);
  return res.data;
}
