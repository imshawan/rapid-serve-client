import { PayloadAction } from "@reduxjs/toolkit"
import { takeLatest, put, call } from "redux-saga/effects"
import { fetchFilesFailure, fetchFilesRequest, fetchFilesSuccess, fetchFileMeta, setFileMeta, deleteFileSuccess, deleteFileRequest } from "../slices/files"
import { files,downloader } from "@/services/api"
import { toast } from "@/hooks/use-toast"

function* fetchFilesSaga(action: PayloadAction<{currentPage: number, limit: number}>): Generator<any, void, ApiResponse<any>> {
    try {
        const response = yield call(files.fetchFiles, action.payload.currentPage, action.payload.limit)
        yield put(fetchFilesSuccess(response.data))
    } catch (error) {
        yield put(fetchFilesFailure(error instanceof Error ? error.message : "Failed to fetch files"))
    }
}

function* fetchFileMetaSaga(action: PayloadAction<{fileId: string, onSuccess: Function, onError: Function}>): Generator<any, void, ApiResponse<any>> {
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

function* deleteFileSaga(action: PayloadAction<{fileId: string, onSuccess: Function, onError: Function}>): Generator<any, void, ApiResponse<any>> {
    try {
        const response = yield call(files.deleteFile, action.payload.fileId)
        yield put(deleteFileSuccess(response.data))
        action.payload.onSuccess()
    } catch (error) {
        toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to delete file",
            variant: "destructive"
        })
    }
}

export default function* watchFilesSaga() {
    yield takeLatest(fetchFilesRequest.type, fetchFilesSaga)
    yield takeLatest(fetchFileMeta.type, fetchFileMetaSaga)
    yield takeLatest(deleteFileRequest.type, deleteFileSaga)
}
