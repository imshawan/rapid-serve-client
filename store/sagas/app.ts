import { call, put, takeLatest } from "redux-saga/effects";
import { loadPlanRequest, setSettingsFromUserProfile, setSettingsFromUserProfileRequest, setSettingsLoading, updateAppearance, updateAppearanceRequest, updateNotifications, updateNotificationsRequest, updatePrivacy, updatePrivacyRequest, updateStorage, updateStorageRequest } from "../slices/app";
import { toast } from "@/hooks/use-toast";
import { user } from "@/services/api/user";
import { PayloadAction } from "@reduxjs/toolkit";

function* loadPlanDetailsSaga(): Generator<any, void, ApiResponse<any>> {
  yield put(setSettingsLoading(true))
  try {
    const response = yield call(user.getPlanDetails)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
    yield put(updateStorage(response.data))
  } catch (error) {
    toast({
      title: "Error",
      description: "Error occured while loading plan details",
      variant: "destructive",
    })
  } finally {
    yield put(setSettingsLoading(false))
  }
}

function* loadSettingsFromUserProfileSaga(): Generator<any, void, ApiResponse<any>> {
  try {
    const response = yield call(user.getUserProfile)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
    yield put(setSettingsFromUserProfile(response.data))
  } catch (error) {
    toast({
      title: "Error",
      description: "Error occured while loading settings",
      variant: "destructive",
    })
  }
}

function* updateNotificationSettingsSaga(action: PayloadAction<Partial<AppSettings.Notifications>>): Generator<any, void, ApiResponse<any>> {
  let previous = action.payload
  try {
    yield put(updateNotifications(action.payload))
    const settings = { preferences: {notifications: action.payload} } as Partial<IUser>
    const response = yield call(user.updateProfile, settings)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
  } catch (error) {
    yield put(updateNotifications(previous))
    toast({
      title: "Error",
      description: "Error occured while updating settings",
      variant: "destructive",
    })
  }
}

function* updateAppearanceSettingsSaga(action: PayloadAction<Partial<AppSettings.Appearance>>): Generator<any, void, ApiResponse<any>> {
  let previous = action.payload
  try {
    yield put(updateAppearance(action.payload))
    const settings = { preferences: action.payload } as Partial<IUser>
    const response = yield call(user.updateProfile, settings)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
  } catch (error) {
    yield put(updateAppearance(previous))
    toast({
      title: "Error",
      description: "Error occured while updating settings",
      variant: "destructive",
    })
  }
}

function* updateStorageSettingsSaga(action: PayloadAction<Partial<AppSettings.Storage>>): Generator<any, void, ApiResponse<any>> {
  let previous = action.payload
  try {
    yield put(updateStorage(action.payload))
    const settings = { subscription: action.payload } as Partial<IUser>
    const response = yield call(user.updateProfile, settings)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
  } catch (error) {
    yield put(updateStorage(previous))
    toast({
      title: "Error",
      description: "Error occured while updating settings",
      variant: "destructive",
    })
  }
}

function* updatePrivacySettingsSaga(action: PayloadAction<Partial<AppSettings.Privacy>>): Generator<any, void, ApiResponse<any>> {
  let previous = action.payload
  try {
    yield put(updatePrivacy(action.payload))
    const settings = { security: action.payload } as Partial<IUser>
    const response = yield call(user.updateProfile, settings)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
  } catch (error) {
    yield put(updatePrivacy(previous))
    toast({
      title: "Error",
      description: "Error occured while updating settings",
      variant: "destructive",
    })
  }
}

export default function* appSaga(): Generator {
  yield takeLatest(loadPlanRequest.type, loadPlanDetailsSaga)
  yield takeLatest(setSettingsFromUserProfileRequest.type, loadSettingsFromUserProfileSaga)
  yield takeLatest(updateNotificationsRequest.type, updateNotificationSettingsSaga)
  yield takeLatest(updateAppearanceRequest.type, updateAppearanceSettingsSaga)
  yield takeLatest(updateStorageRequest.type, updateStorageSettingsSaga)
  yield takeLatest(updatePrivacyRequest.type, updatePrivacySettingsSaga)
}