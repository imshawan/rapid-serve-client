"use client"

import { useEffect, useRef, useState } from "react"
import _, { capitalize } from "lodash"
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
import { Download, MoreVertical, Share2, Star, Grid, List, Eye, FolderOpen } from "lucide-react"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { cn, formatBytes, timeAgo } from "@/lib/utils/common"
import { Download as DownloadDialog } from "@/components/download"
import FileIcon from "@/components/dashboard/file-icon"
import { TFile } from "@/store/slices/files"
import { StarredEmptyState } from "@/components/dashboard/starred-empty-state"
import { files as filesApi } from "@/services/api"
import { toast } from "@/hooks/use-toast"
import { useFiles } from "@/hooks/use-files"
import { ShareDialog } from "@/components/ui/share-dialog"
import { useRouter } from "next/navigation"

export default function StarredPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [starredFiles, setStarredFiles] = useState<TFile[]>([])
  const [pagination, setPagination] = useState<Partial<Pagination> | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const { setShareDialog, shareOpen, setFileLoadingState, loadFileMeta, setDownloadOpen, fileLoading, setStarred } = useFiles()

  const observerRef = useRef(null)
  const router = useRouter()

  const loadStarredFiles = async (page: number = 1, limit: number = 10, search?: string, action: "append" | "overwrite" = "overwrite") => {

    try {
      setLoading(true)
      const response = await filesApi.getStarred(page, limit, search)
      if (!response.success) {
        throw new Error(response.error?.message)
      }
      if (response.data && !(response.data instanceof Error)) {
        let { data, ...paginationResp } = response.data
        if (action === "append") {
          setStarredFiles(prev => [...prev, ...data])
        } else {
          setStarredFiles(data)
        }
        setPagination(paginationResp)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load starred files",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
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

  const handleShare = (fileName: string, fileId: string) => {
    setShareDialog({ isOpen: true, fileName, fileId })
  }

  const handleOpen = (file: TFile) => {
    router.push(["/", file.type, "/", file.fileId].join(""))
  }

  const unstar = (file: TFile) => {
    setFileLoadingState(file.fileId)
    setStarred(file.fileId, false, () => {
      setStarredFiles(prev => prev.filter(f => f.fileId !== file.fileId))
      setFileLoadingState("")
      toast({
        description: `${capitalize(file.type)} has been unstarred.`
      })
    }, () => { setFileLoadingState("") })
  }

  useEffect(() => {
    let currentPage = Number(pagination?.currentPage),
      totalPages = Number(pagination?.totalPages);

    if (isFetching && (currentPage < totalPages)) {
      loadStarredFiles(currentPage + 1, 10, undefined, "append").then(() => setIsFetching(false))
    } else {
      setIsFetching(false)
    }
  }, [isFetching, pagination])


  useEffect(() => {

    const handleIntersect = _.debounce(([{ isIntersecting }]) => {
      if (isIntersecting) setIsFetching(true)
    }, 200);

    const io = new IntersectionObserver(handleIntersect, { threshold: 0.1 })

    loadStarredFiles().then(() => {
      if (observerRef.current) {
        io.observe(observerRef.current)
      }
    })

    return () => io.disconnect();
  }, [])

  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
      {starredFiles.map((file) => (
        <ContextMenu key={file.fileId}>
          <ContextMenuTrigger asChild>
            <Card key={file.fileId} className={
              cn("p-4 hover:shadow-lg transition-shadow group relative w-full mx-auto cursor-pointer",
                file.type === 'folder'
                  ? "bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30 cursor-pointer border border-blue-200 dark:border-blue-800"
                  : "bg-card hover:bg-muted/30 border",
              )
            }>
              {(fileLoading === "all" || fileLoading === file.fileId) && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-black/50 rounded-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
                </div>
              )}

              <div className="absolute top-2 right-2 flex space-x-1">

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={(fileLoading === "all" || fileLoading === file.fileId)} className={cn(
                      "h-8 w-8 rounded-full sm:opacity-0 hover:opacity-100",
                      "group-hover:opacity-100 transition-opacity"
                    )}>
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpen(file)}>
                      {file.type === "file" ? (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </>
                      ) : (
                        <>
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Open
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(file.fileId)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare(file.fileName, file.fileId)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => unstar(file)}>
                      <Star className="h-4 w-4 mr-2" />
                      Remove from Starred
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
                  {file.type !== 'folder' ? formatBytes(file.fileSize) : `${file.items} items`} • {timeAgo(file.updatedAt)}
                </p>
              </div>

            </Card>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem onClick={() => handleOpen(file)}>
              {file.type === "file" ? (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </>
              ) : (
                <>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Open
                </>
              )}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleDownload(file.fileId)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleShare(file.fileName, file.fileId)}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </ContextMenuItem>
            <ContextMenuItem className="text-destructive" onClick={() => unstar(file)}>
              <Star className="h-4 w-4 mr-2" />
              Remove from Starred
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}

      <div ref={observerRef} />
    </div>
  )

  const ListView = () => (
    <div className="border rounded-lg">
      <Table className="">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {starredFiles.map((file) => (
            <TableRow key={file.fileId}>
              <TableCell className="p-2 px-4">
                <div className="flex items-center gap-2">
                  <FileIcon fileName={file.fileName} fileType={file.type} className="w-5 h-5" outerClassName="p-2" />
                  <div className="w-4/5 truncate">
                    <span className="font-medium truncate">{file.fileName}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="p-2 px-4">{formatBytes(file.fileSize)}</TableCell>
              <TableCell className="p-2 px-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    {
                      (fileLoading === file.fileId || fileLoading === "all") ? (
                        <div className="animate-spin rounded-full ml-2 h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100"></div>
                      ) : <MoreVertical className="h-5 w-5 cursor-pointer" />
                    }
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpen(file)}>
                      {file.type === "file" ? (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </>
                      ) : (
                        <>
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Open
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(file.fileId)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare(file.fileName, file.fileId)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => unstar(file)}>
                      <Star className="h-4 w-4 mr-2" />
                      Remove from Starred
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          <div ref={observerRef} />
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Starred</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quick access to your important resources
          </p>
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

      {starredFiles && starredFiles.length > 0 ? (viewMode === 'grid' ? <GridView /> : <ListView />) : (
        loading ? (
          <div className="flex justify-center p-4 h-[calc(100vh-400px)] items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : <StarredEmptyState />
      )}

      <DownloadDialog />

      <ShareDialog
        isOpen={shareOpen.isOpen}
        onClose={() => setShareDialog({ isOpen: false, fileName: "", fileId: "" })}
        fileName={shareOpen.fileName}
        fileId={shareOpen.fileId}
      />
    </div>
  )
}