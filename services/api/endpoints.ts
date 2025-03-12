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
  LOAD_RECENT_FILES: "/api/files/recents/list?{{queryParams}}",
  DOWNLOAD_FILE: "/api/download/{{fileId}}",
  DOWNLOAD_CHUNK: "/api/download/{{fileId}}/{{hash}}?token={{token}}",
  RENAME_FILE: "/api/files/{{fileId}}",
  DELETE_FILE: "/api/files/{{fileId}}",
  DELETE_FILE_PERMANENTLY: "/api/files/trash/{{fileId}}/clear",
  DELETE_ALL_FILES_PERMANENTLY: "/api/files/trash/clear",
  RESTORE_FILE: "/api/files/{{fileId}}/restore",
  DELETE_RECENT_FILE: "/api/files/recents/{{fileId}}",
  SHARE_FILE: "/api/files/share",
  LOAD_SHARED_FILE: "/api/files/shared/{{fileId}}",
  LOAD_SHARED_FILES: "/api/files/shared/list?{{queryParams}}",

  LOAD_PREVIEW: "/api/files/preview/{{fileId}}",
}