import _ from "lodash"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { File } from "@/lib/models/upload/file"
import { SoftDeleteFields } from "@/lib/db/plugins/soft-delete"
import { Recent } from "@/lib/models/recent"

export type TFile = File & SoftDeleteFields & { isUploading?: boolean }

interface FilesState {
  files: TFile[];
  searchedFiles: {
    files: TFile[];
    search: string;
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
  };
  trash: {
    files: TFile[];
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
  };
  recents: {
    files: Recent[];
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
  };
  currentProcessingFile:
    | (TFile & {
        isUploading?: boolean;
        isUploaded?: boolean;
        isDeleting?: boolean;
        isDeleted?: boolean;
      })
    | null;
  starredFiles: string[];
  deletedFiles: Record<string, { deletedAt: Date }>;
  loading: boolean;
  fileLoading: string;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  downloadOpen: boolean;
  fileMeta: FileMetaResponse | null;
  shareOpen: { isOpen: boolean; fileName: string; fileId: string };
  fileInfoOpen: { isOpen: boolean; file: TFile | null };
  renameOpen: { isOpen: boolean; file: TFile | null };
  deleteOpen: {
    isOpen: boolean;
    fileId: string | null;
    fileName: string | null;
  };
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
  recents: {
    files: [],
    currentPage: 1,
    totalPages: 1,
    hasMore: false
  },
  currentProcessingFile: null,
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
  shareOpen: { isOpen: false, fileName: "", fileId: "" },
  fileInfoOpen: { isOpen: false, file: null },
  renameOpen: { isOpen: false, file: null },
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
    resetPagination: (state) => {
      state.currentPage = 1
      state.hasMore = true
    },
    fetchFilesRequest: (state, action: PayloadAction<{ currentPage: number, limit: number, onSuccess?: Function }>) => {
      // state.loading = true
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
      state.trash.files = _.uniqBy([...state.recents.files, ...action.payload.data], "fileId")
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
    setFileInfoOpen: (state, action: PayloadAction<{ isOpen: boolean, file: TFile | null }>) => {
      state.fileInfoOpen = action.payload
    },
    setFileRenameOpen: (state, action: PayloadAction<{ isOpen: boolean, file: TFile | null }>) => {
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
    deleteFilePermanentFromTrashRequest: (state, action: PayloadAction<{ fileId: string, onSuccess: Function, onError: Function }>) => { },
    deleteFromTrashRequest: (state, action: PayloadAction<{ fileId: string, onSuccess: Function, onError: Function }>) => { },
    deleteFromTrash: (state, action: PayloadAction<{ fileId: string, used?: number }>) => {
      state.trash.files = state.trash.files.filter(f => f.fileId !== action.payload.fileId)
    },
    clearTrashRequest: (state, action: PayloadAction<{ onSuccess: Function, onError: Function }>) => { },
    clearTrashSuccess: (state) => {
      state.trash.files = []
    },
    restoreAllFromTrashRequest: (state, action: PayloadAction<{ onSuccess: Function, onError: Function }>) => { },
    loadRecentFilesRequest: (state, action: PayloadAction<{ currentPage: number, limit: number }>) => { },
    loadRecentFilesSuccess: (state, action: PayloadAction<Pagination>) => {
      state.recents.files = _.uniqBy([...state.recents.files, ...action.payload.data], "fileId")
      state.recents.totalPages = action.payload.totalPages
      state.recents.hasMore = action.payload.currentPage > (action.payload.end + 1)
      state.recents.currentPage = action.payload.currentPage
    },
    deleteFromRecentsRequest: (state, action: PayloadAction<{ fileId: string, onSuccess: Function, onError: Function }>) => { },
    deleteFromRecents: (state, action: PayloadAction<{ fileId: string }>) => {
      state.recents.files = state.recents.files.filter(f => f.fileId !== action.payload.fileId)
    },
    createFolderRequest: (state, action: PayloadAction<{ fileName: string, parentId?: string, onSuccess: Function, onError: Function }>) => { },
    setCurrentProcessingFile: (state, action: PayloadAction<File & { isUploading?: boolean, isUploaded?: boolean, isDeleting?: boolean, isDeleted?: boolean } | null>) => {
      state.currentProcessingFile = action.payload as TFile
    },
    toggleStarRequest: (state, action: PayloadAction<{ fileId: string, isStarred: boolean, onSuccess: Function, onError: Function }>) => { },
    toggleStar: (state, action: PayloadAction<{ fileId: string, isStarred: boolean}>) => {
      const fileIndex = state.files.findIndex(f => f.fileId === action.payload.fileId)
      if (fileIndex !== -1) {
        state.files[fileIndex].isStarred = action.payload.isStarred
      }
    }
  }
})

export const {
  setLoading,
  setFiles,
  permanentlyDeleteFile,
  resetPagination,
  fetchFilesRequest,
  fetchFilesSuccess,
  fetchFilesFailure,
  fetchFileMeta,
  setFileMeta,
  setDownloaderOpen,
  deleteFileRequest,
  deleteFileSuccess,
  deleteFilePermanentFromTrashRequest,
  deleteFromTrashRequest,
  deleteFromTrash,
  deleteFromRecentsRequest,
  deleteFromRecents,
  addFileToList,
  searchFilesRequest,
  searchFilesSuccess,
  setFileInfoOpen,
  setFileRenameOpen,
  setFileShareOpen,
  setFileLoading,
  setCurrentProcessingFile,
  setDeleteOpen,
  toggleStar,
  toggleStarRequest,
  fileRenameRequest,
  fileRenameSuccess,
  loadTrashRequest,
  loadTrashSuccess,
  clearTrashRequest,
  clearTrashSuccess,
  createFolderRequest,
  loadRecentFilesRequest,
  loadRecentFilesSuccess,
  restoreAllFromTrashRequest
} = filesSlice.actions
export default filesSlice.reducer