import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import _ from 'lodash'
interface AppState {
  sidebarOpen: boolean
  settings: {
    appearance: AppSettings.Appearance,
    notifications: AppSettings.Notifications,
    privacy: AppSettings.Privacy,
    storage: AppSettings.Storage,
  }
}

const initialState: AppState = {
  sidebarOpen: true,
  settings: {
    appearance: {
      theme: "light",
      language: "en"
    },
    notifications: {
      email: true,
      desktop: true,
      sharing: true,
      comments: true
    },
    privacy: {
      twoFactor: false,
      publicLinks: false,
      deviceHistory: false,
      activityLog: false
    },
    storage: {
      limit: "50",
    },
  }
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleSidebar: (state, { payload = null }) => {
      if (payload !== null) {
        state.sidebarOpen = payload
        return
      }
      state.sidebarOpen = !state.sidebarOpen
    },
    updateAppearance: (state, action: PayloadAction<Partial<AppSettings.Appearance>>) => {
      state.settings.appearance = _.merge(state.settings.appearance, action.payload)
    },
    updateNotifications: (state, action: PayloadAction<Partial<AppSettings.Notifications>>) => {
      state.settings.notifications = _.merge(state.settings.notifications, action.payload)
    },
    updatePrivacy: (state, action: PayloadAction<Partial<AppSettings.Privacy>>) => {
      state.settings.privacy = _.merge(state.settings.privacy, action.payload)
    },
    updateStorage: (state, action: PayloadAction<Partial<AppSettings.Storage>>) => {
      state.settings.storage = _.merge(state.settings.storage, action.payload)
    }
  },
})

export const { 
  toggleSidebar, 
  updateAppearance,  
  updateNotifications,
  updatePrivacy,
  updateStorage
} = appSlice.actions
export default appSlice.reducer