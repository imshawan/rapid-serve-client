/**
 * Enum representing various types of notifications that can be triggered within the system.
 * 
 * @enum {string}
 * @readonly
 * @property {string} FILE_UPLOADED - Notification for when a file is uploaded.
 * @property {string} FILE_DELETED - Notification for when a file is deleted.
 * @property {string} FILE_RENAMED - Notification for when a file is renamed.
 * @property {string} FILE_MOVED - Notification for when a file is moved.
 * @property {string} FILE_DOWNLOADED - Notification for when a file is downloaded.
 * @property {string} FILE_SHARED - Notification for when a file is shared.
 * @property {string} SHARE_EXPIRED - Notification for when a share has expired.
 * @property {string} ACCESS_GRANTED - Notification for when access is granted to a user.
 * @property {string} ACCESS_REVOKED - Notification for when access is revoked from a user.
 * @property {string} USER_INVITE - Notification for when a user is invited.
 * @property {string} USER_JOINED - Notification for when a user joins.
 * @property {string} COMMENT_ADDED - Notification for when a comment is added.
 * @property {string} MENTIONED_IN_COMMENT - Notification for when a user is mentioned in a comment.
 * @property {string} COLLABORATOR_REMOVED - Notification for when a collaborator is removed.
 * @property {string} LOGIN_ALERT - Notification for a login alert.
 * @property {string} PASSWORD_CHANGED - Notification for when a password is changed.
 * @property {string} STORAGE_LIMIT_REACHED - Notification for when the storage limit is reached.
 * @property {string} BILLING_ISSUE - Notification for a billing issue.
 * @property {string} TWO_FA_ENABLED - Notification for when two-factor authentication is enabled.
 * @property {string} CHUNK_PROCESSED - Notification for when a chunk is processed.
 * @property {string} STREAM_READY - Notification for when a stream is ready.
 * @property {string} THUMBNAIL_GENERATED - Notification for when a thumbnail is generated.
 */
export enum NotificationType {
  FILE_UPLOADED = "FILE_UPLOADED",
  FILE_DELETED = "FILE_DELETED",
  FILE_RENAMED = "FILE_RENAMED",
  FILE_MOVED = "FILE_MOVED",
  FILE_DOWNLOADED = "FILE_DOWNLOADED",

  FILE_SHARED = "FILE_SHARED",
  SHARE_EXPIRED = "SHARE_EXPIRED",
  ACCESS_GRANTED = "ACCESS_GRANTED",
  ACCESS_REVOKED = "ACCESS_REVOKED",

  USER_INVITE = "USER_INVITE",
  USER_JOINED = "USER_JOINED",
  COMMENT_ADDED = "COMMENT_ADDED",
  MENTIONED_IN_COMMENT = "MENTIONED_IN_COMMENT",
  COLLABORATOR_REMOVED = "COLLABORATOR_REMOVED",

  LOGIN_ALERT = "LOGIN_ALERT",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
  STORAGE_LIMIT_REACHED = "STORAGE_LIMIT_REACHED",
  BILLING_ISSUE = "BILLING_ISSUE",
  TWO_FA_ENABLED = "TWO_FA_ENABLED",

  CHUNK_PROCESSED = "CHUNK_PROCESSED",
  STREAM_READY = "STREAM_READY",
  THUMBNAIL_GENERATED = "THUMBNAIL_GENERATED",
}
