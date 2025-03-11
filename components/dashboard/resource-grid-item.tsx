import { formatBytes } from "@/lib/utils/common";
import { Download, Share2, Trash2, Eye } from "lucide-react";
import { Button } from "../ui/button";
import FileIcon from "./file-icon";
import { Card } from "../ui/card";
import { TFile } from "@/store/slices/files";
import { useFiles } from "@/hooks/use-files";
import { useToast } from "@/hooks/use-toast";
import { Fragment, useState } from "react";
import { DeleteConfirmationDialog } from "../ui/delete-confirmation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { FilePreview } from "./file-preview";
import { ResourceContextMenu } from "./resource-context-menu";
interface ResourceGridItemProps {
  file: TFile;
  onToggleStar: (fileId: string) => void;
  onOpenMenu: (fileId: string, e: React.MouseEvent) => void;
}

export function ResourceGridItem({ file, onToggleStar, onOpenMenu }: ResourceGridItemProps) {
  const [metaLoading, setMetaLoading] = useState("")
  const [deleting, setDeleting] = useState("")
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; fileId: string | null, fileName: string | null }>({
    isOpen: false,
    fileId: null,
    fileName: null
  })
  const { toast } = useToast()
  const {
    loading,
    loadFileMeta,
    setDownloadOpen,
    deleteFile,
    appendUpdatedFile,
    setFileInfoDialog,
    setPreviewDialog,
    setRenameDialog,
    setShareDialog,
    renameFile,
    previewOpen,
    setFileLoadingState,
    fileLoading
  } = useFiles();

  const handleShare = (fileName: string, fileId: string) => {
    setShareDialog({ isOpen: true, fileName, fileId })
  }

  const handleFileInfo = (file: TFile) => {
    setFileInfoDialog({ isOpen: true, file })
  }

  const handleRename = (file: TFile) => {
    setRenameDialog({ isOpen: true, file })
  }

  const handlePreview = (file: TFile) => {
    setPreviewDialog({ isOpen: true, file })
  }

  const handleDownload = (fileId: string) => {
    setFileLoadingState(fileId)
    loadFileMeta(fileId, () => {
      setDownloadOpen(true)
      setFileLoadingState("")
    }, () => {
      setFileLoadingState("")
    })
  }

  const handleDelete = (fileId: string, fileName: string) => {
    setDeleteConfirmation({ isOpen: true, fileId, fileName })
  }

  const confirmDelete = () => {
    if (deleteConfirmation.fileId) {
      setDeleting(deleteConfirmation.fileId)
      deleteFile(deleteConfirmation.fileId, () => {
        toast({
          title: "File moved to trash",
          description: deleteConfirmation.fileName + " has been moved to the trash bin."
        })
        setDeleteConfirmation({ isOpen: false, fileId: null, fileName: null })
      },
        () => setDeleting("")
      )
    }
  }

  const confirmRename = (fileId: string, newName: string) => {
    renameFile(fileId, newName, () => {
      toast({
        title: "File renamed",
        description: `File has been renamed to "${newName}".`
      })
    },
    () => { })
  }

  return (
    <Fragment>
      <ResourceContextMenu file={file}
        onPreview={handlePreview}
        onToggleStar={onToggleStar}
        onShare={handleShare}
        onRename={handleRename}
        onDelete={handleDelete}
        onDownload={handleDownload}
        onFileInfo={handleFileInfo}
      >
        <Card key={file.fileId} className="p-4 hover:shadow-lg transition-shadow group relative w-full mx-auto">
          {/* Overlay Loader */}
          {(file.isUploading || fileLoading === file.fileId) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-black/50 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          )}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative group/icon">
              <FileIcon fileName={file.fileName} fileType={file.type} />
              {file.type !== "folder" && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover/icon:opacity-100 transition-opacity">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-white hover:bg-transparent hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreview(file)
                          }}
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Preview file</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
            <div className="text-sm font-medium truncate w-full text-center">{file.fileName}</div>
            <div className="text-xs text-muted-foreground">{formatBytes(file.fileSize)}</div>
            <div className="flex space-x-2">
              <Button size="icon" variant="ghost" onClick={() => handleDownload(file.fileId)}>
                {(metaLoading === file.fileId) ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100"></div>
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleShare(file.fileName, file.fileId)}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive"
                onClick={() => handleDelete(file.fileId, file.fileName)}
                disabled={deleting === file.fileId}
              >
                {(deleting === file.fileId) ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100"></div>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>

      </ResourceContextMenu>
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog confirmation={deleteConfirmation} setConfirmation={setDeleteConfirmation} onDeleteConfirm={confirmDelete} />

      {/* File Preview */}
      <FilePreview
        file={previewOpen.file}
        isOpen={previewOpen.isOpen}
        onClose={() => setPreviewDialog({ isOpen: false, file: null })}
        onDownload={handleDownload}
      />

    </Fragment>
  )
}