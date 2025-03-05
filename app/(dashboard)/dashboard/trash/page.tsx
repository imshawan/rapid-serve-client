"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { RotateCcw, MoreVertical, Trash2, Grid, List } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch, useAppSelector } from "@/store"
import { permanentlyDeleteFile } from "@/store/slices/files"
import { useFiles } from "@/hooks/use-files"
import FileIcon from "@/components/dashboard/file-icon"
import { formatBytes } from "@/lib/utils/common"
import { TrashEmptyState } from "@/components/dashboard/trash-empty-state"

export default function TrashPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [processing, setProcessing] = useState("")
  const { toast } = useToast()
  const { loadFilesInTrash, trash, restoreFile, clearFilesInTrash, loading } = useFiles()
  const dispatch = useAppDispatch()

  const handleRestore = (fileId: string) => {
    setProcessing(fileId)
    restoreFile(fileId, () => {
      toast({
        title: "File Restored",
        description: "The file has been restored.",
        variant: "success"
      })
      setProcessing("")
    }, () => setProcessing(""))
  }

  const handleDeletePermanently = (fileId: string) => {
    dispatch(permanentlyDeleteFile(fileId))
    setIsDeleteDialogOpen(false)
    toast({
      title: "File Deleted",
      description: "The file has been permanently deleted.",
      variant: "success"
    })
  }

  const handleDeleteAllPermanent = () => {
    setProcessing("all")
    clearFilesInTrash(() => {
      toast({
        title: "Files Deleted",
        description: "All files have been permanently deleted.",
        variant: "success"
      })
      setProcessing("")
    }, () => {
      setProcessing("")
    })
  }

  const openDeleteDialog = (fileId: string) => {
    setSelectedFile(fileId)
    setIsDeleteDialogOpen(true)
  }

  useEffect(() => {
    loadFilesInTrash({ currentPage: 1, limit: 10 })
  }, [])

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {trash.files.map((file) => (
        <Card key={file.fileId} className="p-4 hover:shadow-lg transition-shadow relative">
          {(processing === "all" || processing === file.fileId) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-black/50 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          )}
          <div className="flex flex-col items-center space-y-2">
            <FileIcon fileName={file.fileName} fileType={file.type} />
            <div className="text-sm font-medium truncate w-full text-center">{file.fileName}</div>
            <div className="text-xs text-muted-foreground">
              Deleted on {new Date(file.deletedAt!).toLocaleDateString()}
              <br />
              Expires on {new Date(new Date(file.deletedAt!).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </div>
            <div className="flex space-x-2">
              <Button size="icon" variant="ghost" onClick={() => handleRestore(file.fileId)}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive"
                onClick={() => openDeleteDialog(file.fileId)}
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
      <Table className="">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Deleted On</TableHead>
            <TableHead>Expires On</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trash.files.map((file) => (
            <TableRow key={file.fileId}>
              <TableCell className="p-2 px-4">
                <div className="flex items-center gap-2">
                  <FileIcon fileName={file.fileName} fileType={file.type} className="w-5 h-5" outerClassName="p-2" />
                  <div className="w-4/5 truncate">
                    <span className="font-medium truncate">{file.fileName}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="p-2 px-4">{new Date(file.deletedAt!).toLocaleDateString()}</TableCell>
              <TableCell className="p-2 px-4">
                {new Date(new Date(file.deletedAt!).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </TableCell>
              <TableCell className="p-2 px-4">{formatBytes(file.fileSize)}</TableCell>
              <TableCell className="p-2 px-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    {
                      (processing === file.fileId || processing === "all") ? (
                        <div className="animate-spin rounded-full ml-2 h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100"></div>
                      ) : <MoreVertical className="h-5 w-5" />
                    }
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleRestore(file.fileId)}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => openDeleteDialog(file.fileId)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Permanently
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
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Trash</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Files in trash are deleted forever after 30 days
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={processing === "all" || loading}
            >
              Empty Trash
            </Button>
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
          </div>
        </div>

        {trash.files && trash.files.length > 0 ? (viewMode === 'grid' ? <GridView /> : <ListView />) : (
          loading ? (
            <div className="flex justify-center p-4 h-[calc(100vh-400px)] items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : <TrashEmptyState />
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedFile ? 'Delete File Permanently' : 'Empty Trash'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedFile
                ? "This action cannot be undone. This file will be permanently deleted."
                : "This action cannot be undone. All files in the trash will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => selectedFile ? handleDeletePermanently(selectedFile) : handleDeleteAllPermanent()}
            >
              {selectedFile ? 'Delete' : 'Empty Trash'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}