import { RootState, useAppDispatch, useAppSelector } from "@/store";
import { loadProfileRequest, registerRequest, updateProfilePictureRequest, updateProfileRequest } from "@/store/slices/user";
import { useCallback } from "react";

export const useUser = () => {
  const dispatch = useAppDispatch()
  const userState = useAppSelector((state: RootState) => state.user)

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

    updateProfilePicture: useCallback((payload: {data: FormData}, onSuccess: Function, onError: Function) => {
      dispatch(updateProfilePictureRequest({...payload, onSuccess, onError}));
    }, [dispatch]),

    ...userState
  }
}