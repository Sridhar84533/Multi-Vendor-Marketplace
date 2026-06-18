import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';

// ─── Helpers: use sessionStorage so each browser tab has its OWN session ───
// This allows a vendor in Tab A and a customer in Tab B to be logged in
// simultaneously without overwriting each other's tokens.

const getTokenKey = (role) => {
  if (role === 'vendor') return 'vendor_token';
  if (role === 'admin')  return 'admin_token';
  return 'customer_token';
};

const saveToken = (role, token) => {
  sessionStorage.setItem(getTokenKey(role), token);
};

const clearToken = (role) => {
  sessionStorage.removeItem(getTokenKey(role));
};

const readInitialToken = () => {
  const path = window.location.pathname;
  if (path.startsWith('/admin'))  return sessionStorage.getItem('admin_token')  || null;
  if (path.startsWith('/seller')) return sessionStorage.getItem('vendor_token') || null;
  return sessionStorage.getItem('customer_token') || sessionStorage.getItem('vendor_token') || null;
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

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
    // Store in sessionStorage (tab-specific – no cross-tab conflict)
    saveToken(user?.role, token);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/registerUser', async (data, { rejectWithValue }) => {
  try {
    const res = await API.post('/auth/register', data);
    const { token, user } = res.data;
    saveToken(user?.role, token);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

// ─── Slice ───────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: (() => {
    const token = readInitialToken();
    return {
      token,
      user: null,
      // If there's a stored token we haven't verified yet, mark as loading
      // so PrivateRoute/VendorRoute don't flash-redirect to /login
      loading: Boolean(token),
      error: null,
      isAuthenticated: false,
    };
  })(),
  reducers: {
    logout: (state) => {
      const path = window.location.pathname;
      if (path.startsWith('/admin'))       clearToken('admin');
      else if (path.startsWith('/seller')) clearToken('vendor');
      else {
        // On non-role routes, clear whichever session token is present
        clearToken('customer');
        clearToken('vendor');
      }
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
