"use client"

import { useState, useEffect, Fragment, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Upload, Grid, List, FolderPlus, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { UploadDialog } from "@/components/upload-dialog"
import { Download as DownloadDialog } from "@/components/download"
import { useFiles } from "@/hooks/use-files"
import { NoFilesState } from "@/components/dashboard/no-files"
import { CreateFolderDialog } from "@/components/create-folder-dialog"
import { ResourceGridItem } from "@/components/dashboard/resource-grid-item"
import { ResourceListItem } from "@/components/dashboard/resource-list-item"
import { ShareDialog } from "@/components/ui/share-dialog"
import { FileInfoModal } from "@/components/dashboard/file-info-dialog"
import { RenameDialog } from "@/components/dashboard/rename-dialog"
import { cn } from "@/lib/utils/common"

export default function DashboardPage() {
  const [uploadModal, setUploadModal] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const observerRef = useRef(null)

  const { toast } = useToast()
  const { files, loading, hasMore, totalPages, currentPage, loadFiles, setFileInfoDialog,
    setRenameDialog,
    setShareDialog,
    renameOpen,
    shareOpen,
    fileInfoOpen,
    renameFile,
    createFolder: createFolderRequest
  } = useFiles()

  const handleCreateFolder = () => {
    setCreateFolderOpen(true)
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    closeAllDialogs()
  }

  const closeAllDialogs = () => {
    setRenameDialog({ isOpen: false, file: null })
    setShareDialog({ isOpen: false, fileName: "", fileId: "" })
    setFileInfoDialog({ isOpen: false, file: null })
  }

  const handleRefresh = () => {
    setRefreshing(true)
    const onSuccess = () => {
      toast({
        description: "Reloaded drive contents"
      })
      setRefreshing(false)
    }

    loadFiles({ currentPage, limit: 10, onSuccess })
  }

  const createFolder = (name: string) => {
    createFolderRequest(name, undefined, () => {
      toast({
        title: "Folder created",
        description: `"${name}" has been created successfully.`,
      })
    }, () => {})
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

  useEffect(() => {
    if (isFetching && hasMore && totalPages > currentPage) {
      loadFiles({currentPage: currentPage + 1, limit: 10, onSuccess: () => setIsFetching(false)})
    } else {
      setIsFetching(false)
    }
  }, [isFetching])

  useEffect(() => {
    loadFiles({ currentPage, limit: 10 })

    const io = new IntersectionObserver(([{ isIntersecting, target }]) => {
      isIntersecting && (setIsFetching(true))
    }, { threshold: 1 })

    if (observerRef.current) {
      io.observe(observerRef.current)
    }
  }, [])

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
            <TableHead className="px-2">Name</TableHead>
            <TableHead className="px-2">Items</TableHead>
            <TableHead className="px-2">Size</TableHead>
            <TableHead className="px-2">Modified</TableHead>
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
      <div className="space-y-6 h-full">
        <div className="flex justify-between items-center">
          <div className="">
            <h1 className="text-3xl font-bold">Your Files</h1>
            <p className="text-muted-foreground">Manage and organize your workspace</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-lg p-1 hidden sm:block">
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
            <Button variant="outline" size="icon" className="hidden sm:flex" onClick={handleRefresh}>
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </Button>
            <Button onClick={handleCreateFolder} variant="outline" className="">
              <FolderPlus className="h-4 w-4" />
              <span className="hidden md:block ml-2">New Folder</span>
            </Button>
            <Button onClick={() => setUploadModal(true)}>
              <Upload className="h-4 w-4" />
              <span className="hidden md:block ml-2">Upload File</span>
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
        <div ref={observerRef} className="" />
      </div>

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
        onClose={() => setShareDialog({ isOpen: false, fileName: "", fileId: "" })}
        fileName={shareOpen.fileName}
        fileId={shareOpen.fileId}
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