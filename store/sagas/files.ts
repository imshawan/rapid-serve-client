import { PayloadAction } from '@reduxjs/toolkit';
import { takeLatest, put, call } from 'redux-saga/effects';
import { fetchFilesFailure, fetchFilesRequest, fetchFilesSuccess } from '../slices/files';
import { files } from "@/services/api"

function* fetchFilesSaga(action: PayloadAction<{currentPage: number, limit: number}>): Generator<any, void, ApiResponse<any>> {
    try {
        const response = yield call(files.fetchFiles, action.payload.currentPage, action.payload.limit);
        yield put(fetchFilesSuccess(response.data));
    } catch (error) {
        yield put(fetchFilesFailure(error instanceof Error ? error.message : 'Failed to fetch files'));
    }
}

export default function* watchFilesSaga() {
    yield takeLatest(fetchFilesRequest.type, fetchFilesSaga);
}
