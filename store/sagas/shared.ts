import { PayloadAction } from "@reduxjs/toolkit"
import { takeLatest, put, call } from "redux-saga/effects"
import { share } from "@/services/api"
import { toast } from "@/hooks/use-toast"
import { loadFilesRequest, loadFilesSuccess, setLoading } from "../slices/shared"

function* fetchSharedFilesSaga(action: PayloadAction<{ currentPage: number, limit: number, filter?: string, search?: string }>): Generator<any, void, ApiResponse<any>> {
  yield put(setLoading(true))
  try {
    const response = yield call(share.fetchFiles, action.payload.currentPage, action.payload.limit, action.payload.filter, action.payload.search)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
    yield put(loadFilesSuccess(response.data))
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to load shared files",
      variant: "destructive"
    })
  } finally {
    yield put(setLoading(false))
  }
}

export default function* watchSharedSaga() {
  yield takeLatest(loadFilesRequest.type, fetchSharedFilesSaga)
}