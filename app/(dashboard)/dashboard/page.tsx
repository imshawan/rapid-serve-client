"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ShareDialog } from "@/components/ui/share-dialog"
import { Upload, MoreVertical, Download, Share2, Trash2, Grid, List, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { fetchFiles, deleteFile } from "@/store/slices/filesSlice"
import { useInView } from "react-intersection-observer"
import { generateUUID } from "@/lib/utils"

export default function DashboardPage() {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadModal, setUploadModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; fileId: string | null }>({
    isOpen: false,
    fileId: null
  })
  const [shareDialog, setShareDialog] = useState<{ isOpen: boolean; fileName: string }>({
    isOpen: false,
    fileName: ""
  })
  const { toast } = useToast()
  const dispatch = useAppDispatch()
  const { files, loading, hasMore } = useAppSelector(state => state.files)
  const { ref, inView } = useInView()

  const handleShare = (fileName: string) => {
    setShareDialog({ isOpen: true, fileName })
  }

  useEffect(() => {
    if (inView && hasMore && !loading) {
      dispatch(fetchFiles(1))
    }
  }, [inView, hasMore, loading, dispatch])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadModal(false)
          toast({
            title: "Upload complete",
            description: `${file.name} has been uploaded successfully.`
          })
          return null
        }
        return prev + 10
      })
    }, 500)
  }

  const handleDelete = (fileId: string) => {
    setDeleteConfirmation({ isOpen: true, fileId })
  }

  const confirmDelete = () => {
    if (deleteConfirmation.fileId) {
      dispatch(deleteFile(deleteConfirmation.fileId))
      toast({
        title: "File moved to trash",
        description: "The file has been moved to the trash bin."
      })
      setDeleteConfirmation({ isOpen: false, fileId: null })
    }
  }
  
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.filter(file => !file.isDeleted).map((file) => (
        <Card key={generateUUID()} className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center space-y-2">
            <div className="text-4xl">{file.type === 'folder' ? '📁' : '📄'}</div>
            <div className="text-sm font-medium truncate w-full text-center">{file.name}</div>
            <div className="text-xs text-muted-foreground">{file.size}</div>
            <div className="flex space-x-2">
              <Button size="icon" variant="ghost">
                <Download className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleShare(file.name)}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-destructive"
                onClick={() => handleDelete(file.id)}
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
          {files.filter(file => !file.isDeleted).map((file) => (
            <TableRow key={generateUUID()}>
              <TableCell>{file.name}</TableCell>
              <TableCell>{file.size}</TableCell>
              <TableCell>{new Date(file.modified).toLocaleDateString()}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare(file.name)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDelete(file.id)}
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
      <Dialog open={uploadModal} onOpenChange={setUploadModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>
              Choose a file to upload to your cloud storage.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <Input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <Label htmlFor="file-upload">
                  <div className="space-y-2 cursor-pointer">
                    <p className="text-sm text-muted-foreground">
                      Drag and drop your files here, or click to select files
                    </p>
                    <Button variant="secondary" disabled={isUploading}>
                      Choose File
                    </Button>
                  </div>
                </Label>
              </div>
            </div>
            {uploadProgress !== null && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteConfirmation.isOpen} 
        onOpenChange={(isOpen) => setDeleteConfirmation({ isOpen, fileId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to move this file to trash? You can restore it from the trash bin later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Move to Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ShareDialog
        isOpen={shareDialog.isOpen}
        onClose={() => setShareDialog({ isOpen: false, fileName: "" })}
        fileName={shareDialog.fileName}
      />
    </div>
  )
}