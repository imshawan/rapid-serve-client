import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilesState {
  files: File[];
  starredFiles: string[];
  deletedFiles: Record<string, { deletedAt: string; originalPath: string }>;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
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
};

// Mock API call


// Redux Slice
const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setFiles: (state, action: PayloadAction<File[]>) => {
      state.files = action.payload;
    },
    deleteFile: (state, action: PayloadAction<string>) => {
      const fileId = action.payload;
      const file = state.files.find(f => f.id === fileId);
      if (file) {
        file.isDeleted = true;
        file.deletedAt = new Date().toISOString();
        state.deletedFiles[fileId] = {
          deletedAt: file.deletedAt,
          originalPath: file.path,
        };
      }
    },
    restoreFile: (state, action: PayloadAction<string>) => {
      const fileId = action.payload;
      const file = state.files.find(f => f.id === fileId);
      if (file) {
        file.isDeleted = false;
        file.deletedAt = undefined;
        file.path = state.deletedFiles[fileId]?.originalPath || file.path;
        delete state.deletedFiles[fileId];
      }
    },
    permanentlyDeleteFile: (state, action: PayloadAction<string>) => {
      const fileId = action.payload;
      state.files = state.files.filter(f => f.id !== fileId);
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
    fetchFilesRequest: (state, action: PayloadAction<{currentPage: number, limit: number}>) => {
      state.loading = true;
      state.error = null;
    },
    fetchFilesSuccess: (state, action: PayloadAction<{ files: File[]; totalPages: number; hasMore: boolean }>) => {
      state.loading = false;
      state.files = [...state.files, ...action.payload.files];
      state.totalPages = action.payload.totalPages;
      state.hasMore = action.payload.hasMore;
      state.currentPage += 1;
    },
    fetchFilesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
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
} = filesSlice.actions;
export default filesSlice.reducer;