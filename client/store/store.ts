import { configureStore } from '@reduxjs/toolkit'
import filesReducer from './slices/filesSlice'
import authReducer from './slices/authSlice'
import appReducer from './slices/appSlice'
import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'

export const store = configureStore({
  reducer: {
    app: appReducer,
    files: filesReducer,
    auth: authReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector