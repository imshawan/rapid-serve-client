import { File } from "@/lib/models/upload";
import FileIcon from "../file-icon";
import { Download, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  file: File;
  onDownload: (fileId: string) => void;
  onRetry?: () => void;
  errorMessage?: string;
}

export function PreviewError({ file, onDownload, onRetry, errorMessage }: ErrorProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900 rounded-lg border border-red-300 dark:border-red-700 shadow-sm">
      <FileIcon fileName={file.fileName} fileType={file.type} className="w-16 h-16 text-red-700 dark:text-red-300" outerClassName="bg-red-500/10" />
      <h2 className="mt-3 text-lg font-semibold text-red-700 dark:text-red-300">
        Error Loading File
      </h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
        {errorMessage || "An unexpected error occurred while processing this file."}
      </p>

      <div className="mt-4 flex items-center gap-3">
        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            <RotateCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}
        <Button variant="outline" onClick={() => onDownload(file.fileId)}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
}
