import { useCallback } from "react";
import { RootState, useAppDispatch, useAppSelector } from "@/store";
import {
  loadPlanRequest, setSettingsFromUserProfileRequest, toggleSidebar, updateAppearanceRequest,
  updateNotificationsRequest, updatePrivacyRequest, updateStorageRequest
} from "@/store/slices/app";

export const useApp = () => {
  const dispatch = useAppDispatch();
  const app = useAppSelector((state: RootState) => state.app);

  return {
    toggleSidebar: useCallback((open?: boolean) => {
      dispatch(toggleSidebar(open))
    }, [dispatch]),
    updateAppearance: useCallback((appearance: Partial<AppSettings.Appearance>) => {
      dispatch(updateAppearanceRequest(appearance))
    }, [dispatch]),
    updateNotifications: useCallback((notifications: Partial<AppSettings.Notifications>) => {
      dispatch(updateNotificationsRequest(notifications))
    }, [dispatch]),
    updatePrivacy: useCallback((privacy: Partial<AppSettings.Privacy>) => {
      dispatch(updatePrivacyRequest(privacy))
    }, [dispatch]),
    updateStorage: useCallback((storage: Partial<AppSettings.Storage>) => {
      dispatch(updateStorageRequest(storage))
    }, [dispatch]),
    loadPlanDetails: useCallback(() => {
      dispatch(loadPlanRequest())
    }, [dispatch]),
    loadSettingsFromUserProfile: useCallback(() => {
      dispatch(setSettingsFromUserProfileRequest())
    }, [dispatch]),

    ...app
  }
}