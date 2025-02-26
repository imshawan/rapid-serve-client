import { http } from "@/lib/api/http"
import { parseRouteParams } from "@/lib/utils/common"
import { endpoints } from "./endpoints"


export const downloader = {
    getFileMeta: async (fileId: string): Promise<ApiResponse<FileMetaResponse>> => {
        return await http.get<FileMetaResponse>(parseRouteParams(endpoints.DOWNLOAD_FILE, {fileId}))
    },
    getChunk: async (payload: { params: { token: string, fileId: string, hash: string }}) => {
        return await http.getFile(parseRouteParams(endpoints.DOWNLOAD_CHUNK, payload.params))
    }

}