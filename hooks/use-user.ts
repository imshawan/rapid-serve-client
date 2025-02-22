import { RootState, useAppDispatch, useAppSelector } from "@/store";
import { loadProfileRequest, registerRequest, updateProfileRequest } from "@/store/slices/user";
import { useCallback } from "react";

export const useUser = () => {
  const dispatch = useAppDispatch();

  return {
    register: useCallback((payload: { email: string; password: string; name: string }, onSuccess: Function) => {
      dispatch(registerRequest({ ...payload, onSuccess }));
    }, [dispatch]),

    updateUserData: useCallback((payload: Partial<IUser>, onSuccess: Function) => {
      dispatch(updateProfileRequest({user: payload, onSuccess}));
    }, [dispatch]),

    loadUserProfile: useCallback(() => {
      dispatch(loadProfileRequest());
    }, [dispatch]),

    user: useAppSelector((state: RootState) => state.user.user),
    token: useAppSelector((state: RootState) => state.user.token),
    loading: useAppSelector((state: RootState) => state.user.loading),
    error: useAppSelector((state: RootState) => state.user.error),
  }
}