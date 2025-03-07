import { formatBytes } from "@/lib/utils/common";
import { Star, MoreVertical, Download, Share2, Trash2 } from "lucide-react";
import { TableCell, TableRow, } from "@/components/ui/table"
import { Button } from "../ui/button";
import FileIcon from "./file-icon";
import { TFile } from "@/store/slices/files";
import { useFiles } from "@/hooks/use-files";
import { useToast } from "@/hooks/use-toast";
import { Fragment, useState } from "react";
import { DeleteConfirmationDialog } from "../ui/delete-confirmation";
import { ShareDialog } from "../ui/share-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ResourceContextMenu } from "./resource-context-menu";
import { FilePreview } from "./file-preview";


interface ResourceGridItemProps {
  file: TFile;
  onToggleStar: (fileId: string) => void;
  onOpenMenu: (fileId: string, e: React.MouseEvent) => void;
}

export function ResourceListItem({ file, onToggleStar, onOpenMenu }: ResourceGridItemProps) {
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
    shareOpen,
    previewOpen,
    loadFileMeta,
    setDownloadOpen,
    deleteFile,
    appendUpdatedFile,
    setFileInfoDialog,
    setPreviewDialog,
    setRenameDialog,
    setShareDialog,
    fileLoading
  } = useFiles();

  const handleShare = (fileName: string, fileId: string) => {
    setShareDialog({ isOpen: true, fileName, fileId })
  }

  const handleDownload = (fileId: string) => {
    setMetaLoading(fileId)
    loadFileMeta(fileId, () => {
      setDownloadOpen(true)
      setMetaLoading("")
    }, () => {
      setMetaLoading("")
    })
  }

  const handleDelete = (fileId: string, fileName: string) => {
    setDeleteConfirmation({ isOpen: true, fileId, fileName })
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
        <TableRow key={file.fileId} className="group">
          <TableCell className="p-2">
            <div className="flex items-center gap-2">
              <FileIcon fileName={file.fileName} fileType={file.type} className="w-5 h-5" outerClassName="p-2" />
              <span className="font-medium truncate">{file.fileName}</span>
            </div>
          </TableCell>
          <TableCell className="p-2">{formatBytes(file.fileSize)}</TableCell>
          <TableCell className="p-2">{new Date(file.updatedAt).toLocaleDateString()}</TableCell>
          <TableCell className="col-span-1 p-2">
            <div className=" flex items-center justify-center gap-1">
              <button
                className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-background transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  // onToggleStar(folder.fileId)
                }}
              >
                <Star className={`h-4 w-4 ${file.isStarred ? "fill-yellow-400 text-yellow-400" : "text-black-400"}`} />
              </button>
              <DropdownMenu>
                {((metaLoading || deleting || fileLoading) === file.fileId) ? (
                  <div className="animate-spin rounded-full ml-2 h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100"></div>
                ) : (
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                )}
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled={(metaLoading === file.fileId)} onClick={() => handleDownload(file.fileId)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare(file.fileName, file.fileId)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(file.fileId, file.fileName)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TableCell>
        </TableRow>
      </ResourceContextMenu>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog confirmation={deleteConfirmation} setConfirmation={setDeleteConfirmation} onDeleteConfirm={confirmDelete} />

      <ShareDialog
        isOpen={shareOpen.isOpen}
        onClose={() => setShareDialog({ isOpen: false, fileName: "", fileId: "" })}
        fileName={shareOpen.fileName}
      />

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