"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TFile } from "@/store/slices/files"
import FileIcon from "@/components/dashboard/file-icon"
import { Preview } from "./preview"

interface FilePreviewProps {
  file: TFile | null
  isOpen: boolean
  onClose: () => void
  onDownload: (fileId: string) => void
}

export function FilePreview({ file, isOpen, onClose, onDownload }: FilePreviewProps) {
  if (!file) return null

  return (
    <Dialog modal={true} open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] h-[100vh] overflow-hidden flex flex-col" onPointerDownOutside={(event) => event.preventDefault()}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileIcon fileName={file.fileName} fileType={file.type} className="w-5 h-5" outerClassName="p-1" />
            <span className="truncate max-w-[250px] sm:max-w-[400px]">{file.fileName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-[400px] overflow-auto border rounded-md mt-2 bg-muted/20">
          <Preview file={file} onDownload={onDownload} />
        </div>
      </DialogContent>
    </Dialog>
  )
}