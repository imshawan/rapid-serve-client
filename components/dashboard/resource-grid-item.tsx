import { formatBytes } from "@/lib/utils/common";
import { Folder, Star, MoreVertical, Edit, Copy, Trash, Download, Share, FolderOpen, Share2, Trash2 } from "lucide-react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Button } from "../ui/button";
import FileIcon from "./file-icon";
import { Card } from "../ui/card";
import { TFile } from "@/store/slices/files";
import { useFiles } from "@/hooks/use-files";
import { useToast } from "@/hooks/use-toast";
import { Fragment, useState } from "react";
import { DeleteConfirmationDialog } from "../ui/delete-confirmation";


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
  const [shareDialog, setShareDialog] = useState<{ isOpen: boolean; fileName: string }>({
    isOpen: false,
    fileName: ""
  })
  const { toast } = useToast()
  const { files, loading, hasMore, currentPage, loadFiles, loadFileMeta, setDownloadOpen, deleteFile, appendUpdatedFile } = useFiles()

  const handleShare = (fileName: string) => {
    setShareDialog({ isOpen: true, fileName })
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
      <ContextMenu key={file.fileId}>
        <ContextMenuTrigger>
          <Card key={file.fileId} className="p-4 hover:shadow-lg transition-shadow relative w-full mx-auto">
            {/* Overlay Loader */}
            {file.isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-black/50 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
              </div>
            )}
            <div className="flex flex-col items-center space-y-2">
              <FileIcon fileName={file.fileName} fileType={file.type} />
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
                <Button size="icon" variant="ghost" onClick={() => handleShare(file.fileName)}>
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
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem className="cursor-pointer">
            <FolderOpen className="mr-2 h-4 w-4" />
            Open
          </ContextMenuItem>
          <ContextMenuItem className="cursor-pointer">
            <Star className={`mr-2 h-4 w-4 ${file.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            {file.isStarred ? 'Remove from Starred' : 'Add to Starred'}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem className="cursor-pointer">
            <Share className="mr-2 h-4 w-4" />
            Share
          </ContextMenuItem>
          <ContextMenuItem className="cursor-pointer">
            <Copy className="mr-2 h-4 w-4" />
            Make a Copy
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem className="cursor-pointer">
            <Trash className="mr-2 h-4 w-4" />
            Move to Trash
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog confirmation={deleteConfirmation} setConfirmation={setDeleteConfirmation} onDeleteConfirm={confirmDelete} />
    </Fragment>
  )
}