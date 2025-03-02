"use client"

import { useState, useEffect, Fragment } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Upload, Grid, List, FileText, FolderPlus, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useInView } from "react-intersection-observer"
import { UploadDialog } from "@/components/upload-dialog"
import { Download as DownloadDialog } from "@/components/download"
import { useFiles } from "@/hooks/use-files"
import { NoFilesState } from "@/components/dashboard/no-files"
import { CreateFolderDialog } from "@/components/create-folder-dialog"
import { File } from "@/lib/models/upload"
import { ResourceGridItem } from "@/components/dashboard/resource-grid-item"
import { ResourceListItem } from "@/components/dashboard/resource-list-item"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu"
import { ShareDialog } from "@/components/ui/share-dialog"
import { FileInfoModal } from "@/components/dashboard/file-info-dialog"
import { RenameDialog } from "@/components/dashboard/rename-dialog"
import { FilePreview } from "@/components/dashboard/file-preview"
import { TFile } from "@/store/slices/files"

export default function DashboardPage() {
  const [uploadModal, setUploadModal] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const { toast } = useToast()
  const { files, loading, hasMore, currentPage, loadFiles, appendUpdatedFile, setFileInfoDialog,
    setPreviewDialog,
    setRenameDialog,
    setShareDialog,
    renameOpen,
    previewOpen,
    shareOpen,
    fileInfoOpen,
    deleteOpen,
    setDeleteDialog,
    deleteFile,
   } = useFiles()
  const { ref, inView } = useInView()

  const handleCreateFolder = () => {
    setCreateFolderOpen(true)
  }

  const handleViewModeChange  = (mode: "grid" | "list") => {
    setViewMode(mode)
    closeAllDialogs()
  }

  const closeAllDialogs = () => {
    setPreviewDialog({ isOpen: false, file: null })
    setRenameDialog({ isOpen: false, file: null })
    setShareDialog({ isOpen: false, fileName: "" })
    setFileInfoDialog({ isOpen: false, file: null })
  }

  const handleRefresh = () => {
    loadFiles({ currentPage, limit: 10 })
  }

  const createFolder = (name: string) => {
    const newFolder = {
      fileId: crypto.randomUUID(),
      fileName: name,
      fileSize: 0,
      isStarred: false,
      type: "folder",
      status: "complete",
      parentId: "", // Root level folder
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    appendUpdatedFile(newFolder as File)

    toast({
      title: "Folder created",
      description: `"${name}" has been created successfully.`,
    })
  }

  const confirmRename = (fileId: string, newName: string) => {
    // renameFile(fileId, newName, () => {
    //   toast({
    //     title: "File renamed",
    //     description: `File has been renamed to "${newName}".`
    //   })
    // })
    toast({
      title: "File renamed",
      description: `File has been renamed to "${newName}".`
    })
  }

  useEffect(() => {
    loadFiles({ currentPage, limit: 10 })
  }, [])

  // useEffect(() => {
  //   if (inView && hasMore && !loading) {
  //     // dispatch(fetchFiles(currentPage))
  //     loadFiles({currentPage, limit: 10})
  //   }
  // }, [inView, hasMore, loading, dispatch])

  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
      {files.map((file) => <ResourceGridItem key={file.fileId} file={file} onToggleStar={() => { }} onOpenMenu={() => { }} />)}
    </div>
  )

  const ListView = () => (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Modified</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => <ResourceListItem key={file.fileId} file={file} onToggleStar={() => { }} onOpenMenu={() => { }} />)}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <Fragment>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="space-y-6 h-full">
            <div className="flex justify-between items-center">
              <div className="">
                <h1 className="text-3xl font-bold">Your Files</h1>
                <p className="text-muted-foreground">Manage and organize your workspace</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => handleViewModeChange("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => handleViewModeChange("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={() => setUploadModal(true)}>
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:block ml-2">Upload File</span>
                </Button>
              </div>
            </div>

            {files.length > 0 ? (viewMode === "grid" ? <GridView /> : <ListView />) : (
              loading ? (
                <div className="flex justify-center p-4 h-[calc(100vh-400px)] items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : <NoFilesState onUpload={() => setUploadModal(true)} onCreateFolder={handleCreateFolder} />
            )}

            {/* Intersection Observer target */}
            <div ref={ref} className="h-10" />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem onClick={handleCreateFolder} className="cursor-pointer">
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setUploadModal(true)} className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleRefresh} className="cursor-pointer">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {/* Upload Dialog */}
      <UploadDialog open={uploadModal} setOpen={setUploadModal} />

      {/* Create Folder Dialog */}
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        onCreateFolder={createFolder}
      // existingFolderNames={folders.map(f => f.fileName)}
      />
      <DownloadDialog />

      <ShareDialog
        isOpen={shareOpen.isOpen}
        onClose={() => setShareDialog({ isOpen: false, fileName: "" })}
        fileName={shareOpen.fileName}
      />

      {/* File Info Modal */}
      <FileInfoModal
        file={fileInfoOpen.file}
        isOpen={fileInfoOpen.isOpen}
        onClose={() => setFileInfoDialog({ isOpen: false, file: null })}
      />

      {/* Rename Dialog */}
      <RenameDialog
        file={renameOpen.file}
        isOpen={renameOpen.isOpen}
        onClose={() => setRenameDialog({ isOpen: false, file: null })}
        onRename={confirmRename}
        existingNames={[]}
      />
     
    </Fragment>
  )
}