import _ from "lodash"
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Notification } from '@/lib/models/notification'

interface NotificationState {
  notifications: (Notification & {_id: string})[]
  unreadCount: number
  loading: boolean
  error: string | null
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  hasMore: true,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload as Notification & {_id: string})
      if (!action.payload.isRead) {
        state.unreadCount += 1
      }
    },
    appendNotificationsRequest: (state, action: PayloadAction<{ currentPage: number, limit: number, onSuccess?: Function }>) => {
      state.loading = true
      state.error = null
    },
    appendNotifications: (state, action: PayloadAction<Pagination>) => {
      state.loading = false
      state.notifications =  _.uniqBy([...state.notifications, ...action.payload.data], "_id")
      state.totalPages = action.payload.totalPages
      state.hasMore = action.payload.currentPage > (action.payload.end + 1)
      state.currentPage = action.payload.currentPage
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n._id === action.payload)
      if (notification && !notification.isRead) {
        notification.isRead = true
        state.unreadCount -= 1
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true
      })
      state.unreadCount = 0
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n._id === action.payload)
      if (notification && !notification.isRead) {
        state.unreadCount -= 1
      }
      state.notifications = state.notifications.filter(n => n._id !== action.payload)
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload as (Notification & {_id: string})[]
      state.unreadCount = action.payload.filter(n => !n.isRead).length
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  addNotification,
  appendNotificationsRequest,
  appendNotifications,
  markAsRead,
  markAllAsRead,
  removeNotification,
  setLoading,
  setError,
  setUnreadCount,
} = notificationSlice.actions

export default notificationSlice.reducer