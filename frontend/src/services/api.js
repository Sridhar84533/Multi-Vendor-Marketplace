import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://multi-vendor-marketplace-backend-ks4m.onrender.com/api',
});

// ─── Token picker ─────────────────────────────────────────────────────────────
// Uses sessionStorage (tab-isolated) so vendor in Tab A and customer in Tab B
// never share/overwrite each other's tokens.
const getToken = (url = '') => {
  const path = window.location.pathname;

  const isAdminRoute   = path.startsWith('/admin')  || url.includes('/admin');
  const isSellerRoute  = path.startsWith('/seller') || url.includes('/vendor') || url.includes('/seller');

  if (isAdminRoute) {
    return sessionStorage.getItem('admin_token') || null;
  }
  if (isSellerRoute) {
    return sessionStorage.getItem('vendor_token') || null;
  }
  // General route – pick whichever role-token exists for this tab's session
  return (
    sessionStorage.getItem('customer_token') ||
    sessionStorage.getItem('vendor_token')   ||
    null
  );
};

// Automatically inject JWT Bearer Token if available in sessionStorage
API.interceptors.request.use((config) => {
  const token = getToken(config.url || '');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
export const getRecommendations = (params) => API.get('/products/recommendations', { params });
export const validateCoupon      = (data)   => API.post('/coupons/validate', data);
export const createRazorpayOrder = (amount) => API.post('/payment/razorpay/create-order', { amount });
export const verifyRazorpayPayment = (data) => API.post('/payment/razorpay/verify', data);
export const downloadInvoice     = (orderId)=> API.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
export const markOrderAsRefurbished = (orderId, data) => API.put(`/orders/${orderId}/refurbish`, data);
export const getRefurbishedProducts = ()    => API.get('/products/refurbished');

