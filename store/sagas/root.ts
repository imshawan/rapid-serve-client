import { all, fork } from "redux-saga/effects"
import authSaga from "./auth"
import userSaga from "./user"
import filesSaga from "./files";

export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(userSaga),
    fork(filesSaga),
  ]);
}
