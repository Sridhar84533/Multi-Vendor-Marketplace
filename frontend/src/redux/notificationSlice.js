import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';

export const fetchNotifications = createAsyncThunk('notification/fetchNotifications', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/notifications');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Notifications fetch failed');
  }
});

export const markAsRead = createAsyncThunk('notification/markAsRead', async (id, { rejectWithValue }) => {
  try {
    const res = await API.put(`/notifications/${id}/read`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Mark as read failed');
  }
});

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    list: [],
    unreadCount: 0,
    loading: false,
  },
  reducers: {
    addLiveNotification: (state, action) => {
      state.list.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.list = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.list.findIndex((n) => n._id === action.payload._id);
        if (index > -1) {
          state.list[index] = action.payload;
        }
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      });
  },
});

export const { addLiveNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
