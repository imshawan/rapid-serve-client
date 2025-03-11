import _ from "lodash"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { SoftDeleteFields } from "@/lib/db/plugins/soft-delete"
import type { Shared } from "@/lib/models/shared"

interface SharedFilesState {
  files: SharedFilePopulated[]
  searchedFiles: {
    files: SharedFilePopulated[]
    search: string
    currentPage: number
    totalPages: number
    hasMore: boolean
  }
  loading: boolean
  fileLoading: string
  error: string | null
  currentPage: number
  totalPages: number
  hasMore: boolean
  shareOpen: { isOpen: boolean, fileName: string, fileId: string }
  fileInfoOpen: { isOpen: boolean, file: SharedFilePopulated | null }
  renameOpen: { isOpen: boolean, file: SharedFilePopulated | null }
  previewOpen: { isOpen: boolean, file: SharedFilePopulated | null }
  deleteOpen: { isOpen: boolean, fileId: string | null, fileName: string | null }
}

const initialState: SharedFilesState = {
  files: [],
  searchedFiles: {
    files: [],
    search: "",
    currentPage: 1,
    totalPages: 1,
    hasMore: false
  },
  loading: true,
  fileLoading: "",
  error: null,
  currentPage: 1,
  totalPages: 1,
  hasMore: true,
  shareOpen: { isOpen: false, fileName: "", fileId: "" },
  fileInfoOpen: { isOpen: false, file: null },
  renameOpen: { isOpen: false, file: null },
  previewOpen: { isOpen: false, file: null },
  deleteOpen: { isOpen: false, fileId: "", fileName: "" }
}

const sharedFilesSlice = createSlice({
  name: "shared",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    resetPagination: (state) => {
      state.currentPage = 1
      state.hasMore = true
    },
    fetchFilesRequest: (state, action: PayloadAction<{ currentPage: number, limit: number }>) => {
      state.loading = true
      state.error = null
    },
    fetchFilesSuccess: (state, action: PayloadAction<Pagination>) => {
      state.loading = false
      state.files = _.uniqBy([...state.files, ...action.payload.data], "fileId")
      state.totalPages = action.payload.totalPages
      state.hasMore = action.payload.currentPage > (action.payload.end + 1)
      state.currentPage = action.payload.currentPage
    },
    fetchFilesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    setFilePreviewOpen: (state, action: PayloadAction<{ isOpen: boolean, file: any }>) => {
      state.previewOpen = action.payload
    },
    setFileInfoOpen: (state, action: PayloadAction<{ isOpen: boolean, file: any }>) => {
      state.fileInfoOpen = action.payload
    },
    setFileRenameOpen: (state, action: PayloadAction<{ isOpen: boolean, file: any }>) => {
      state.renameOpen = action.payload
    },
    setFileShareOpen: (state, action: PayloadAction<{ isOpen: boolean, fileName: string, fileId: string }>) => {
      state.shareOpen = action.payload
    },
    setDeleteOpen: (state, action: PayloadAction<{ isOpen: boolean, fileId: string | null, fileName: string | null }>) => {
      state.deleteOpen = action.payload
    },
    setFileLoading: (state, action: PayloadAction<string>) => {
      state.fileLoading = action.payload
    },
    searchFilesRequest: (state, action: PayloadAction<{ currentPage: number, limit: number, search: string }>) => { },
    searchFilesSuccess: (state, action: PayloadAction<Pagination>) => {
      state.searchedFiles.files = action.payload.data
      state.searchedFiles.totalPages = action.payload.totalPages
      state.searchedFiles.hasMore = action.payload.currentPage > (action.payload.end + 1)
      state.searchedFiles.currentPage = action.payload.currentPage
    },
    loadFilesRequest: (state, action: PayloadAction<{ currentPage: number, limit: number, clearOld?: boolean }>) => {
      if (action.payload.clearOld) {
        state.files = []
        state.loading = true
      }
    },
    loadFilesSuccess: (state, action: PayloadAction<Pagination>) => {
      state.files = _.uniqBy([...state.files, ...action.payload.data], "fileId")
      state.totalPages = action.payload.totalPages
      state.hasMore = action.payload.currentPage > (action.payload.end + 1)
      state.currentPage = action.payload.currentPage
    },
    fileRenameRequest: (state, action: PayloadAction<{ fileId: string, fileName: string, onSuccess: Function, onError: Function }>) => { },
    fileRenameSuccess: (state, action: PayloadAction<{ fileId: string, fileName: string }>) => {
      let fileIndex = state.files.findIndex(f => f.fileId === action.payload.fileId)
      if (fileIndex !== -1) {
        state.files[fileIndex].fileName = action.payload.fileName
      }
    },
  },
})

export const {
  setLoading,
  resetPagination,
  loadFilesRequest,
  loadFilesSuccess,
  searchFilesRequest,
  searchFilesSuccess,
  setFilePreviewOpen,
  setFileInfoOpen,
  setFileRenameOpen,
  setFileShareOpen,
  setFileLoading,
  setDeleteOpen,
  fileRenameRequest,
  fileRenameSuccess,
} = sharedFilesSlice.actions

export default sharedFilesSlice.reducer