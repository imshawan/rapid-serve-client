import { call, put, takeLatest } from "redux-saga/effects";
import { user as userApi } from "@/services/api";
import {
  requestStart,
  registerSuccess,
  updateProfileSuccess,
  requestFailure,
  registerRequest,
  updateProfileRequest,
  loadProfileRequest,
  updateProfilePictureRequest,
} from "@/store/slices/user";
import { PayloadAction } from "@reduxjs/toolkit";
import { toast } from "@/hooks/use-toast";
import { loginSuccess, profilePictureUpdate } from "../slices/auth";

function* registerSaga(action: PayloadAction<{ name: string; email: string; password: string, onSuccess: Function }>): Generator<any, void, ApiResponse<any>> {
  try {
    yield put(requestStart());
    const response = yield call(userApi.register, action.payload.name, action.payload.email, action.payload.password);
    if (!response.success) {
      if (response.error && response.error.details && response.error.details.length) {
        response.error.details.forEach((error: any) => {
          toast({
            title: "Validation Error",
            description: error.message,
            variant: "destructive"
          })
        });

        return action.payload.onSuccess(false)
      }

      toast({
        title: response.error?.code || "Registration failed",
        description: response.error?.message || "Please check your details and try again.",
        variant: "destructive",
      })

      return action.payload.onSuccess(false)
    }

    toast({
      title: "Success",
      description: "Account created successfully!",
    })

    yield put(registerSuccess({ user: response.data.user, token: response.data.token }))
    yield put(loginSuccess({ token: response.data.token, user: response.data.user }))

    if ("function" === typeof action.payload.onSuccess) {
      action.payload.onSuccess(true)
    }
  } catch (error: any) {
    yield put(requestFailure(error.response?.data?.message || "Registration failed"))
    action.payload.onSuccess()
  }
}

function* updateProfileSaga(action: PayloadAction<{ user: Partial<IUser>; onSuccess: Function }>): Generator<any, void, ApiResponse<any>> {
  try {
    yield put(requestStart());
    const response = yield call(
      userApi.updateProfile,
      action.payload.user,
    );

    if (!response.success && response.error) {
      let { code, message } = response.error;

      toast({
        title: code || "Profile update failed",
        description: message || "Please check your details and try again.",
        variant: "destructive",
      })

      action.payload.onSuccess()

      return
    }

    yield put(updateProfileSuccess(response.data.user))
    action.payload.onSuccess(true)

    toast({
      title: "Success",
      description: response.data.message,
    })
  } catch (error: any) {
    yield put(requestFailure(error.response?.data?.message || "Profile update failed"))
    action.payload.onSuccess()
  }
}

function* loadProfileSaga(): Generator<any, void, ApiResponse<any>> {
  try {
    yield put(requestStart());
    const response = yield call(userApi.getUserProfile);
    if (!response.success && response.error) {
      let { code, message } = response.error;

      toast({
        title: code || "Profile loading failed",
        description: message || "Please check your details and try again.",
        variant: "destructive",
      })

      return
    }

    yield put(updateProfileSuccess(response.data.user))
  } catch (error: any) {
    yield put(requestFailure(error.response?.data?.message || "Profile loading failed"))
  }
}

function* updateProfilePicture(action: PayloadAction<{ data: FormData; onSuccess: Function, onError: Function }>): Generator<any, void, ApiResponse<any>> {
  try {
    const response = yield call(userApi.updateProfilePicture, action.payload.data);
    if (!response.success && response.error) {
      let { code, message } = response.error;

      toast({
        title: code || "Profile picture update failed",
        description: message || "Please check your details and try again.",
        variant: "destructive",
      })

      return action.payload.onError()
    }

    yield put(updateProfileSuccess(response.data.user))
    yield put(profilePictureUpdate(response.data.url))
    action.payload.onSuccess()
  } catch (error: any) {
    toast({
      title: error.response?.data?.code || "Error",
      description: error.response?.data?.message || "Profile picture update failed",
      variant: "destructive",
    })
    action.payload.onError()
  }
}

// Watcher saga
export default function* userSaga(): Generator {
  yield takeLatest(registerRequest.type, registerSaga);
  yield takeLatest(updateProfileRequest.type, updateProfileSaga);
  yield takeLatest(loadProfileRequest.type, loadProfileSaga);
  yield takeLatest(updateProfilePictureRequest.type, updateProfilePicture);
}
