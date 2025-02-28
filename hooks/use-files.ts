import { RootState, useAppDispatch, useAppSelector } from "@/store";
import { fetchFileMeta, fetchFilesRequest, setDownloaderOpen, deleteFileRequest, addFileToList, searchFilesRequest } from "@/store/slices/files";
import { useCallback } from "react";
import type { File } from "@/lib/models/upload";

export const useFiles = () => {
    const dispatch = useAppDispatch();
    const files = useAppSelector((state: RootState) => state.files);

    return {
        loadFiles: useCallback((payload: { currentPage: number, limit: number }) => {
            dispatch(fetchFilesRequest(payload));
        }, [dispatch]),
        loadFileMeta: useCallback((fileId: string, onSuccess: Function, onError: Function) => {
            dispatch(fetchFileMeta({ fileId, onSuccess, onError }));
        }, [dispatch]),
        setDownloadOpen: useCallback((isOpen: boolean) => {
            dispatch(setDownloaderOpen(isOpen));
        }, [dispatch]),
        deleteFile: useCallback((fileId: string, onSuccess: Function, onError: Function) => {
            dispatch(deleteFileRequest({ fileId, onSuccess, onError }));
        }, [dispatch]),
        appendUpdatedFile: useCallback((file: File & { isUploading?: boolean }) => {
            dispatch(addFileToList(file));
        }, [dispatch]),
        searchFiles: useCallback((search: string, currentPage: number, limit: number) => {
            dispatch(searchFilesRequest({ currentPage, limit, search }));
        }, [dispatch]),

        ...files
    }
}