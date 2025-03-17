import { call, put, takeLatest } from "redux-saga/effects";
import { loadPlanRequest, setSettingsLoading, updateStorage } from "../slices/app";
import { toast } from "@/hooks/use-toast";
import { user } from "@/services/api/user";

function* loadPlanDetailsSaga(): Generator<any, void, ApiResponse<any>> {
  yield put(setSettingsLoading(true))
  try {
    const response = yield call(user.getPlanDetails)
    if (!response.success) {
      throw new Error(response.error?.message)
    }
    yield put(updateStorage(response.data))
  } catch (error) {
    toast({
      title: "Error",
      description: "Error occured while loading plan details",
      variant: "destructive",
    })
  } finally {
    yield put(setSettingsLoading(false))
  }
}

export default function* appSaga(): Generator {
  yield takeLatest(loadPlanRequest.type, loadPlanDetailsSaga);
}