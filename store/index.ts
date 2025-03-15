import { combineReducers, configureStore } from "@reduxjs/toolkit"
import createSagaMiddleware from "redux-saga"
import filesReducer from "./slices/files"
import authReducer from "./slices/auth"
import appReducer from "./slices/app"
import userReducer from "./slices/user"
import sharedFilesReducer from "./slices/shared"
import { useDispatch, useSelector } from "react-redux"
import type { TypedUseSelectorHook } from "react-redux"
import rootSaga from "./sagas/root"

const sagaMiddleware = createSagaMiddleware()

const combinedReducersFn = combineReducers({
  app: appReducer,
  files: filesReducer,
  auth: authReducer,
  user: userReducer,
  shared: sharedFilesReducer,
})

// Reset the store when logoutSuccess action is dispatched
const rootReducer = (state: any, action: any) => {
  if (action.type === "auth/logoutSuccess") {
    state = undefined
  }
  return combinedReducersFn(state, action)
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false,
    }).concat(sagaMiddleware),
})

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector