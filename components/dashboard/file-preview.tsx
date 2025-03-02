"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TFile } from "@/store/slices/files"
import FileIcon from "@/components/dashboard/file-icon"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FilePreviewProps {
  file: TFile | null
  isOpen: boolean
  onClose: () => void
  onDownload: (fileId: string) => void
}

export function FilePreview({
  file,
  isOpen,
  onClose,
  onDownload,
}: FilePreviewProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  if (!file) return null
  
  const fileExtension = file.fileName.split(".").pop()?.toLowerCase() || ""
  const isImage = ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(fileExtension)
  const isText = ["txt", "md", "json", "html", "css", "js", "ts"].includes(fileExtension)
  const isPdf = fileExtension === "pdf"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileIcon fileName={file.fileName} fileType={file.type} className="w-5 h-5" outerClassName="p-1" />
            <span className="truncate max-w-[300px]">{file.fileName}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-[400px] overflow-auto border rounded-md mt-2 bg-muted/20">
          {isImage ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img 
                src={`https://source.unsplash.com/random/800x600?${file.fileName.split(".")[0]}`} 
                alt={file.fileName}
                className="max-w-full max-h-[400px] object-contain"
              />
            </div>
          ) : isText ? (
            <div className="w-full h-full p-4 overflow-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {`This is a preview of ${file.fileName}.\n\nFile content would appear here in a real application.\n\n${Array(20).fill(`Sample content for ${file.fileName}`).join("\n")}`}
              </pre>
            </div>
          ) : isPdf ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <FileIcon fileName={file.fileName} fileType={file.type} className="w-16 h-16" />
              <p className="mt-4 text-center">PDF preview not available</p>
              <Button variant="outline" className="mt-2" onClick={() => onDownload(file.fileId)}>
                <Download className="mr-2 h-4 w-4" />
                Download to view
              </Button>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <FileIcon fileName={file.fileName} fileType={file.type} className="w-16 h-16" />
              <p className="mt-4 text-center">Preview not available for this file type</p>
              <Button variant="outline" className="mt-2" onClick={() => onDownload(file.fileId)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}