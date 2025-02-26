"use client";

import { 
  File, Folder, Image, Video, FileText, FileArchive, FileCode, 
  FileSpreadsheet, FileAudio, FileSymlink, FileBox, FileWarning,
} from "lucide-react";
import { JSX } from "react";

interface FileIconProps {
  fileName: string;
  fileType: string; // "folder" or "file"
}

const FileIcon: React.FC<FileIconProps> = ({ fileName, fileType }) => {
  if (fileType === "folder") {
    return <Folder className="text-blue-500 w-10 h-10" />;
  }

  const extension = fileName.split(".").pop()?.toLowerCase();

  // Map extensions to icons
  const iconMap: Record<string, JSX.Element> = {
    "jpg": <Image className="text-green-500 w-10 h-10" />,
    "jpeg": <Image className="text-green-500 w-10 h-10" />,
    "png": <Image className="text-green-500 w-10 h-10" />,
    "gif": <Image className="text-green-500 w-10 h-10" />,
    "svg": <Image className="text-green-500 w-10 h-10" />,
    "webp": <Image className="text-green-500 w-10 h-10" />,
    "bmp": <Image className="text-green-500 w-10 h-10" />,
    "tiff": <Image className="text-green-500 w-10 h-10" />,

    "mp4": <Video className="text-red-500 w-10 h-10" />,
    "mov": <Video className="text-red-500 w-10 h-10" />,
    "avi": <Video className="text-red-500 w-10 h-10" />,
    "mkv": <Video className="text-red-500 w-10 h-10" />,
    "flv": <Video className="text-red-500 w-10 h-10" />,
    "webm": <Video className="text-red-500 w-10 h-10" />,

    "mp3": <FileAudio className="text-purple-500 w-10 h-10" />,
    "wav": <FileAudio className="text-purple-500 w-10 h-10" />,
    "flac": <FileAudio className="text-purple-500 w-10 h-10" />,
    "aac": <FileAudio className="text-purple-500 w-10 h-10" />,
    "ogg": <FileAudio className="text-purple-500 w-10 h-10" />,

    "pdf": <FileText className="text-red-600 w-10 h-10" />,
    "doc": <FileText className="text-blue-700 w-10 h-10" />,
    "docx": <FileText className="text-blue-700 w-10 h-10" />,
    "xls": <FileSpreadsheet className="text-green-600 w-10 h-10" />,
    "xlsx": <FileSpreadsheet className="text-green-600 w-10 h-10" />,
    "ppt": <FileText className="text-orange-600 w-10 h-10" />,
    "pptx": <FileText className="text-orange-600 w-10 h-10" />,
    "txt": <FileText className="text-gray-500 w-10 h-10" />,
    "md": <FileText className="text-gray-500 w-10 h-10" />,

    "zip": <FileArchive className="text-orange-500 w-10 h-10" />,
    "rar": <FileArchive className="text-orange-500 w-10 h-10" />,
    "tar": <FileArchive className="text-orange-500 w-10 h-10" />,
    "7z": <FileArchive className="text-orange-500 w-10 h-10" />,
    "gz": <FileArchive className="text-orange-500 w-10 h-10" />,
    "bz2": <FileArchive className="text-orange-500 w-10 h-10" />,
    "xz": <FileArchive className="text-orange-500 w-10 h-10" />,

    "js": <FileCode className="text-yellow-500 w-10 h-10" />,
    "ts": <FileCode className="text-blue-500 w-10 h-10" />,
    "json": <FileCode className="text-gray-500 w-10 h-10" />,
    "html": <FileCode className="text-orange-500 w-10 h-10" />,
    "css": <FileCode className="text-blue-400 w-10 h-10" />,
    "php": <FileCode className="text-purple-400 w-10 h-10" />,
    "py": <FileCode className="text-blue-500 w-10 h-10" />,
    "c": <FileCode className="text-gray-500 w-10 h-10" />,
    "cpp": <FileCode className="text-gray-500 w-10 h-10" />,
    "java": <FileCode className="text-gray-500 w-10 h-10" />,
    "sh": <FileCode className="text-green-500 w-10 h-10" />,
    "bat": <FileCode className="text-gray-500 w-10 h-10" />,

    "exe": <FileBox className="text-gray-600 w-10 h-10" />, // Windows Executable
    "msi": <FileBox className="text-gray-600 w-10 h-10" />, // Windows Installer
    "dmg": <FileBox className="text-gray-600 w-10 h-10" />, // macOS Disk Image
    "app": <FileBox className="text-gray-600 w-10 h-10" />, // macOS App
    "pkg": <FileBox className="text-gray-600 w-10 h-10" />, // macOS Package
    "deb": <FileBox className="text-gray-600 w-10 h-10" />, // Linux Debian Package
    "rpm": <FileBox className="text-gray-600 w-10 h-10" />, // Linux RPM Package
    "appimage": <FileBox className="text-gray-600 w-10 h-10" />, // Linux AppImage
    "iso": <FileBox className="text-gray-600 w-10 h-10" />, // Disk Image
    "lnk": <FileSymlink className="text-gray-500 w-10 h-10" />, // Windows Shortcut

    // ⚠️ Unknown / Others
    "unknown": <FileWarning className="text-orange-400 w-10 h-10" />,
  };

  // Return the matched icon, or default file icon if not found
  return iconMap[extension || ""] || <File className="text-blue-500 w-10 h-10" />;
};

export default FileIcon;
