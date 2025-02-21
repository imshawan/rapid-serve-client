import { RootState, useAppDispatch, useAppSelector } from "@/store";
import { fetchFilesRequest } from "@/store/slices/files";
import { useCallback } from "react";

export const useFiles = () => {
    const dispatch = useAppDispatch();
    const files = useAppSelector((state: RootState) => state.files);
    
    return {
        loadFiles: useCallback((payload: {currentPage: number, limit: number}) => {
            dispatch(fetchFilesRequest(payload));
        }, [dispatch]),

        ...files
    }
}