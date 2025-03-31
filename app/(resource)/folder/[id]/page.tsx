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
import _, { capitalize } from "lodash"
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
import { TFile } from "@/store/slices/files"
import { files as filesApi } from "@/services/api"
import { useParams } from "next/navigation"
import { Breadcrumbs } from "@/components/folders/breadcrumbs"
import { cn } from "@/lib/utils/common"

export default function FolderContentsPage() {
  const [uploadModal, setUploadModal] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [files, setFiles] = useState<TFile[] | []>([])
  const [folder, setFolder] = useState<TFile | null>(null)
  const [pagination, setPagination] = useState<Partial<Pagination> | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[] | []>([])
  const [loading, setLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const observerRef = useRef(null)

  const { toast } = useToast()
  const params = useParams()
  const {
    setFileInfoDialog,
    setRenameDialog,
    setShareDialog,
    renameOpen,
    shareOpen,
    fileInfoOpen,
    renameFile,
    createFolder: createFolderRequest,
    currentProcessingFile,
    setCurrentProcessingFile,
    setStarred,
  } = useFiles()

  const onToggleStar = (file: TFile, value: boolean) => {
    setStarred(file.fileId, value, () => {
      toast({
        description: `${capitalize(file.type)} has been ${value ? "starred" : "unstarred"}.`
      })
    }, () => { })
  }

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
    loadFolderContents().then(() => {
      toast({
        description: "Reloaded drive contents"
      })
      setRefreshing(false)
    })
  }

  const createFolder = (name: string) => {
    if (!params || !params.id) return;
    createFolderRequest(name, String(params.id), (folder: TFile) => {
      toast({
        title: "Folder created",
        description: `"${name}" has been created successfully.`,
      })
      setFiles(files => [folder, ...files])
    }, () => { })
  }

  const confirmRename = (fileId: string, newName: string) => {
    renameFile(fileId, newName, () => {
      toast({
        title: "File renamed",
        description: `File has been renamed to "${newName}".`
      })
      setFiles(files => files.map(file =>
        file.fileId === fileId
          ? { ...file, fileName: newName }
          : file
      ))
    },
      () => { })
  }

  const loadFolderContents = async (page: number = 1, limit: number = 10, search?: string, action: "append" | "overwrite" = "overwrite") => {
    if (!params || !params.id) return;
    try {
      setLoading(true)
      const response = await filesApi.fetchFolderContents(String(params.id), page, limit, search)
      if (!response.success) {
        throw new Error(response.error?.message)
      }
      if (response.data && !(response.data instanceof Error)) {
        let { data, ...paginationResp } = response.data.paginated
        if (action === "append") {
          setFiles(prev => [...prev, ...data])
        } else {
          setFiles(data)
        }
        setPagination(paginationResp)
        setBreadcrumbs(response.data.breadcrumbs)
        setFolder(response.data.folder)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load folder contents",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let currentPage = Number(pagination?.currentPage),
      totalPages = Number(pagination?.totalPages);

    if (isFetching && (currentPage < totalPages)) {
      loadFolderContents(currentPage + 1, 10, undefined, "append").then(() => setIsFetching(false))
    } else {
      setIsFetching(false)
    }
  }, [isFetching, pagination])


  useEffect(() => {
    
    const handleIntersect = _.debounce(([{ isIntersecting }]) => {
      if (isIntersecting) setIsFetching(true)
      }, 200);
    
    const io = new IntersectionObserver(handleIntersect, { threshold: 0.1 })

    loadFolderContents().then(() => {
      if (observerRef.current) {
        io.observe(observerRef.current)
      }
    })
    
    return () => io.disconnect();
  }, [])

  useEffect(() => {
    if (currentProcessingFile) {
      setFiles(files => {
        const fileIndex = files.findIndex(f => f.fileId === currentProcessingFile.fileId)
        if (fileIndex !== -1) {
          if (currentProcessingFile.isDeleted) {
            return files.filter(f => f.fileId !== currentProcessingFile.fileId)
          }
          files[fileIndex] = currentProcessingFile
          return [...files]
        }
        return [currentProcessingFile, ...files]
      })

      if (currentProcessingFile.isUploaded || currentProcessingFile.isDeleted) {
        setCurrentProcessingFile(null)
      }
    }
  }, [currentProcessingFile])

  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
      {files.map((file) => <ResourceGridItem key={file.fileId} file={file} onToggleStar={() => onToggleStar(file, !file.isStarred)} onOpenMenu={() => { }} />)}
    </div>
  )

  const ListView = () => (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Modified</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => <ResourceListItem key={file.fileId} file={file} onToggleStar={() => onToggleStar(file, !file.isStarred)} onOpenMenu={() => { }} />)}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <Fragment>
      <div className="space-y-6 h-full">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Your Files</h1>
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
              <span className="hidden sm:block ml-2">New Folder</span>
            </Button>
            <Button onClick={() => setUploadModal(true)}>
              <Upload className="h-4 w-4" />
              <span className="hidden sm:block ml-2">Upload File</span>
            </Button>
          </div>
        </div>
        <div className="">
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>

        {files.length > 0 ? (viewMode === "grid" ? <GridView /> : <ListView />) : (
          loading ? (
            <div className="flex justify-center p-4 h-[calc(100vh-400px)] items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : <NoFilesState
            title="Folder looks empty"
            description={folder?.fileName && ("Nothing inside " + folder?.fileName + ". Start uploading files or create a new folder to get started with")}
            onUpload={() => setUploadModal(true)}
            onCreateFolder={handleCreateFolder} />
        )}

        {isFetching && (<div className="flex justify-center p-4 items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>)}

          {/* Intersection Observer target */}
          <div ref={observerRef} />
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