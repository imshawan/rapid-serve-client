"use client"

import { useState } from "react"
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
import { useAppDispatch, useAppSelector } from "@/store/store"
import { restoreFile, permanentlyDeleteFile } from "@/store/slices/filesSlice"

export default function TrashPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
  const dispatch = useAppDispatch()
  
  const files = useAppSelector(state => 
    state.files.files.filter(file => file.isDeleted)
  )

  const handleRestore = (fileId: string) => {
    dispatch(restoreFile(fileId))
    toast({
      title: "File Restored",
      description: "The file has been restored to its original location."
    })
  }

  const handleDeletePermanently = (fileId: string) => {
    dispatch(permanentlyDeleteFile(fileId))
    setIsDeleteDialogOpen(false)
    toast({
      title: "File Deleted",
      description: "The file has been permanently deleted.",
      variant: "destructive"
    })
  }

  const openDeleteDialog = (fileId: string) => {
    setSelectedFile(fileId)
    setIsDeleteDialogOpen(true)
  }

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map((file) => (
        <Card key={file.id} className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center space-y-2">
            <div className="text-4xl">{file.type === 'folder' ? '📁' : '📄'}</div>
            <div className="text-sm font-medium truncate w-full text-center">{file.name}</div>
            <div className="text-xs text-muted-foreground">
              Deleted on {new Date(file.deletedAt!).toLocaleDateString()}
              <br />
              Expires on {new Date(new Date(file.deletedAt!).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </div>
            <div className="flex space-x-2">
              <Button size="icon" variant="ghost" onClick={() => handleRestore(file.id)}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive"
                onClick={() => openDeleteDialog(file.id)}
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
            <TableHead>Deleted On</TableHead>
            <TableHead>Expires On</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell className="font-medium">{file.name}</TableCell>
              <TableCell>{new Date(file.deletedAt!).toLocaleDateString()}</TableCell>
              <TableCell>
                {new Date(new Date(file.deletedAt!).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </TableCell>
              <TableCell>{file.size}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleRestore(file.id)}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => openDeleteDialog(file.id)}
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

        {viewMode === 'grid' ? <GridView /> : <ListView />}
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
              onClick={() => selectedFile ? handleDeletePermanently(selectedFile) : null}
            >
              {selectedFile ? 'Delete' : 'Empty Trash'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}