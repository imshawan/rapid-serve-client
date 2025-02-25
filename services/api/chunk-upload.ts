import { http } from "@/lib/api/http";
import { endpoints } from "./endpoints";
import { parseRouteParams } from "@/lib/utils/common";

export const uploader = {
    register: async (payload: { fileName: string; fileSize: string; chunkHashes: string[] }) => {
        return await http.post<FileUploadStatus>(endpoints.METADATA_REGISTER, payload) as ApiResponse<FileUploadStatus>
    },

    upload: async (payload: { params: { token: string, fileId: string, hash: string }, chunk: FormData }) => {
        return await http.post(parseRouteParams(endpoints.CHUNK_UPLOAD, payload.params), payload.chunk, {}, true)
    },

    markComplete: async (fileId: string) => {
        return await http.post(endpoints.UPLOAD_COMPLETE, {fileId})
    }
}