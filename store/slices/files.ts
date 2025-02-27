import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { File } from "@/lib/models/upload/file"
import { SoftDeleteFields } from "@/lib/db/plugins/soft-delete";

export type TFile = File & SoftDeleteFields & { isUploading?: boolean }

interface FilesState {
  files: TFile[];
  starredFiles: string[];
  deletedFiles: Record<string, { deletedAt: Date; }>;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  downloadOpen: boolean;
  fileMeta: FileMetaResponse | null
}

const initialState: FilesState = {
  files: [],
  starredFiles: [],
  deletedFiles: {},
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  hasMore: true,
  downloadOpen: false,
  fileMeta: null
};

// Mock API call


// Redux Slice
const filesSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    setFiles: (state, action: PayloadAction<TFile[]>) => {
      state.files = action.payload;
    },
    deleteFile: (state, action: PayloadAction<string>) => {
      const fileId = action.payload;
      const file = state.files.find(f => f.fileId === fileId);
      if (file) {
        file.isDeleted = true;
        file.deletedAt = new Date();
        state.deletedFiles[fileId] = {
          deletedAt: file.deletedAt,
          // originalPath: file.path,
        };
      }
    },
    restoreFile: (state, action: PayloadAction<string>) => {
      const fileId = action.payload;
      const file = state.files.find(f => f.fileId === fileId);
      if (file) {
        // file.isDeleted = false;
        // file.deletedAt = undefined;
        // file.path = state.deletedFiles[fileId]?.originalPath || file.path;
        delete state.deletedFiles[fileId];
      }
    },
    permanentlyDeleteFile: (state, action: PayloadAction<string>) => {
      const fileId = action.payload;
      state.files = state.files.filter(f => f.fileId !== fileId);
      delete state.deletedFiles[fileId];
    },
    toggleStarred: (state, action: PayloadAction<string>) => {
      const fileId = action.payload;
      const fileIndex = state.starredFiles.indexOf(fileId);
      if (fileIndex === -1) {
        state.starredFiles.push(fileId);
      } else {
        state.starredFiles.splice(fileIndex, 1);
      }
    },
    resetPagination: (state) => {
      state.currentPage = 1;
      state.hasMore = true;
    },
    fetchFilesRequest: (state, action: PayloadAction<{ currentPage: number, limit: number }>) => {
      state.loading = true;
      state.error = null;
    },
    fetchFilesSuccess: (state, action: PayloadAction<Pagination>) => {
      console.log(action.payload)
      state.loading = false;
      state.files = [...state.files, ...action.payload.data];
      state.totalPages = action.payload.totalPages;
      state.hasMore = action.payload.currentPage > (action.payload.end + 1);
      state.currentPage = action.payload.currentPage;
    },
    fetchFilesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchFileMeta: (state, action: PayloadAction<{ fileId: string, onSuccess: Function, onError: Function }>) => { },
    setFileMeta: (state, action: PayloadAction<FileMetaResponse>) => {
      state.fileMeta = action.payload
    },
    setDownloaderOpen: (state, action: PayloadAction<boolean>) => {
      state.downloadOpen = action.payload
    },
    deleteFileRequest: (state, action: PayloadAction<{ fileId: string, onSuccess: Function, onError: Function }>) => { },
    deleteFileSuccess: (state, action: PayloadAction<{ fileId: string }>) => {
      state.files = state.files.filter(f => f.fileId !== action.payload.fileId)
    },
    addFileToList: (state, action: PayloadAction<File & { isUploading?: boolean }>) => {
      let fileIndex = state.files.findIndex(f => f.fileId === action.payload.fileId)
      if (fileIndex !== -1) {
        state.files[fileIndex] = action.payload as TFile
      } else {
        state.files = [(action.payload as TFile), ...state.files]
      }
    }
  },
});

export const {
  setFiles,
  deleteFile,
  restoreFile,
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
  addFileToList
} = filesSlice.actions;
export default filesSlice.reducer;