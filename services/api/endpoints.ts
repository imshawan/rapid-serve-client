export const endpoints = {
  LOG_IN: "/api/auth/login",
  LOG_OUT: "/api/auth/logout",
  REGISTER: "/api/user/register",
  USER_PROFILE: "/api/user/profile",
  PROFILE_PICTURE_UPDATE: "/api/user/profile-picture",

  METADATA_REGISTER: "/api/upload/chunk/register",
  CHUNK_UPLOAD: "/api/upload/chunk/{{fileId}}/{{hash}}?token={{token}}",
  UPLOAD_COMPLETE: "/api/upload/complete",

  LOAD_FILES: "/api/files/list?{{queryParams}}",
  DOWNLOAD_FILE: "/api/download/{{fileId}}",
  DOWNLOAD_CHUNK: "/api/download/{{fileId}}/{{hash}}?token={{token}}",
  RENAME_FILE: "/api/files/{{fileId}}",
  DELETE_FILE: "/api/files/{{fileId}}",
  DELETE_FILE_PERMANENTLY: "/api/files/trash/{{fileId}}/clear",
  DELETE_ALL_FILES_PERMANENTLY: "/api/files/trash/clear",
  RESTORE_FILE: "/api/files/{{fileId}}/restore",
}