import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://multi-vendor-marketplace-backend-ks4m.onrender.com/api',
});

// Automatically inject JWT Bearer Token if available in localStorage
API.interceptors.request.use((config) => {
  const isSellerRoute = window.location.pathname.startsWith('/seller') || config.url.includes('/vendor') || config.url.includes('/seller');
  const isAdminRoute = window.location.pathname.startsWith('/admin') || config.url.includes('/admin');
  
  let token = null;
  if (isAdminRoute) {
    token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  } else if (isSellerRoute) {
    token = localStorage.getItem('vendor_token') || localStorage.getItem('token');
  } else {
    token = localStorage.getItem('customer_token') || localStorage.getItem('token');
  }

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
