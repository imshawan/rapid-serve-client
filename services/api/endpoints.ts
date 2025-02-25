export const endpoints = {
  LOG_IN: "/api/auth/login",
  LOG_OUT: "/api/auth/logout",
  REGISTER: "/api/user/register",
  USER_PROFILE: "/api/user/profile",
  PROFILE_PICTURE_UPDATE: "/api/user/profile-picture",

  METADATA_REGISTER: "/api/upload/chunk/register",
  CHUNK_UPLOAD: "/api/upload/chunk/{{fileId}}/{{hash}}?token={{token}}",
  UPLOAD_COMPLETE: "/api/upload/complete",
}