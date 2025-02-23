import { getJsonFromLocalstorage } from "@/lib/utils/common";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserStateType {
  email: string;
  name: string;
  role: "user" | "admin";
  profilePicture?: string;
  storageUsed: number;
  storageLimit: number;
  isEmailVerified: boolean;
  lastLogin: Date;
  preferences: {
    theme: "light" | "dark" | "system";
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      storageWarning: boolean;
    };
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: Date;
    failedLoginAttempts: number;
    lockoutUntil?: Date;
  };
  subscription: {
    plan: "free" | "pro" | "enterprise";
    status: "active" | "inactive" | "cancelled" | "past_due";
    autoRenew: boolean;
  };
  devices: Array<{
    id: string;
    name: string;
    type: string;
    lastActive: Date;
    ipAddress: string;
    userAgent: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}


interface UserState {
  user: UserStateType | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: getJsonFromLocalstorage("user") as UserStateType,
  token: getJsonFromLocalstorage("token"),
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    requestStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerRequest: (state, action: PayloadAction<{ email: string; password: string, name: string, onSuccess: Function }>) => { },
    registerSuccess(state, action: PayloadAction<{ user: UserStateType; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    registerFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    updateProfileSuccess: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
      state.loading = false;
    },
    updateProfileRequest: (state, action: PayloadAction<{ user: Partial<UserStateType>, onSuccess: Function }>) => { },
    updateProfilePictureRequest: (state, action: PayloadAction<{ data: FormData, onSuccess: Function, onError: Function }>) => { },
    updateProfilePictureSuccess: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.profilePicture = action.payload;
      }
    },
    requestFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    loadProfileRequest: () => { },
  },
});

export const {
  registerRequest,
  registerSuccess,
  registerFailure,
  updateProfileSuccess,
  updateProfileRequest,
  requestStart,
  requestFailure,
  loadProfileRequest,
  updateProfilePictureRequest,
  updateProfilePictureSuccess
} = userSlice.actions;

export default userSlice.reducer;
