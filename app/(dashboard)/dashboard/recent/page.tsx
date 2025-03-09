"use client"

import { Fragment, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { Download, MoreVertical, Share2, Grid, List, X } from "lucide-react"
import { useFiles } from "@/hooks/use-files"
import { formatBytes, timeAgo } from "@/lib/utils/common"
import FileIcon from "@/components/dashboard/file-icon"
import { ShareDialog } from "@/components/ui/share-dialog"
import { Download as DownloadDialog } from "@/components/download"
import { toast } from "@/hooks/use-toast"
import { RecentEmptyState } from "@/components/dashboard/recent-empty-state"

export default function RecentPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [removing, setRemoving] = useState("")
  const { loadRecentFiles, recents, setShareDialog, shareOpen, fileLoading, setFileLoadingState, loadFileMeta, setDownloadOpen, loading, deleteFileFromRecents } = useFiles()

  const handleShare = (fileName: string, fileId: string) => {
    setShareDialog({ isOpen: true, fileName, fileId })
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

  const handleHelp = () => {
    toast({
      title: "Recent files help",
      description: "Information about recent files functionality would be shown here.",
    });
  };

  const handleRemove = (fileId: string) => {
    setRemoving(fileId)
    deleteFileFromRecents(fileId, () => {
      toast({
        title: "File removed",
        description: "The file has been removed from recents.",
        variant: "success"
      })
      setRemoving("")
    }, () => {
      setRemoving("")
    })
  }

  useEffect(() => {
    loadRecentFiles({ currentPage: 1, limit: 15 })
  }, [])

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {recents.files.map((file) => (
        <Card key={file.fileId} className="p-4 hover:shadow-lg transition-shadow relative">
          <div className="flex flex-col items-center space-y-2">
            <FileIcon fileName={file.fileName} fileType={file.type} />
            <div className="text-sm font-medium truncate w-full text-center">{file.fileName}</div>
            <div className="text-xs text-muted-foreground">Accessed {timeAgo(new Date(file.lastAccessed))}</div>
            <div className="flex space-x-2">
              <Button size="icon" variant="ghost" onClick={() => handleDownload(file.fileId)}>
                {(fileLoading === file.fileId) ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100"></div>
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleShare(file.fileName, file.fileId)}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-destructive" disabled={removing === file.fileId} onClick={() => handleRemove(file.fileId)}>
                {removing === file.fileId ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100"></div>
                ) : (
                  <X className="h-4 w-4" />
                )}
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
            <TableHead>Last Accessed</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recents.files.map((file) => (
            <TableRow key={file.fileId}>
              <TableCell className="p-2 px-4">
                <div className="flex items-center gap-2">
                  <FileIcon fileName={file.fileName} fileType={file.type} className="w-5 h-5" outerClassName="p-2" />
                  <div className="w-4/5 truncate">
                    <span className="font-medium truncate">{file.fileName}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="p-2">{timeAgo(new Date(file.lastAccessed))}</TableCell>
              <TableCell className="p-2">{formatBytes(file.fileSize)}</TableCell>
              <TableCell className="p-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    {
                      (fileLoading === file.fileId || removing === file.fileId) ? (
                        <div className="animate-spin rounded-full ml-2 h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100"></div>
                      ) : <MoreVertical className="h-5 w-5" />
                    }
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(file.fileId)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare(file.fileName, file.fileId)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleRemove(file.fileId)}>
                      <X className="h-4 w-4 mr-2" />
                      Remove
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
    <Fragment>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Recent</h1>
            <p className="text-muted-foreground">Files and folders you've worked with recently</p>
          </div>
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
          </div>
        </div>
        {
          recents.files.length > 0 ? (
            viewMode === 'grid' ? <GridView /> : <ListView />
          ) : (
            loading ? (
              <div className="flex justify-center p-4 h-[calc(100vh-400px)] items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : <RecentEmptyState onHelp={handleHelp} />
          )
        }
      </div>
      <DownloadDialog />

      <ShareDialog
        isOpen={shareOpen.isOpen}
        onClose={() => setShareDialog({ isOpen: false, fileName: "", fileId: "" })}
        fileName={shareOpen.fileName}
        fileId={shareOpen.fileId}
      />
    </Fragment>
  )
}