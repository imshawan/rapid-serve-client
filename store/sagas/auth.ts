import { call, put, takeLatest } from "redux-saga/effects";
import { loginRequest, loginSuccess, loginFailure, logoutRequest, logoutSuccess } from "../slices/auth";
import { auth } from "@/services/api"; // API service file
import { PayloadAction } from "@reduxjs/toolkit";
import { toast } from "@/hooks/use-toast";

function* loginSaga(action: PayloadAction<{ email: string; password: string, onSuccess: Function }>): Generator<any, void, ApiResponse<any>> {
  try {
    const response = yield call(auth.login, action.payload.email, action.payload.password);
    if (!response.success) {
      yield put(loginFailure());
      toast({
        title: response.error?.code || "Login failed",
        description: response.error?.message || "Please check your credentials and try again.",
        variant: "destructive",
      })

      return
    }
    yield put(loginSuccess({ token: response.data.token, user: response.data.user }));
    if ("function" == typeof action.payload.onSuccess) {
      action.payload.onSuccess()
    }
  } catch (error: any) {
    yield put(loginFailure());
    toast({
      title: "Login failed",
      description: error.message,
      variant: "destructive",
    })
  }
}

function* logoutSaga(action: PayloadAction<{ onSuccess: Function }>): Generator<any, void, void> {
  try {
    yield call(auth.logOut);
    yield put(logoutSuccess());

    if ("function" == typeof action.payload.onSuccess) {
      action.payload.onSuccess()
    }
  } catch (error) {
    console.error("Logout failed", error);
  }
}

export default function* authSaga(): Generator {
  yield takeLatest(loginRequest.type, loginSaga);
  yield takeLatest(logoutRequest.type, logoutSaga);
}
