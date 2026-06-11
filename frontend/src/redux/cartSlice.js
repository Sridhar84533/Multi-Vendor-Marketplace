import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/cart');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Cart fetch failed');
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async (data, { rejectWithValue }) => {
  try {
    const res = await API.post('/cart', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Add to cart failed');
  }
});

export const updateCartItem = createAsyncThunk('cart/updateCartItem', async (data, { rejectWithValue }) => {
  try {
    const res = await API.put('/cart', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update cart failed');
  }
});

export const removeCartItem = createAsyncThunk('cart/removeCartItem', async (itemId, { rejectWithValue }) => {
  try {
    const res = await API.delete(`/cart/${itemId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Remove item failed');
  }
});

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  try {
    await API.delete('/cart');
    return [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Clear cart failed');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.items || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export default cartSlice.reducer;
