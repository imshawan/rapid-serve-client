import { useCallback } from "react";
import { RootState, useAppDispatch, useAppSelector } from "@/store";
import { addNotification, appendNotificationsRequest } from "@/store/slices/notifications";
import type { Notification } from "@/lib/models/notification";

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state: RootState) => state.notifications);

  return {
    loadNotifications: useCallback((payload: { currentPage: number, limit: number}, onSuccess?: Function ) => {
      dispatch(appendNotificationsRequest({...payload, onSuccess}))
    }, [dispatch]),
    addNotification: useCallback((notification: Notification) => {
      dispatch(addNotification(notification))
    }, [dispatch]),

    ...notifications
  }
}