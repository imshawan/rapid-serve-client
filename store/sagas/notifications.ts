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

export default function* notificationsSaga(): Generator {
    yield takeLatest(notificationSlice.appendNotificationsRequest.type, loadInitialNotificationsSaga)
}