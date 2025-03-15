/**
 * @fileoverview MIME Type Mapping Utility
 * 
 * @description This module provides a mapping of common file extensions to their respective MIME types.
 * It is used to determine the MIME type of a file based on its extension.
 * 
 * @author Shawan Mandal <github@imshawan.dev>
 */

const mimeTypeMap: Record<string, string> = {
  // Images
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
  bmp: "image/bmp",
  tiff: "image/tiff",

  // Videos
  mp4: "video/mp4",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  flv: "video/x-flv",
  webm: "video/webm",

  // Audio
  mp3: "audio/mpeg",
  wav: "audio/wav",
  flac: "audio/flac",
  aac: "audio/aac",
  ogg: "audio/ogg",

  // Documents
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  md: "text/markdown",

  // Archives
  zip: "application/zip",
  rar: "application/x-rar-compressed",
  tar: "application/x-tar",
  "7z": "application/x-7z-compressed",
  gz: "application/gzip",
  bz2: "application/x-bzip2",
  xz: "application/x-xz",

  // Code files
  js: "text/javascript",
  jsx: "text/javascript",
  ts: "text/typescript", 
  tsx: "text/typescript",
  json: "application/json",
  html: "text/html",
  css: "text/css",
  scss: "text/x-scss",
  less: "text/x-less",
  php: "application/x-httpd-php",
  py: "text/x-python",
  rb: "text/x-ruby",
  go: "text/x-go",
  rs: "text/x-rust",
  c: "text/x-c",
  cpp: "text/x-c++",
  java: "text/x-java-source",
  sh: "application/x-shellscript",
  bat: "application/x-msdos-program",
  yaml: "text/yaml",
  yml: "text/yaml",
  xml: "text/xml",
  sql: "text/x-sql",

  // Executables & System Files
  exe: "application/vnd.microsoft.portable-executable",
  msi: "application/x-ms-installer",
  dmg: "application/x-apple-diskimage",
  app: "application/octet-stream",
  pkg: "application/x-newton-compatible-pkg",
  deb: "application/vnd.debian.binary-package",
  rpm: "application/x-rpm",
  appimage: "application/octet-stream",
  iso: "application/x-iso9660-image",
  lnk: "application/x-ms-shortcut",

  // Default
  unknown: "application/octet-stream",
};

/**
 * Get the MIME type of a file based on its extension.
 *
 * @param fileName - The name of the file, including its extension.
 * @returns {string} The corresponding MIME type if found, otherwise "application/octet-stream".
 */
export const getMimeType = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "unknown";
  return mimeTypeMap[extension] || "application/octet-stream";
};
