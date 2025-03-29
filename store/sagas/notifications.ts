import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "@/hooks/use-toast"
import * as notificationSlice from "../slices/notifications";
import { notifications as notificationService } from "@/services/api";
import { PayloadAction } from "@reduxjs/toolkit";


function* loadInitialNotificationsSaga(action: PayloadAction<{ currentPage: number, limit: number, onSuccess?: Function }>): Generator<any, void, ApiResponse<any>> {
  try {
    const response = yield call(notificationService.load, action.payload.currentPage, action.payload.limit)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
    yield put(notificationSlice.appendNotifications(response.data.paginated))
    yield put(notificationSlice.setUnreadCount(response.data.unreadCount))

    action.payload.onSuccess && action.payload.onSuccess()
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to load notifications",
      variant: "destructive"
    })
  }
}

function* markAsReadSaga(action: PayloadAction<{ id: string, onSuccess?: Function, onError?: Function }>): Generator<any, void, ApiResponse<any>> {
  yield put(notificationSlice.setMarkingReadId(action.payload.id))
  try {
    const response = yield call(notificationService.markRead, action.payload.id)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
    yield put(notificationSlice.markAsRead(action.payload.id))
    action.payload.onSuccess && action.payload.onSuccess()
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to mark notification as read",
      variant: "destructive"
    })
    action.payload.onError && action.payload.onError()
  } finally {
    yield put(notificationSlice.setMarkingReadId(""))
  }
}

function* markAllAsReadSaga(action: PayloadAction<{ onSuccess?: Function, onError?: Function }>): Generator<any, void, ApiResponse<any>> {
  yield put(notificationSlice.setMarkingReadId("all"))
  try {
    const response = yield call(notificationService.markAllRead)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
    yield put(notificationSlice.markAllAsRead())
    action.payload.onSuccess && action.payload.onSuccess()
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to mark all notifications as read",
      variant: "destructive"
    })
    action.payload.onError && action.payload.onError()
  } finally {
    yield put(notificationSlice.setMarkingReadId(""))
  }
}

export default function* notificationsSaga(): Generator {
  yield takeLatest(notificationSlice.appendNotificationsRequest.type, loadInitialNotificationsSaga)
  yield takeLatest(notificationSlice.markAsReadRequest.type, markAsReadSaga)
  yield takeLatest(notificationSlice.markAllAsReadRequest.type, markAllAsReadSaga)
}