import { useCallback } from "react";
import { RootState, useAppDispatch, useAppSelector } from "@/store";
import { addNotification, appendNotificationsRequest, markAllAsReadRequest, markAsReadRequest } from "@/store/slices/notifications";
import type { Notification } from "@/lib/models/notification";

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state: RootState) => state.notifications);

  return {
    loadNotifications: useCallback((payload: { currentPage: number, limit: number }, onSuccess?: Function) => {
      dispatch(appendNotificationsRequest({ ...payload, onSuccess }))
    }, [dispatch]),
    addNotification: useCallback((notification: Notification) => {
      dispatch(addNotification(notification))
    }, [dispatch]),
    markAsRead: useCallback((notificationId: string, onSuccess?: Function, onError?: Function) => {
      dispatch(markAsReadRequest({ id: notificationId, onSuccess, onError }))
    }, [dispatch]),
    markAllAsRead: useCallback((onSuccess?: Function, onError?: Function) => {
      dispatch(markAllAsReadRequest({ onSuccess, onError }))
    }, [dispatch]),

    ...notifications
  }
}