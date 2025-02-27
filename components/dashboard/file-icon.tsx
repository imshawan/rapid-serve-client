"use client"

import { cn } from "@/lib/utils/common"
import {
  File, Folder, Image, Video, FileText, FileArchive, FileCode,
  FileSpreadsheet, FileAudio, FileSymlink, FileBox, FileWarning,
} from "lucide-react"
import { JSX } from "react"

interface FileIconProps {
  fileName: string
  fileType: string // "folder" or "file"
  className?: string
}

const FileIcon: React.FC<FileIconProps> = ({ fileName, fileType, className }) => {
  if (fileType === "folder") {
    return (
      <div className="flex-shrink-0 p-3 rounded-full bg-blue-500/10">
        <Folder className={cn("text-blue-500 w-8 h-8", className)} />
      </div>
    )
  }

  const extension = fileName.split(".").pop()?.toLowerCase() || "unknown"

  // Map extensions to icons
  const iconMap: Record<string, JSX.Element> = {
    "jpg": <Image className={cn("text-green-500 w-8 h-8", className)} />,
    "jpeg": <Image className={cn("text-green-500 w-8 h-8", className)} />,
    "png": <Image className={cn("text-green-500 w-8 h-8", className)} />,
    "gif": <Image className={cn("text-green-500 w-8 h-8", className)} />,
    "svg": <Image className={cn("text-green-500 w-8 h-8", className)} />,
    "webp": <Image className={cn("text-green-500 w-8 h-8", className)} />,
    "bmp": <Image className={cn("text-green-500 w-8 h-8", className)} />,
    "tiff": <Image className={cn("text-green-500 w-8 h-8", className)} />,

    "mp4": <Video className={cn("text-red-500 w-8 h-8", className)} />,
    "mov": <Video className={cn("text-red-500 w-8 h-8", className)} />,
    "avi": <Video className={cn("text-red-500 w-8 h-8", className)} />,
    "mkv": <Video className={cn("text-red-500 w-8 h-8", className)} />,
    "flv": <Video className={cn("text-red-500 w-8 h-8", className)} />,
    "webm": <Video className={cn("text-red-500 w-8 h-8", className)} />,

    "mp3": <FileAudio className={cn("text-purple-500 w-8 h-8", className)} />,
    "wav": <FileAudio className={cn("text-purple-500 w-8 h-8", className)} />,
    "flac": <FileAudio className={cn("text-purple-500 w-8 h-8", className)} />,
    "aac": <FileAudio className={cn("text-purple-500 w-8 h-8", className)} />,
    "ogg": <FileAudio className={cn("text-purple-500 w-8 h-8", className)} />,

    "pdf": <FileText className={cn("text-red-600 w-8 h-8", className)} />,
    "doc": <FileText className={cn("text-blue-700 w-8 h-8", className)} />,
    "docx": <FileText className={cn("text-blue-700 w-8 h-8", className)} />,
    "xls": <FileSpreadsheet className={cn("text-green-600 w-8 h-8", className)} />,
    "xlsx": <FileSpreadsheet className={cn("text-green-600 w-8 h-8", className)} />,
    "ppt": <FileText className={cn("text-orange-600 w-8 h-8", className)} />,
    "pptx": <FileText className={cn("text-orange-600 w-8 h-8", className)} />,
    "txt": <FileText className={cn("text-gray-500 w-8 h-8", className)} />,
    "md": <FileText className={cn("text-gray-500 w-8 h-8", className)} />,

    "zip": <FileArchive className={cn("text-orange-500 w-8 h-8", className)} />,
    "rar": <FileArchive className={cn("text-orange-500 w-8 h-8", className)} />,
    "tar": <FileArchive className={cn("text-orange-500 w-8 h-8", className)} />,
    "7z": <FileArchive className={cn("text-orange-500 w-8 h-8", className)} />,
    "gz": <FileArchive className={cn("text-orange-500 w-8 h-8", className)} />,
    "bz2": <FileArchive className={cn("text-orange-500 w-8 h-8", className)} />,
    "xz": <FileArchive className={cn("text-orange-500 w-8 h-8", className)} />,

    "js": <FileCode className={cn("text-yellow-500 w-8 h-8", className)} />,
    "ts": <FileCode className={cn("text-blue-500 w-8 h-8", className)} />,
    "json": <FileCode className={cn("text-gray-500 w-8 h-8", className)} />,
    "html": <FileCode className={cn("text-orange-500 w-8 h-8", className)} />,
    "css": <FileCode className={cn("text-blue-400 w-8 h-8", className)} />,
    "php": <FileCode className={cn("text-purple-400 w-8 h-8", className)} />,
    "py": <FileCode className={cn("text-blue-500 w-8 h-8", className)} />,
    "c": <FileCode className={cn("text-gray-500 w-8 h-8", className)} />,
    "cpp": <FileCode className={cn("text-gray-500 w-8 h-8", className)} />,
    "java": <FileCode className={cn("text-gray-500 w-8 h-8", className)} />,
    "sh": <FileCode className={cn("text-green-500 w-8 h-8", className)} />,
    "bat": <FileCode className={cn("text-gray-500 w-8 h-8", className)} />,

    "exe": <FileBox className={cn("text-gray-600 w-8 h-8", className)} />,
    "msi": <FileBox className={cn("text-gray-600 w-8 h-8", className)} />,
    "dmg": <FileBox className={cn("text-gray-600 w-8 h-8", className)} />,
    "app": <FileBox className={cn("text-gray-600 w-8 h-8", className)} />,
    "pkg": <FileBox className={cn("text-gray-600 w-8 h-8", className)} />,
    "deb": <FileBox className={cn("text-gray-600 w-8 h-8", className)} />,
    "rpm": <FileBox className={cn("text-gray-600 w-8 h-8", className)} />,
    "appimage": <FileBox className={cn("text-gray-600 w-8 h-8", className)} />,
    "iso": <FileBox className={cn("text-gray-600 w-8 h-8", className)} />,
    "lnk": <FileSymlink className={cn("text-gray-500 w-8 h-8", className)} />,

    "unknown": <FileWarning className={cn("text-orange-400 w-8 h-8", className)} />,
  }

  // Map extensions to background colors
  const bgColorMap: Record<string, string> = {
    // Images
    "jpg": "bg-green-500/10",
    "jpeg": "bg-green-500/10",
    "png": "bg-green-500/10",
    "gif": "bg-green-500/10",
    "svg": "bg-green-500/10",
    "webp": "bg-green-500/10",
    "bmp": "bg-green-500/10",
    "tiff": "bg-green-500/10",

    // Videos
    "mp4": "bg-red-500/10",
    "mov": "bg-red-500/10",
    "avi": "bg-red-500/10",
    "mkv": "bg-red-500/10",
    "flv": "bg-red-500/10",
    "webm": "bg-red-500/10",

    // Audio
    "mp3": "bg-purple-500/10",
    "wav": "bg-purple-500/10",
    "flac": "bg-purple-500/10",
    "aac": "bg-purple-500/10",
    "ogg": "bg-purple-500/10",

    // Documents
    "pdf": "bg-red-600/10",
    "doc": "bg-blue-700/10",
    "docx": "bg-blue-700/10",
    "xls": "bg-green-600/10",
    "xlsx": "bg-green-600/10",
    "ppt": "bg-orange-600/10",
    "pptx": "bg-orange-600/10",
    "txt": "bg-gray-500/10",
    "md": "bg-gray-500/10",

    // Archives
    "zip": "bg-orange-500/10",
    "rar": "bg-orange-500/10",
    "tar": "bg-orange-500/10",
    "7z": "bg-orange-500/10",
    "gz": "bg-orange-500/10",
    "bz2": "bg-orange-500/10",
    "xz": "bg-orange-500/10",

    // Code files
    "js": "bg-yellow-500/10",
    "ts": "bg-blue-500/10",
    "json": "bg-gray-500/10",
    "html": "bg-orange-500/10",
    "css": "bg-blue-400/10",
    "php": "bg-purple-400/10",
    "py": "bg-blue-500/10",
    "c": "bg-gray-500/10",
    "cpp": "bg-gray-500/10",
    "java": "bg-gray-500/10",
    "sh": "bg-green-500/10",
    "bat": "bg-gray-500/10",

    // Executables & System Files
    "exe": "bg-gray-600/10",
    "msi": "bg-gray-600/10",
    "dmg": "bg-gray-600/10",
    "app": "bg-gray-600/10",
    "pkg": "bg-gray-600/10",
    "deb": "bg-gray-600/10",
    "rpm": "bg-gray-600/10",
    "appimage": "bg-gray-600/10",
    "iso": "bg-gray-600/10",
    "lnk": "bg-gray-500/10",

    // Unknown / Others
    "unknown": "bg-orange-400/10",
  }

  return (
    <div className={`flex-shrink-0 p-3 rounded-full ${bgColorMap[extension] || "bg-gray-200"}`}>
      {iconMap[extension] || <File className={cn("text-blue-500 w-10 h-10", className)} />}
    </div>
  )
}

export default FileIcon