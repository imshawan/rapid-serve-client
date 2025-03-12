import { File } from "@/lib/models/upload";
import FileIcon from "../file-icon";

interface PreviewLoadingProps {
  file: File
  progress?: number
  message?: string
}

export function FilePreviewLoading({ file, progress, message }: PreviewLoadingProps) {
  return (
    <div className="flex flex-col justify-center h-full p-6 items-center text-center">
      <div className="relative flex items-center justify-center">
        <FileIcon fileName={file.fileName} fileType={file.type} className="w-16 h-16" />
      </div>

      <p className="mt-3 text-sm text-muted-foreground animate-fadeIn">
        {progress && progress === 100 ? "Loading metadata..." : message}
      </p>

      {progress ? (
        <div className="w-40 sm:w-80 mt-3 h-1.5 bg-muted/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
    </div>
  )
}