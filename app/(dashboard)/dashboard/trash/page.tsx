"use client"

import { Fragment, useEffect, useState } from "react"
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
import { cn, formatBytes, timeAgo } from "@/lib/utils/common"
import { TrashEmptyState } from "@/components/dashboard/trash-empty-state"

export default function TrashPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
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
    })
  }

  const handleDeleteAllPermanent = () => {
    setProcessing("all")
    clearFilesInTrash(() => {
      toast({
        title: "Files Deleted",
        description: "All files have been permanently deleted.",
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
    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
      {trash.files.map((file) => (
        <Card key={file.fileId} className={
          cn("p-4 hover:shadow-lg transition-shadow group relative w-full mx-auto cursor-pointer",
            file.type === 'folder'
              ? "bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30 cursor-pointer border border-blue-200 dark:border-blue-800"
              : "bg-card hover:bg-muted/30 border",
          )
        }>
          {(processing === "all" || processing === file.fileId) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-black/50 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          )}

          <div className="absolute top-2 right-2 flex space-x-1">

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={(processing === "all" || processing === file.fileId)} className={cn(
                  "h-8 w-8 rounded-full opacity-0 hover:opacity-100",
                  "group-hover:opacity-100 transition-opacity"
                )}>
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className=""
                  onClick={() => handleRestore(file.fileId)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => openDeleteDialog(file.fileId)}
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
              <div className="flex items-center justify-center w-full h-full">
                <FileIcon fileName={file.fileName} fileType={file.type} />
              </div>
            )}
          </div>

          <div className="w-full">
            <h3 className="font-medium text-sm truncate max-w-full" title={file.fileName}>
              {file.fileName}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {file.type !== 'folder' ? formatBytes(file.fileSize) : `0 items`} {file.deletedAt && " • Expires in " + timeAgo(new Date(new Date(String(file.deletedAt)).getTime() + 30 * 24 * 60 * 60 * 1000), true)}
            </p>
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