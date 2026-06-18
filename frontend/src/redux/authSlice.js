import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/auth/me');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load user');
  }
});

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const res = await API.post('/auth/login', credentials);
    const { token, user } = res.data;
    if (user?.role === 'vendor') {
      localStorage.setItem('vendor_token', token);
    } else if (user?.role === 'admin') {
      localStorage.setItem('admin_token', token);
    } else {
      localStorage.setItem('customer_token', token);
    }
    localStorage.setItem('token', token);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/registerUser', async (data, { rejectWithValue }) => {
  try {
    const res = await API.post('/auth/register', data);
    const { token, user } = res.data;
    if (user?.role === 'vendor') {
      localStorage.setItem('vendor_token', token);
    } else if (user?.role === 'admin') {
      localStorage.setItem('admin_token', token);
    } else {
      localStorage.setItem('customer_token', token);
    }
    localStorage.setItem('token', token);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: (() => {
      const isSellerRoute = window.location.pathname.startsWith('/seller');
      const isAdminRoute = window.location.pathname.startsWith('/admin');
      if (isAdminRoute) return localStorage.getItem('admin_token') || localStorage.getItem('token');
      if (isSellerRoute) return localStorage.getItem('vendor_token') || localStorage.getItem('token');
      return localStorage.getItem('customer_token') || localStorage.getItem('token');
    })(),
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    logout: (state) => {
      const isSellerRoute = window.location.pathname.startsWith('/seller');
      const isAdminRoute = window.location.pathname.startsWith('/admin');
      if (isAdminRoute) {
        localStorage.removeItem('admin_token');
      } else if (isSellerRoute) {
        localStorage.removeItem('vendor_token');
      } else {
        localStorage.removeItem('customer_token');
      }
      localStorage.removeItem('token');
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
