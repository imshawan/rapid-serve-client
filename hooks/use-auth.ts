import { RootState, useAppDispatch, useAppSelector } from "@/store";
import { AuthUser, loginRequest, loginSuccess, logoutRequest, userUpdate } from "@/store/slices/auth";
import { useCallback } from "react";

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const auth = useAppSelector((state: RootState) => state.auth);
    
    return {
        login: useCallback((payload: {email: string; password: string;}, onSuccess: Function) => {
            dispatch(loginRequest({...payload, onSuccess}));
        }, [dispatch]),
        logout: useCallback((onSuccess: Function) => {
            dispatch(logoutRequest({onSuccess}));
        }, [dispatch]),
        updateAuthUser: useCallback((payload: Partial<AuthUser>) => {
            dispatch(userUpdate(payload));
        }, [dispatch]),
        onLoginSuccess: useCallback((user: AuthUser, token: string) => {
            dispatch(loginSuccess({user, token}));
        }, [dispatch]),

        ...auth
    }
}