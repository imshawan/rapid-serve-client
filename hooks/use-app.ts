import { useCallback } from "react";
import { RootState, useAppDispatch, useAppSelector } from "@/store";
import { loadPlanRequest, setSettingsFromUserProfile, setSettingsFromUserProfileRequest, updateAppearance, updateNotifications, updatePrivacy, updateStorage } from "@/store/slices/app";
import type { User } from "@/lib/models/user";

export const useApp = () => {
    const dispatch = useAppDispatch();
    const app = useAppSelector((state: RootState) => state.app);
    
    return {
        updateAppearance: useCallback((appearance: Partial<AppSettings.Appearance>) => {
            dispatch(updateAppearance(appearance))
        }, [dispatch]),
        updateNotifications: useCallback((notifications: Partial<AppSettings.Notifications>) => {
            dispatch(updateNotifications(notifications))
        }, [dispatch]),
        updatePrivacy: useCallback((privacy: Partial<AppSettings.Privacy>) => {
            dispatch(updatePrivacy(privacy))
        }, [dispatch]),
        updateStorage: useCallback((storage: Partial<AppSettings.Storage>) => {
            dispatch(updateStorage(storage))
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