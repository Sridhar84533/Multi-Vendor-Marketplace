import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://multi-vendor-marketplace-backend-4jh6.onrender.com/api',
});

// Automatically inject JWT Bearer Token if available in localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
export const getRecommendations = (params) => API.get('/products/recommendations', { params });
export const validateCoupon = (data) => API.post('/coupons/validate', data);
export const createRazorpayOrder = (amount) => API.post('/payment/razorpay/create-order', { amount });
export const verifyRazorpayPayment = (data) => API.post('/payment/razorpay/verify', data);
export const downloadInvoice = (orderId) => API.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
