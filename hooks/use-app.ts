import { useCallback } from "react";
import { RootState, useAppDispatch, useAppSelector } from "@/store";
import { loadPlanRequest, setSettingsFromUserProfile, setSettingsFromUserProfileRequest, toggleSidebar, updateAppearance, updateNotifications, updatePrivacy, updateStorage } from "@/store/slices/app";

export const useApp = () => {
    const dispatch = useAppDispatch();
    const app = useAppSelector((state: RootState) => state.app);
    
    return {
        toggleSidebar: useCallback((open?: boolean) => {
            dispatch(toggleSidebar(open))
        }, [dispatch]),
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