import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';

export const toggleWishlist = createAsyncThunk('wishlist/toggleWishlist', async (productId, { rejectWithValue }) => {
  try {
    const res = await API.post(`/auth/wishlist/${productId}`);
    return res.data.wishlist;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Wishlist update failed');
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [], // Array of product IDs
    loading: false,
    error: null,
  },
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
