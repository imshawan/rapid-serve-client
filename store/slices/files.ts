import _ from "lodash"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { File } from "@/lib/models/upload/file"
import { SoftDeleteFields } from "@/lib/db/plugins/soft-delete"

export type TFile = File & SoftDeleteFields & { isUploading?: boolean }

interface FilesState {
  files: TFile[]
  searchedFiles: {
    files: TFile[]
    search: string
    currentPage: number
    totalPages: number
    hasMore: boolean
  }
  trash: {
    files: TFile[]
    currentPage: number
    totalPages: number
    hasMore: boolean
  }
  starredFiles: string[]
  deletedFiles: Record<string, { deletedAt: Date }>
  loading: boolean
  fileLoading: string
  error: string | null
  currentPage: number
  totalPages: number
  hasMore: boolean
  downloadOpen: boolean
  fileMeta: FileMetaResponse | null
  shareOpen: { isOpen: boolean, fileName: string }
  fileInfoOpen: { isOpen: boolean, file: TFile | null }
  renameOpen: { isOpen: boolean, file: TFile | null }
  previewOpen: { isOpen: boolean, file: TFile | null }
  deleteOpen: { isOpen: boolean, fileId: string | null, fileName: string | null }
}

const initialState: FilesState = {
  files: [],
  searchedFiles: {
    files: [],
    search: "",
    currentPage: 1,
    totalPages: 1,
    hasMore: false
  },
  trash: {
    files: [],
    currentPage: 1,
    totalPages: 1,
    hasMore: false
  },
  starredFiles: [],
  deletedFiles: {},
  loading: true,
  fileLoading: "",
  error: null,
  currentPage: 1,
  totalPages: 1,
  hasMore: true,
  downloadOpen: false,
  fileMeta: null,
  shareOpen: { isOpen: false, fileName: "" },
  fileInfoOpen: { isOpen: false, file: null },
  renameOpen: { isOpen: false, file: null },
  previewOpen: { isOpen: false, file: null },
  deleteOpen: { isOpen: false, fileId: "", fileName: "" }
}

// Mock API call


// Redux Slice
const filesSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setFiles: (state, action: PayloadAction<TFile[]>) => {
      state.files = action.payload
    },
    permanentlyDeleteFile: (state, action: PayloadAction<string>) => {
      const fileId = action.payload
      state.files = state.files.filter(f => f.fileId !== fileId)
      delete state.deletedFiles[fileId]
    },
    toggleStarred: (state, action: PayloadAction<string>) => {
      const fileId = action.payload
      const fileIndex = state.starredFiles.indexOf(fileId)
      if (fileIndex === -1) {
        state.starredFiles.push(fileId)
      } else {
        state.starredFiles.splice(fileIndex, 1)
      }
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
      state.files =  _.uniqBy([...state.files, ...action.payload.data], "fileId")
      state.totalPages = action.payload.totalPages
      state.hasMore = action.payload.currentPage > (action.payload.end + 1)
      state.currentPage = action.payload.currentPage
    },
    fetchFilesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    searchFilesRequest: (state, action: PayloadAction<{ currentPage: number, limit: number, search: string }>) => { },
    searchFilesSuccess: (state, action: PayloadAction<Pagination>) => {
      state.searchedFiles.files = action.payload.data
      state.searchedFiles.totalPages = action.payload.totalPages
      state.searchedFiles.hasMore = action.payload.currentPage > (action.payload.end + 1)
      state.searchedFiles.currentPage = action.payload.currentPage
    },
    loadTrashRequest: (state, action: PayloadAction<{ currentPage: number, limit: number }>) => { },
    loadTrashSuccess: (state, action: PayloadAction<Pagination>) => {
      state.trash.files = action.payload.data
      state.trash.totalPages = action.payload.totalPages
      state.trash.hasMore = action.payload.currentPage > (action.payload.end + 1)
      state.trash.currentPage = action.payload.currentPage
    },
    fetchFileMeta: (state, action: PayloadAction<{ fileId: string, onSuccess: Function, onError: Function }>) => { },
    setFileMeta: (state, action: PayloadAction<FileMetaResponse>) => {
      state.fileMeta = action.payload
    },
    setDownloaderOpen: (state, action: PayloadAction<boolean>) => {
      state.downloadOpen = action.payload
    },
    setFilePreviewOpen: (state, action: PayloadAction<{ isOpen: boolean, file: TFile | null }>) => {
      state.previewOpen = action.payload
    },
    setFileInfoOpen: (state, action: PayloadAction<{ isOpen: boolean, file: TFile | null }>) => {
      state.fileInfoOpen = action.payload
    },
    setFileRenameOpen: (state, action: PayloadAction<{ isOpen: boolean, file: TFile | null }>) => {
      state.renameOpen = action.payload
    },
    setFileShareOpen: (state, action: PayloadAction<{ isOpen: boolean, fileName: string }>) => {
      state.shareOpen = action.payload
    },
    setDeleteOpen: (state, action: PayloadAction<{ isOpen: boolean, fileId: string | null, fileName: string | null }>) => {
      state.deleteOpen = action.payload
    },
    setFileLoading: (state, action: PayloadAction<string>) => {
      state.fileLoading = action.payload
    },
    deleteFileRequest: (state, action: PayloadAction<{ fileId: string, onSuccess: Function, onError: Function }>) => { },
    deleteFileSuccess: (state, action: PayloadAction<{ fileId: string }>) => {
      state.files = state.files.filter(f => f.fileId !== action.payload.fileId)
    },
    fileRenameRequest: (state, action: PayloadAction<{ fileId: string, fileName: string, onSuccess: Function, onError: Function }>) => { },
    fileRenameSuccess: (state, action: PayloadAction<{ fileId: string, fileName: string }>) => {
      let fileIndex = state.files.findIndex(f => f.fileId === action.payload.fileId)
      if (fileIndex !== -1) {
        state.files[fileIndex].fileName = action.payload.fileName
      }
    },
    addFileToList: (state, action: PayloadAction<File & { isUploading?: boolean }>) => {
      let fileIndex = state.files.findIndex(f => f.fileId === action.payload.fileId)
      if (fileIndex !== -1) {
        state.files[fileIndex] = action.payload as TFile
      } else {
        state.files = [(action.payload as TFile), ...state.files]
      }
    },
    deleteFromTrashRequest: (state, action: PayloadAction<{ fileId: string, onSuccess: Function, onError: Function }>) => { },
    deleteFromTrash: (state, action: PayloadAction<{ fileId: string, used: number }>) => {
      state.trash.files = state.trash.files.filter(f => f.fileId !== action.payload.fileId)
    },
    clearTrashRequest: (state, action: PayloadAction<{ onSuccess: Function, onError: Function }>) => { },
    clearTrashSuccess: (state) => {
      state.trash.files = []
    }
  },
})

export const {
  setLoading,
  setFiles,
  permanentlyDeleteFile,
  toggleStarred,
  resetPagination,
  fetchFilesRequest,
  fetchFilesSuccess,
  fetchFilesFailure,
  fetchFileMeta,
  setFileMeta,
  setDownloaderOpen,
  deleteFileRequest,
  deleteFileSuccess,
  deleteFromTrashRequest,
  deleteFromTrash,
  addFileToList,
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
  loadTrashRequest,
  loadTrashSuccess,
  clearTrashRequest,
  clearTrashSuccess
} = filesSlice.actions
export default filesSlice.reducer