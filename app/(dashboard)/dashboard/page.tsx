"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ShareDialog } from "@/components/ui/share-dialog"
import { Upload, MoreVertical, Download, Share2, Trash2, Grid, List, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { useAppDispatch, useAppSelector } from "@/store"
// import { deleteFile } from "@/store/slices/files"
import { useInView } from "react-intersection-observer"
import { formatBytes, generateUUID } from "@/lib/utils/common"
import { UploadDialog } from "@/components/upload-dialog"
import { Download as DownloadDialog } from "@/components/download"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation"
import { useFiles } from "@/hooks/use-files"
import FileIcon from "@/components/dashboard/file-icon"

export default function DashboardPage() {
  const [uploadModal, setUploadModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; fileId: string | null, fileName: string |null }>({
    isOpen: false,
    fileId: null,
    fileName: null
  })
  const [shareDialog, setShareDialog] = useState<{ isOpen: boolean; fileName: string }>({
    isOpen: false,
    fileName: ""
  })
  const [metaLoading, setMetaLoading] = useState("")
  const { toast } = useToast()
  const { files, loading, hasMore, currentPage, loadFiles, loadFileMeta, setDownloadOpen, deleteFile } = useFiles()
  const dispatch = useAppDispatch()
  const { ref, inView } = useInView()

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

  useEffect(() => {
    loadFiles({ currentPage, limit: 10 })
  }, [])

  // useEffect(() => {
  //   if (inView && hasMore && !loading) {
  //     // dispatch(fetchFiles(currentPage))
  //     loadFiles({currentPage, limit: 10})
  //   }
  // }, [inView, hasMore, loading, dispatch])

  const handleDelete = (fileId: string, fileName: string) => {
    setDeleteConfirmation({ isOpen: true, fileId, fileName })
  }

  const confirmDelete = () => {
    if (deleteConfirmation.fileId) {
      deleteFile(deleteConfirmation.fileId, () =>  {
        toast({
          title: "File moved to trash",
          description: deleteConfirmation.fileName + " has been moved to the trash bin."
        })
        setDeleteConfirmation({ isOpen: false, fileId: null, fileName: null })
      })
    }
  }

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.filter(file => !file.isDeleted).map((file) => (
        <Card key={file.fileId} className="p-4 hover:shadow-lg transition-shadow">
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
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.filter((file: { isDeleted: any }) => !file.isDeleted).map((file) => (
            <TableRow key={file.fileId}>
              <TableCell>{file.fileName}</TableCell>
              <TableCell>{formatBytes(file.fileSize)}</TableCell>
              <TableCell>{new Date(file.updatedAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <DropdownMenu>
                  {(metaLoading === file.fileId) ? (
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
                    <DropdownMenuItem onClick={() => handleShare(file.fileName)}>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Files</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
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

      {viewMode === 'grid' ? <GridView /> : <ListView />}

      {loading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Intersection Observer target */}
      <div ref={ref} className="h-10" />

      {/* Upload Dialog */}
      <UploadDialog open={uploadModal} setOpen={setUploadModal} />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog confirmation={deleteConfirmation} setConfirmation={setDeleteConfirmation} onDeleteConfirm={confirmDelete} />

      <ShareDialog
        isOpen={shareDialog.isOpen}
        onClose={() => setShareDialog({ isOpen: false, fileName: "" })}
        fileName={shareDialog.fileName}
      />

      <DownloadDialog />
    </div>
  )
}