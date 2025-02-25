import { http } from "@/lib/api/http"
import { endpoints } from "./endpoints"
import { parseRouteParams } from "@/lib/utils/common"


export const files = {
  fetchFiles: async (page: number, limit: number = 20, fields?: string[]) => {
    let queryParams = new URLSearchParams({ limit: String(limit), page: String(page) }).toString()
    return await http.get(parseRouteParams(endpoints.LOAD_FILES, {queryParams}))
  }
}