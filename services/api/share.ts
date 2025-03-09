import { http } from "@/lib/api/http"
import { endpoints } from "./endpoints"
import { parseRouteParams } from "@/lib/utils/common"
import { Shared } from "@/lib/models/shared"

export const share = {
  new: async (data: { fileId: string, password?: string, accessLevel?: string, expirationDate?: string, email?: string }) => {
    return await http.post(parseRouteParams(endpoints.SHARE_FILE, data), data) as ApiResponse<{ fileId: string, shareableLink: string }>
  },
  fetchFile: async (fileId: string) => {
    return await http.get(parseRouteParams(endpoints.LOAD_SHARED_FILE, { fileId })) as ApiResponse<SharedFilePopulated & Shared & { sharableLink: string }>
  },
  fetchFiles: async (page: number, limit: number = 20, filter?: string, search?: string) => {
    let query: any = { limit: String(limit), page: String(page) }
    if (search) query['search'] = search;
    if (filter) query['filter'] = filter;

    let queryParams = new URLSearchParams(query).toString()
    return await http.get(parseRouteParams(endpoints.LOAD_SHARED_FILES, { queryParams })) as ApiResponse<Pagination>
  },
}