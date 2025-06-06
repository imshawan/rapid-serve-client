export const endpoints = {
  LOG_IN: "/api/auth/login",
  LOG_IN_GOOGLE: "/api/oauth/google",
  LOG_OUT: "/api/auth/logout",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: "/api/auth/reset-password",
  REGISTER: "/api/user/register",
  USER_PROFILE: "/api/user/profile",
  PROFILE_PICTURE_UPDATE: "/api/user/profile-picture",
  PLAN_DETAILS: "/api/user/plan",

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
  RESTORE_FILE: "/api/files/trash/{{fileId}}/restore",
  RESTORE_ALL_FILES: "/api/files/trash/restore-all",
  DELETE_RECENT_FILE: "/api/files/recents/{{fileId}}",
  SHARE_FILE: "/api/files/share",
  LOAD_SHARED_FILE: "/api/files/shared/{{fileId}}",
  LOAD_SHARED_FILES: "/api/files/shared/list?{{queryParams}}",

  STAR_FILE: "/api/files/star/{{fileId}}",

  LOAD_PREVIEW: "/api/files/preview/{{fileId}}",
  LOAD_FOLDER_CONTENTS: "/api/folders/{{folderId}}?{{queryParams}}",
  LOAD_NOTIFICATIONS: "/api/notifications?{{queryParams}}",
  MARK_NOTIFICATION_AS_READ: "/api/notifications/{{notificationId}}/read",
  MARK_NOTIFICATIONS_AS_READ: "/api/notifications/read",
  CREATE_FOLDER: "/api/folders",

  LOAD_ANALYTICS_OVERVIEW: "/api/user/analytics/overview"
}