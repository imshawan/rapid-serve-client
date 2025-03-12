import { File } from "@/lib/models/upload";
import FileIcon from "../file-icon";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnknownProps {
  file: File
  onDownload: (fileId: string) => void
}

export default function Unknown({ file, onDownload }: UnknownProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <FileIcon fileName={file.fileName} fileType={file.type} className="w-16 h-16" />
      <p className="mt-4 text-center">Preview not available for this file type</p>
      <Button variant="outline" className="mt-2" onClick={() => onDownload(file.fileId)}>
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
    </div>
  )
}