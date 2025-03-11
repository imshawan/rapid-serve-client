import { http } from "@/lib/api/http"
import { endpoints } from "./endpoints"
import { parseRouteParams } from "@/lib/utils/common"


export const files = {
  fetchFiles: async (page: number, limit: number = 20, search?: string, fields?: string[]) => {
    let query: any = { limit: String(limit), page: String(page) }
    if (search) query['search'] = search;

    let queryParams = new URLSearchParams(query).toString()
    return await http.get(parseRouteParams(endpoints.LOAD_FILES, { queryParams }))
  },

  deleteFile: async (fileId: string) => {
    return await http.delete<{ fileId: string }>(parseRouteParams(endpoints.DELETE_FILE, { fileId }))
  },

  deleteFilePermanently: async (fileId: string) => {
    return await http.delete(parseRouteParams(endpoints.DELETE_FILE_PERMANENTLY, { fileId }))
  },

  updateFileName: async (fileId: string, fileName: string) => {
    return await http.patch<{ fileId: string, fileName: string }>(parseRouteParams(endpoints.RENAME_FILE, { fileId }), { fileName })
  },

  fetchInTrash: async (page: number, limit: number = 20, search?: string) => {
    let query: any = { limit: String(limit), page: String(page), loc: "trash" }
    if (search) query['search'] = search;

    let queryParams = new URLSearchParams(query).toString()
    return await http.get(parseRouteParams(endpoints.LOAD_FILES, { queryParams }))
  },

  restoreFile: async (fileId: string) => {
    return await http.patch<{ fileId: string, used: number }>(parseRouteParams(endpoints.RESTORE_FILE, { fileId }), {})
  },

  clearAllInTrash: async () => {
    return await http.delete(endpoints.DELETE_ALL_FILES_PERMANENTLY)
  },

  fetchInRecents: async (page: number, limit: number = 20, search?: string) => {
    let query: any = { limit: String(limit), page: String(page) }
    if (search) query['search'] = search;

    let queryParams = new URLSearchParams(query).toString()
    return await http.get(parseRouteParams(endpoints.LOAD_RECENT_FILES, { queryParams }))
  },
  removeRecentFile: async (fileId: string) => {
    return await http.delete(parseRouteParams(endpoints.DELETE_RECENT_FILE, { fileId }))
  }
}