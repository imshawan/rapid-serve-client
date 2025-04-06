import type { User } from "@/lib/models/user"
import { getJsonFromLocalstorage } from "@/lib/utils/common"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import _ from "lodash"
interface AppState {
  sidebarOpen: boolean
  settings: {
    appearance: AppSettings.Appearance
    notifications: AppSettings.Notifications
    privacy: AppSettings.Privacy
    storage: AppSettings.Storage & {
      bandwidth: Bandwidth | null;
    }
    loading: boolean
  }
}

const initialState: AppState = {
  sidebarOpen: false,
  settings: {
    appearance: {
      theme: getJsonFromLocalstorage("theme"),
      language: "en",
      timezone: "IST",
    },
    notifications: {
      email: true,
      push: true,
      sharing: true,
      comments: true,
      storageWarning: false
    },
    privacy: {
      twoFactorEnabled: false,
      publicLinks: false,
      deviceHistory: false,
      activityLog: false
    },
    storage: {
      limit: 0,
      plan: "free",
      status: "active",
      autoRenew: true,
      trash: null,
      used: 0,
      bandwidth: null
    },
    loading: false
  }
}

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    toggleSidebar: (state, { payload = null }) => {
      if (payload !== null) {
        state.sidebarOpen = payload
        return
      }
      state.sidebarOpen = !state.sidebarOpen
    },
    setSettingsLoading: (state, action: PayloadAction<boolean>) => {
      state.settings.loading = action.payload
    },
    updateAppearanceRequest: (state, action: PayloadAction<Partial<AppSettings.Appearance>>) => { },
    updateAppearance: (state, action: PayloadAction<Partial<AppSettings.Appearance>>) => {
      state.settings.appearance = _.merge(state.settings.appearance, action.payload)
    },
    updateNotificationsRequest: (state, action: PayloadAction<Partial<AppSettings.Notifications>>) => { },
    updateNotifications: (state, action: PayloadAction<Partial<AppSettings.Notifications>>) => {
      state.settings.notifications = _.merge(state.settings.notifications, action.payload)
    },
    updatePrivacyRequest: (state, action: PayloadAction<Partial<AppSettings.Privacy>>) => { },
    updatePrivacy: (state, action: PayloadAction<Partial<AppSettings.Privacy>>) => {
      state.settings.privacy = _.merge(state.settings.privacy, action.payload)
    },
    updateStorageRequest: (state, action: PayloadAction<Partial<AppSettings.Storage>>) => { },
    updateStorage: (state, action: PayloadAction<Partial<AppSettings.Storage>>) => {
      state.settings.storage = _.merge(state.settings.storage, action.payload)
    },
    setSettingsFromUserProfileRequest: (state) => {
      state.settings.loading = true
    },
    setSettingsFromUserProfile: (state, action: PayloadAction<User>) => {
      let { security, subscription, preferences, storageLimit } = action.payload
      let { notifications, ...rest } = preferences

      state.settings.appearance = rest
      state.settings.notifications = notifications
      state.settings.privacy = _.merge(state.settings.privacy, security)
      state.settings.storage = _.merge(state.settings.storage, subscription, { limit: storageLimit })
      state.settings.loading = false
    },
    loadPlanRequest: (state) => { },
  },
})

export const {
  toggleSidebar,
  updateAppearance,
  updateAppearanceRequest,
  updateNotificationsRequest,
  updateNotifications,
  updatePrivacyRequest,
  updatePrivacy,
  updateStorageRequest,
  updateStorage,
  setSettingsFromUserProfile,
  setSettingsFromUserProfileRequest,
  setSettingsLoading,
  loadPlanRequest
} = appSlice.actions
export default appSlice.reducer