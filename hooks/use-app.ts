import { RootState, useAppDispatch, useAppSelector } from "@/store";
import { useCallback } from "react";

export const useApp = () => {
    const dispatch = useAppDispatch();
    const app = useAppSelector((state: RootState) => state.app);
    
    return {
        

        ...app
    }
}