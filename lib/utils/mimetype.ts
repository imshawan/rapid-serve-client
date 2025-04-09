/**
 * @fileoverview MIME Type Mapping Utility
 * 
 * @description This module provides a mapping of common file extensions to their respective MIME types.
 * It is used to determine the MIME type of a file based on its extension.
 * 
 * @author Shawan Mandal <github@imshawan.dev>
 */

type FileTypeCategory = "image" | "video" | "audio" | "document" | "archive" | "code" | "executable" | "other";

interface MimeTypeEntry {
  mime: string;
  type: FileTypeCategory;
}

const mimeTypeMap: Record<string, MimeTypeEntry> = {
  // Images
  jpg: { mime: "image/jpeg", type: "image" },
  jpeg: { mime: "image/jpeg", type: "image" },
  png: { mime: "image/png", type: "image" },
  gif: { mime: "image/gif", type: "image" },
  svg: { mime: "image/svg+xml", type: "image" },
  webp: { mime: "image/webp", type: "image" },
  bmp: { mime: "image/bmp", type: "image" },
  tiff: { mime: "image/tiff", type: "image" },

  // Videos
  mp4: { mime: "video/mp4", type: "video" },
  mov: { mime: "video/quicktime", type: "video" },
  avi: { mime: "video/x-msvideo", type: "video" },
  mkv: { mime: "video/x-matroska", type: "video" },
  flv: { mime: "video/x-flv", type: "video" },
  webm: { mime: "video/webm", type: "video" },

  // Audio
  mp3: { mime: "audio/mpeg", type: "audio" },
  wav: { mime: "audio/wav", type: "audio" },
  flac: { mime: "audio/flac", type: "audio" },
  aac: { mime: "audio/aac", type: "audio" },
  ogg: { mime: "audio/ogg", type: "audio" },

  // Documents
  pdf: { mime: "application/pdf", type: "document" },
  doc: { mime: "application/msword", type: "document" },
  docx: { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", type: "document" },
  xls: { mime: "application/vnd.ms-excel", type: "document" },
  xlsx: { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", type: "document" },
  ppt: { mime: "application/vnd.ms-powerpoint", type: "document" },
  pptx: { mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", type: "document" },
  txt: { mime: "text/plain", type: "document" },
  md: { mime: "text/markdown", type: "document" },

  // Archives
  zip: { mime: "application/zip", type: "archive" },
  rar: { mime: "application/x-rar-compressed", type: "archive" },
  tar: { mime: "application/x-tar", type: "archive" },
  "7z": { mime: "application/x-7z-compressed", type: "archive" },
  gz: { mime: "application/gzip", type: "archive" },
  bz2: { mime: "application/x-bzip2", type: "archive" },
  xz: { mime: "application/x-xz", type: "archive" },

  // Code files
  js: { mime: "text/javascript", type: "code" },
  jsx: { mime: "text/javascript", type: "code" },
  ts: { mime: "text/typescript", type: "code" },
  tsx: { mime: "text/typescript", type: "code" },
  json: { mime: "application/json", type: "code" },
  html: { mime: "text/html", type: "code" },
  css: { mime: "text/css", type: "code" },
  scss: { mime: "text/x-scss", type: "code" },
  less: { mime: "text/x-less", type: "code" },
  php: { mime: "application/x-httpd-php", type: "code" },
  py: { mime: "text/x-python", type: "code" },
  rb: { mime: "text/x-ruby", type: "code" },
  go: { mime: "text/x-go", type: "code" },
  rs: { mime: "text/x-rust", type: "code" },
  c: { mime: "text/x-c", type: "code" },
  cpp: { mime: "text/x-c++", type: "code" },
  java: { mime: "text/x-java-source", type: "code" },
  sh: { mime: "application/x-shellscript", type: "code" },
  bat: { mime: "application/x-msdos-program", type: "code" },
  yaml: { mime: "text/yaml", type: "code" },
  yml: { mime: "text/yaml", type: "code" },
  xml: { mime: "text/xml", type: "code" },
  sql: { mime: "text/x-sql", type: "code" },

  // Executables & System Files
  exe: { mime: "application/vnd.microsoft.portable-executable", type: "executable" },
  msi: { mime: "application/x-ms-installer", type: "executable" },
  dmg: { mime: "application/x-apple-diskimage", type: "executable" },
  app: { mime: "application/octet-stream", type: "executable" },
  pkg: { mime: "application/x-newton-compatible-pkg", type: "executable" },
  deb: { mime: "application/vnd.debian.binary-package", type: "executable" },
  rpm: { mime: "application/x-rpm", type: "executable" },
  appimage: { mime: "application/octet-stream", type: "executable" },
  iso: { mime: "application/x-iso9660-image", type: "executable" },
  lnk: { mime: "application/x-ms-shortcut", type: "executable" },

  // Default
  unknown: { mime: "application/octet-stream", type: "other" },
}

export const validFileCategories: FileTypeCategory[] = ["image", "video", "audio", "document", "archive", "code", "executable", "other"]

/**
 * Get the MIME type of a file based on its extension.
 *
 * @param fileName - The name of the file, including its extension.
 * @returns {string} The corresponding MIME type if found, otherwise "application/octet-stream".
 */
export const getMimeType = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "unknown";
  return mimeTypeMap[extension]["mime"] || "application/octet-stream";
};

/**
 * Get the general file type (e.g., image, video, audio, document).
 *
 * @param fileName - The name of the file, including its extension.
 * @returns {string} A general category like "image", "video", "audio", "document", "code", "archive", or "other".
 */
export const getFileCategory = (fileName: string): FileTypeCategory => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "unknown";
  return mimeTypeMap[extension]["type"] || "other";
};