import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

interface File {
  id: string
  name: string
  type: string
  size: string
  modified: string
  path: string
  isStarred: boolean
  isDeleted: boolean
  deletedAt?: string
  originalPath?: string
}

interface FilesState {
  files: File[]
  starredFiles: string[]
  deletedFiles: {
    [key: string]: {
      deletedAt: string
      originalPath: string
    }
  }
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  hasMore: boolean
}

const initialState: FilesState = {
  files: [],
  starredFiles: [],
  deletedFiles: {},
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  hasMore: true
}

// Mock API call
const fetchFilesFromAPI = async (page: number, limit: number = 20) => {
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
  console.log(page)
  
  const totalItems = 100 // Mock total number of files
  const start = (page - 1) * limit
  const end = start + limit
  
  const mockFiles: File[] = Array.from({ length: Math.min(limit, totalItems - start) }, (_, i) => ({
    id: `file-${start + i}`,
    name: `File ${start + i + 1}.pdf`,
    type: Math.random() > 0.5 ? 'pdf' : 'folder',
    size: `${Math.floor(Math.random() * 10)}MB`,
    modified: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    path: `/documents/file-${start + i}`,
    isStarred: Math.random() > 0.8,
    isDeleted: false
  }))

  return {
    files: mockFiles,
    totalPages: Math.ceil(totalItems / limit),
    hasMore: end < totalItems
  }
}

export const fetchFiles = createAsyncThunk(
  'files/fetchFiles',
  async (page: number) => {
    const response = await fetchFilesFromAPI(page)
    return response
  }
)

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setFiles: (state, action: PayloadAction<File[]>) => {
      state.files = action.payload
    },
    deleteFile: (state, action: PayloadAction<string>) => {
      const fileId = action.payload
      const file = state.files.find(f => f.id === fileId)
      if (file) {
        file.isDeleted = true
        file.deletedAt = new Date().toISOString()
        state.deletedFiles[fileId] = {
          deletedAt: file.deletedAt,
          originalPath: file.path
        }
      }
    },
    restoreFile: (state, action: PayloadAction<string>) => {
      const fileId = action.payload
      const file = state.files.find(f => f.id === fileId)
      if (file) {
        file.isDeleted = false
        file.deletedAt = undefined
        file.path = state.deletedFiles[fileId].originalPath
        delete state.deletedFiles[fileId]
      }
    },
    permanentlyDeleteFile: (state, action: PayloadAction<string>) => {
      const fileId = action.payload
      state.files = state.files.filter(f => f.id !== fileId)
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
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false
        state.files = [...state.files, ...action.payload.files]
        state.totalPages = action.payload.totalPages
        state.hasMore = action.payload.hasMore
        state.currentPage += 1
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch files'
      })
  }
})

export const {
  setFiles,
  deleteFile,
  restoreFile,
  permanentlyDeleteFile,
  toggleStarred,
  resetPagination
} = filesSlice.actions
export default filesSlice.reducer