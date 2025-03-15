import { PayloadAction } from "@reduxjs/toolkit"
import { takeLatest, put, call } from "redux-saga/effects"
import {
  fetchFilesFailure,
  fetchFilesRequest,
  fetchFilesSuccess,
  fetchFileMeta,
  setFileMeta,
  deleteFileSuccess,
  deleteFileRequest,
  searchFilesSuccess,
  searchFilesRequest,
  fileRenameRequest,
  fileRenameSuccess,
  setFileLoading,
  loadTrashSuccess,
  loadTrashRequest,
  deleteFromTrashRequest,
  deleteFromTrash,
  clearTrashSuccess,
  clearTrashRequest,
  setLoading,
  loadRecentFilesSuccess,
  loadRecentFilesRequest,
  deleteFromRecents,
  deleteFromRecentsRequest,
  createFolderRequest,
  addFileToList,
  restoreAllFromTrashRequest,
  deleteFilePermanentFromTrashRequest,
} from "../slices/files";
import { files, downloader } from "@/services/api"
import { toast } from "@/hooks/use-toast"
import { userUpdate } from "../slices/auth"

function* fetchFilesSaga(action: PayloadAction<{ currentPage: number, limit: number }>): Generator<any, void, ApiResponse<any>> {
  try {
    const response = yield call(files.fetchFiles, action.payload.currentPage, action.payload.limit)
    yield put(fetchFilesSuccess(response.data))
  } catch (error) {
    yield put(fetchFilesFailure(error instanceof Error ? error.message : "Failed to fetch files"))
  }
}

function* fetchFileMetaSaga(action: PayloadAction<{ fileId: string, onSuccess: Function, onError: Function }>): Generator<any, void, ApiResponse<any>> {
  try {
    const response = yield call(downloader.getFileMeta, action.payload.fileId)
    yield put(setFileMeta(response.data))
    action.payload.onSuccess()
  } catch (error) {
    action.payload.onError()
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to fetch file meta",
      variant: "destructive"
    })
  }
}

function* deleteFileSaga(action: PayloadAction<{ fileId: string, onSuccess: Function, onError: Function }>): Generator<any, void, ApiResponse<any>> {
  try {
    const response = yield call(files.deleteFile, action.payload.fileId)
    if (!response.success) {
      throw new Error(response.error?.message)
    }

    yield put(deleteFileSuccess(response.data))
    if (response.data && !isNaN(response.data.used)) {
      yield put(userUpdate({ storageUsed: response.data.used }))
    }
    action.payload.onSuccess()
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to delete file",
      variant: "destructive"
    })
  }
}

function* searchedFilesSaga(action: PayloadAction<{ currentPage: number, limit: number, search: string }>): Generator<any, void, ApiResponse<any>> {
  try {
    const response = yield call(files.fetchFiles, action.payload.currentPage, action.payload.limit, action.payload.search)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
    yield put(searchFilesSuccess(response.data))
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to search files",
      variant: "destructive"
    })
  }
}

function* updateFileNameSaga(action: PayloadAction<{ fileId: string, fileName: string, onSuccess: Function, onError: Function }>): Generator<any, void, ApiResponse<any>> {
  yield put(setFileLoading(action.payload.fileId))
  try {
    const response = yield call(files.updateFileName, action.payload.fileId, action.payload.fileName)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
    yield put(fileRenameSuccess(response.data))
    action.payload?.onSuccess()
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to update file name",
      variant: "destructive"
    })
  } finally {
    yield put(setFileLoading(""))
  }
}

function* loadFilesInTrashSaga(action: PayloadAction<{ currentPage: number, limit: number }>): Generator<any, void, ApiResponse<any>> {
  yield put(setLoading(true))
  try {
    const response = yield call(files.fetchInTrash, action.payload.currentPage, action.payload.limit)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
    yield put(loadTrashSuccess(response.data))
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to load trash files",
      variant: "destructive"
    })
  } finally {
    yield put(setLoading(false))
  }
}

function* restoreFileFromTrashSaga(action: PayloadAction<{ fileId: string, onSuccess: Function, onError: Function }>): Generator<any, void, ApiResponse<any>> {
  try {
    const response = yield call(files.restoreFile, action.payload.fileId)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
    yield put(deleteFromTrash(response.data))
    action.payload.onSuccess()

    if (response.data && !isNaN(response.data.used)) {
      yield put(userUpdate({ storageUsed: response.data.used }))
    }
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to restore file",
      variant: "destructive"
    })
    action.payload.onError()
  }
}

function* restoreAllFromTrashRequestSaga(action: PayloadAction<{ onSuccess: Function, onError: Function }>): Generator<any, void, ApiResponse<any>> {
  try {
    const response = yield call(files.restoreAllFromTrash)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
    yield put(clearTrashSuccess())
    action.payload.onSuccess()

    if (response.data && !isNaN(response.data.used)) {
      yield put(userUpdate({ storageUsed: response.data.used }))
    }
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to restore all files",
      variant: "destructive"
    })
    action.payload.onError()
  }
} 

function* deleteFilePermanentFromTrashSaga(action: PayloadAction<{ fileId: string, onSuccess: Function, onError: Function }>): Generator<any, void, ApiResponse<any>> {
  try {
    const response = yield call(files.deleteFilePermanently, action.payload.fileId)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
    yield put(deleteFromTrash(response.data))
    action.payload.onSuccess()
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to delete file permanently",
      variant: "destructive"
    })
    action.payload.onError()
  }
}

function* clearTrashSaga(action: PayloadAction<{ onSuccess: Function, onError: Function }>): Generator<any, void, ApiResponse<any>> {
  try {
    const response = yield call(files.clearAllInTrash)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
    yield put(clearTrashSuccess())
    action.payload.onSuccess()
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to clear trash",
      variant: "destructive"
    })
    action.payload.onError()
  }
}

function* fetchRecentFilesSaga(action: PayloadAction<{ currentPage: number, limit: number }>): Generator<any, void, ApiResponse<any>> {
  yield put(setLoading(true))
  try {
    const response = yield call(files.fetchInRecents, action.payload.currentPage, action.payload.limit)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
    yield put(loadRecentFilesSuccess(response.data))
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to load recent files",
      variant: "destructive"
    })
  } finally {
    yield put(setLoading(false))
  }
}

function* deleteFromRecentsSaga(action: PayloadAction<{ fileId: string, onSuccess: Function, onError: Function }>): Generator<any, void, ApiResponse<any>> {
  try {
    const response = yield call(files.removeRecentFile, action.payload.fileId)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
    yield put(deleteFromRecents({fileId: action.payload.fileId}))
    action.payload.onSuccess()
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to delete file from recents",
      variant: "destructive"
    })
    action.payload.onError()
  }
}

function* createFolderSaga(action: PayloadAction<{ fileName: string, parentId: string, onSuccess: Function, onError: Function }>): Generator<any, void, ApiResponse<any>> {
  try {
    const response = yield call(files.createFolder, action.payload.fileName, action.payload.parentId)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
    // We don't need to update global files state here since folder contents screen 
    // manages its own local state and doesn't use the global files state.
    // The global files state is only used in the dashboard view.
    if (!action.payload.parentId) {
      yield put(addFileToList(response.data))
    }
    action.payload.onSuccess(response.data)
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to create folder",
      variant: "destructive"
    })
    action.payload.onError()
  }
}

export default function* watchFilesSaga() {
  yield takeLatest(fetchFilesRequest.type, fetchFilesSaga)
  yield takeLatest(fetchFileMeta.type, fetchFileMetaSaga)
  yield takeLatest(deleteFileRequest.type, deleteFileSaga)
  yield takeLatest(searchFilesRequest.type, searchedFilesSaga)
  yield takeLatest(fileRenameRequest.type, updateFileNameSaga)
  yield takeLatest(loadTrashRequest.type, loadFilesInTrashSaga)
  yield takeLatest(deleteFromTrashRequest.type, restoreFileFromTrashSaga)
  yield takeLatest(restoreAllFromTrashRequest.type, restoreAllFromTrashRequestSaga)
  yield takeLatest(clearTrashRequest.type, clearTrashSaga)
  yield takeLatest(loadRecentFilesRequest.type, fetchRecentFilesSaga)
  yield takeLatest(deleteFromRecentsRequest.type, deleteFromRecentsSaga)
  yield takeLatest(createFolderRequest.type, createFolderSaga)
  yield takeLatest(deleteFilePermanentFromTrashRequest.type, deleteFilePermanentFromTrashSaga)
}
