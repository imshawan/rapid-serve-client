import { getJsonFromLocalstorage, updateJsonFromLocalStorage } from "@/lib/utils/common"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface AuthUser {
  id: string
  name: string
  email: string
  profilePicture?: string
  storageUsed: number
  storageLimit: number
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}

const initialState: AuthState = {
  user: getJsonFromLocalstorage("user"),
  token: getJsonFromLocalstorage("token"),
  isAuthenticated: false,
  loading: true,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.loading = false
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    loginSuccess: (state, action: PayloadAction<{ token: string; user: any }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token)
        localStorage.setItem("user", JSON.stringify(action.payload.user))
      }
    },
    loginFailure: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    },
    logoutSuccess: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    },
    logoutRequest: (state, payload: PayloadAction<{onSuccess: Function}>) => {},
    loginRequest: (state, action: PayloadAction<{ email: string; password: string, onSuccess: Function }>) => {},
    profilePictureUpdate: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.profilePicture = action.payload
        if (typeof window !== "undefined") {
          updateJsonFromLocalStorage("user", state.user)
        }
      }
    },
    userUpdate: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = {...state.user, ...action.payload}
        if (typeof window !== "undefined") {
          updateJsonFromLocalStorage("user", state.user)
        }
      }
    },
  },
})

export const { logout, setLoading, loginSuccess, loginFailure, logoutSuccess, logoutRequest, loginRequest, profilePictureUpdate, userUpdate } = authSlice.actions
export default authSlice.reducer