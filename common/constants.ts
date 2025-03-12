/**
 * @fileoverview Configuration Constants for File Handling
 * 
 * These constants define the maximum allowed sizes for file processing and 
 * specify the file types eligible for preview in different categories.
 * 
 * @author Shawan Mandal <github@imshawan.dev>
 */

/// **Maximum chunk size for file processing (4MB per chunk)**
export const MAX_CHUNK_SIZE = 1024 * 1024 * 4; // 4MB

/// **Maximum file size allowed for previewing (15MB limit)**
export const MAX_PREVIEW_FILE_SIZE = 1024 * 1024 * 15; // 15MB

/**
 * List of allowed image file extensions for preview.
 * Includes common image formats such as JPEG, PNG, GIF, and SVG.
 */
export const ALLOWED_PREVIEW_IMAGE_EXTENSIONS = [
  "jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "ico", "tiff", "tif"
];

/**
 * List of allowed text file extensions for preview.
 * Covers basic text formats, including markdown, JSON, and code files.
 */
export const ALLOWED_PREVIEW_TEXT_EXTENSIONS = [
  "txt", "md", "json", "html", "css", "js", "ts"
];

/**
 * List of allowed video file extensions for preview.
 * Supports common video formats such as MP4, WebM, and MKV.
 */
export const ALLOWED_PREVIEW_VIDEO_EXTENSIONS = [
  "mp4", "webm", "mkv", "avi"
];

/**
 * List of allowed audio file extensions for preview.
 * Includes popular audio formats like MP3, WAV, and OGG.
 */
export const ALLOWED_PREVIEW_AUDIO_EXTENSIONS = [
  "mp3", "wav", "ogg", "flac", "aac", "m4a"
];

/**
 * List of allowed PDF file extensions for preview.
 * Currently supports only the standard PDF format.
 */
export const ALLOWED_PREVIEW_PDF_EXTENSIONS = ["pdf"];
