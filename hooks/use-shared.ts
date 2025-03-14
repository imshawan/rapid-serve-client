import { RootState, useAppDispatch, useAppSelector } from "@/store"
import { useCallback } from "react"
import type { Shared } from "@/lib/models/shared"
import {
  searchFilesRequest,
  setFileRenameOpen,
  setFileShareOpen,
  setFileInfoOpen,
  loadFilesRequest,
  setFileLoading,
  setDeleteOpen,
  setLoading,
  fileRenameRequest,
} from "@/store/slices/shared"

export const useShared = () => {
  const dispatch = useAppDispatch()
  const sharedFilesState = useAppSelector((state: RootState) => state.shared)

  return {
    setLoading: useCallback((isLoading: boolean) => {
      dispatch(setLoading(isLoading));
    }, [dispatch]),
    loadFiles: useCallback((payload: { currentPage: number, limit: number, filter?: string, search?: string, clearOld?: boolean }) => {
      dispatch(loadFilesRequest(payload));
    }, [dispatch]),
    searchFiles: useCallback((search: string, currentPage: number, limit: number) => {
      dispatch(searchFilesRequest({ currentPage, limit, search }));
    }, [dispatch]),
    setRenameDialog: useCallback((payload: { isOpen: boolean, file: Shared | null }) => {
      dispatch(setFileRenameOpen(payload));
    }, [dispatch]),
    setShareDialog: useCallback((payload: { isOpen: boolean, fileName: string, fileId: string }) => {
      dispatch(setFileShareOpen(payload));
    }, [dispatch]),
    setFileInfoDialog: useCallback((payload: { isOpen: boolean, file: Shared | null }) => {
      dispatch(setFileInfoOpen(payload));
    }, [dispatch]),
    setDeleteDialog: useCallback((payload: { isOpen: boolean, fileId: string | null, fileName: string | null }) => {
      dispatch(setDeleteOpen(payload));
    }, [dispatch]),
    setFileLoadingState: useCallback((fileId: string) => {
      dispatch(setFileLoading(fileId));
    }, [dispatch]),
    renameFile: useCallback((fileId: string, fileName: string, onSuccess: Function, onError: Function) => {
      dispatch(fileRenameRequest({ fileId, fileName, onSuccess, onError }));
    }, [dispatch]),


    ...sharedFilesState
  }
}