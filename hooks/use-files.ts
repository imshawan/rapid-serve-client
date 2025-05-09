import { RootState, useAppDispatch, useAppSelector } from "@/store";
import {
  fetchFileMeta,
  fetchFilesRequest,
  setDownloaderOpen,
  deleteFileRequest,
  addFileToList,
  searchFilesRequest,
  setFileRenameOpen,
  setFileShareOpen,
  setFileInfoOpen,
  TFile,
  setDeleteOpen,
  fileRenameRequest,
  setFileLoading,
  loadTrashRequest,
  deleteFromTrashRequest,
  clearTrashRequest,
  setLoading,
  loadRecentFilesRequest,
  deleteFromRecentsRequest,
  createFolderRequest,
  setCurrentProcessingFile,
  restoreAllFromTrashRequest,
  deleteFilePermanentFromTrashRequest,
  toggleStarRequest
} from "@/store/slices/files";
import { useCallback } from "react";
import type { File } from "@/lib/models/upload";

export const useFiles = () => {
  const dispatch = useAppDispatch();
  const files = useAppSelector((state: RootState) => state.files);

  return {
    setLoading: useCallback((isLoading: boolean) => {
      dispatch(setLoading(isLoading));
    }, [dispatch]),
    loadFiles: useCallback((payload: { currentPage: number, limit: number, onSuccess?: Function }) => {
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
    setRenameDialog: useCallback((payload: { isOpen: boolean, file: TFile | null }) => {
      dispatch(setFileRenameOpen(payload));
    }, [dispatch]),
    setShareDialog: useCallback((payload: { isOpen: boolean, fileName: string, fileId: string }) => {
      dispatch(setFileShareOpen(payload));
    }, [dispatch]),
    setFileInfoDialog: useCallback((payload: { isOpen: boolean, file: TFile | null }) => {
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
    loadFilesInTrash: useCallback((payload: { currentPage: number, limit: number }) => {
      dispatch(loadTrashRequest(payload));
    }, [dispatch]),
    restoreFile: useCallback((fileId: string, onSuccess: Function, onError: Function) => {
      dispatch(deleteFromTrashRequest({ fileId, onSuccess, onError }));
    }, [dispatch]),
    restoreAllFromTrash: useCallback((onSuccess: Function, onError: Function) => {
      dispatch(restoreAllFromTrashRequest({ onSuccess, onError }));
    }, [dispatch]),
    deleteFileFromTrash: useCallback((fileId: string, onSuccess: Function, onError: Function) => {
      dispatch(deleteFromTrashRequest({ fileId, onSuccess, onError }));
    }, [dispatch]),
    deleteFileFromTrashPermanent: useCallback((fileId: string, onSuccess: Function, onError: Function) => {
      dispatch(deleteFilePermanentFromTrashRequest({ fileId, onSuccess, onError }));
    }, [dispatch]),
    clearFilesInTrash: useCallback((onSuccess: Function, onError: Function) => {
      dispatch(clearTrashRequest({ onSuccess, onError }));
    }, [dispatch]),
    loadRecentFiles: useCallback((payload: { currentPage: number, limit: number }) => {
      dispatch(loadRecentFilesRequest(payload));
    }, [dispatch]),
    deleteFileFromRecents: useCallback((fileId: string, onSuccess: Function, onError: Function) => {
      dispatch(deleteFromRecentsRequest({ fileId, onSuccess, onError }));
    }, [dispatch]),
    createFolder: useCallback((fileName: string, parentId: string | undefined, onSuccess: Function, onError: Function) => {
      dispatch(createFolderRequest({ fileName, parentId, onSuccess, onError }));
    }, [dispatch]),
    setCurrentProcessingFile: useCallback((file: File & { isUploading?: boolean, isUploaded?: boolean, isDeleting?: boolean, isDeleted?: boolean } | null) => {
      dispatch(setCurrentProcessingFile(file));
    }, [dispatch]),
    setStarred: useCallback((fileId: string, isStarred: boolean, onSuccess: Function, onError: Function) => {
      dispatch(toggleStarRequest({ fileId, isStarred, onSuccess, onError }));
    }, [dispatch]),

    ...files
  }
}