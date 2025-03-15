import { cn, formatBytes, timeAgo } from "@/lib/utils/common";
import { Download, Share2, Trash2, Eye, Star, MoreVertical, FolderOpen, Edit } from "lucide-react";
import { Button } from "../ui/button";
import FileIcon from "./file-icon";
import { Card } from "../ui/card";
import { TFile } from "@/store/slices/files";
import { useFiles } from "@/hooks/use-files";
import { useToast } from "@/hooks/use-toast";
import { Fragment, useState } from "react";
import { useRouter } from "next/navigation"
import { DeleteConfirmationDialog } from "../ui/delete-confirmation";
import { ResourceContextMenu } from "./resource-context-menu";
import { File } from "@/lib/models/upload";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
interface ResourceGridItemProps {
  file: TFile & File;
  onToggleStar: (fileId: string) => void;
  onOpenMenu: (fileId: string, e: React.MouseEvent) => void;
}

export function ResourceGridItem({ file, onToggleStar, onOpenMenu }: ResourceGridItemProps) {
  const [deleting, setDeleting] = useState("")
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; fileId: string | null, fileName: string | null }>({
    isOpen: false,
    fileId: null,
    fileName: null
  })
  const { toast } = useToast()
  const router = useRouter()
  const {
    loadFileMeta,
    setDownloadOpen,
    deleteFile,
    setFileInfoDialog,
    setRenameDialog,
    setShareDialog,
    setFileLoadingState,
    setCurrentProcessingFile,
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
    router.push(["/", file.type, "/", file.fileId].join(""))
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
      setCurrentProcessingFile({...file, isDeleting: true})
      setDeleting(deleteConfirmation.fileId)
      deleteFile(deleteConfirmation.fileId, () => {
        setCurrentProcessingFile({...file, isDeleted: true})
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
        <Card key={file.fileId} className={
          cn("p-4 hover:shadow-lg transition-shadow group relative w-full mx-auto",
            file.type === 'folder'
              ? "hover:bg-blue-100/20 dark:hover:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
              : "bg-card hover:bg-muted/30 border",
          )
        }>
          {/* Overlay Loader */}
          {(file.isUploading || fileLoading === file.fileId || deleting === file.fileId) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-black/50 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          )}
          <div className="absolute top-2 right-2 flex space-x-1 z-[1]">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full",
                file.isStarred ? "opacity-100" : "opacity-0",
                "group-hover:opacity-100 transition-opacity",
                file.type === "folder" && "hover:bg-blue-100 dark:hover:bg-blue-950/30"
              )}
              disabled={( deleting || fileLoading) === file.fileId}
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(file.fileId);
              }}
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  file.isStarred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                )}
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={(deleting || fileLoading) === file.fileId} className={cn(
                  "h-8 w-8 rounded-full opacity-0 hover:opacity-100",
                  "group-hover:opacity-100 transition-opacity",
                  file.type === "folder" && "hover:bg-blue-100 dark:hover:bg-blue-950/30"
                )}>
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handlePreview(file)}>
                  {file.type === "folder" ? (
                    <Fragment>
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Open
                    </Fragment>
                  ) : (
                    <Fragment>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Fragment>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStar(file.fileId)}>
                  <Star className={`mr-2 h-4 w-4 ${file.isStarred ? "fill-yellow-400 text-yellow-400" : ""}`} />
                  {file.isStarred ? "Remove from Starred" : "Add to Starred"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare(file.fileName, file.fileId)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={(fileLoading === file.fileId)} onClick={() => handleDownload(file.fileId)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRename(file)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Rename
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

          <div className={cn(
            "mb-4 flex items-center justify-center h-32 w-full rounded-lg",
            file.type === 'folder' ? "bg-blue-100/50 dark:bg-blue-900/20" : "bg-secondary"
          )}>
            {file.thumbnail ? (
              <div className="relative w-full h-full rounded-md overflow-hidden">
                <img
                  src={file.thumbnail}
                  alt={file.fileName}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full relative group group/icon">
                <FileIcon fileName={file.fileName} fileType={file.type} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 rounded-full h-14 w-14 flex items-center justify-center opacity-0 group-hover/icon:opacity-100 transition-opacity blur-[0.5px]">
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
                        <TooltipContent side="top">{file.type === "folder" ? "Open Folder" : "Preview File"}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-full">
            <h3 className="font-medium text-sm truncate max-w-full" title={file.fileName}>
              {file.fileName}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {file.type !== 'folder' ? formatBytes(file.fileSize) : `${file.items} items`} • {timeAgo(file.updatedAt)}
            </p>
          </div>
        </Card>

      </ResourceContextMenu>
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog confirmation={deleteConfirmation} setConfirmation={setDeleteConfirmation} onDeleteConfirm={confirmDelete} />

    </Fragment>
  )
}