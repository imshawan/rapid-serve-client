"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Download, MoreVertical, Users, Link as LinkIcon, Grid, List, Filter, Search, Share2, FolderPlus, Eye } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShareDialog } from "@/components/ui/share-dialog"
import { useShared } from "@/hooks/use-shared"
import { Download as DownloadDialog } from "@/components/download"
import { useFiles } from "@/hooks/use-files"
import FileIcon from "@/components/dashboard/file-icon"
import { Shared } from "@/lib/models/shared"
import { formatBytes, timeAgo } from "@/lib/utils/common"
import { EmptySharedState } from "@/components/dashboard/empty-shared-state"
import { UserList } from "@/components/dashboard/user-list"
import { FilePreview } from "@/components/dashboard/file-preview"
import { TFile } from "@/store/slices/files"

export default function SharedPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const { setShareDialog, shareOpen, setFileLoadingState, fileLoading, files, loadFiles, loading } = useShared()
  const { setDownloadOpen, loadFileMeta } = useFiles()
  const [activeTab, setActiveTab] = useState<any>("shared-with-me")
  const router = useRouter()

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

  const handlePreview = (file: SharedFilePopulated) => {
    router.push(["/", file.fileType, "/", file.fileId, "?sharer=", file.shareId].join(""))
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    loadFiles({ currentPage: 1, limit: 10, filter: value, clearOld: true })
  }

  useEffect(() => {
    loadFiles({ currentPage: 1, limit: 10, filter: activeTab })
  }, [])

  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
      {files.map((file) => (
        <Card key={file.fileId} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            {(
              <div className="aspect-video relative group">
                <div
                  className="w-full h-full object-cover"
                >
                  <FileIcon fileName={file.fileName} fileType={file.type} outerClassName="h-full w-full rounded-sm flex" className="h-full w-full sm:h-[80%] m-auto" />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" disabled={fileLoading === file.fileId} onClick={() => handleDownload(file.fileId)}>
                    {
                      fileLoading === file.fileId ?
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
                        : <Download className="h-4 w-4" />
                    }
                  </Button>
                  <Button size="icon" variant="secondary" onClick={() => handlePreview(file)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1 max-w-[82%]">
                  <h3 className="font-medium text-sm truncate max-w-full">{file.fileName}</h3>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(file.fileSize)} • {timeAgo(new Date(file.updatedAt))}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={fileLoading === file.fileId}>
                      {fileLoading === file.fileId ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div> : <MoreVertical className="h-4 w-4" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(file.fileId)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare(file.fileName, file.fileId)}>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {file.sharedBy && file.sharedBy.length > 0 && (
                <div className="flex items-center justify-between">
                  {file.sharedBy.map((item: SharedWithUser) => (
                    <HoverCard key={item.userId}>
                      <HoverCardTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={item.profilePicture} />
                            <AvatarFallback>{item.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            Shared by {item.name}
                          </span>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent>
                        <UserList users={file.sharedBy} title="Shared by" />
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                </div>
              )}

              {file.sharedWith.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {file.sharedWith.map((user, index) => (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Avatar key={index} className="h-6 w-6 border-2 border-background cursor-pointer">
                            <AvatarImage src={user.profilePicture} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                        </HoverCardTrigger>
                        <HoverCardContent>
                          <UserList users={file.sharedWith} title="Shared with" />
                        </HoverCardContent>
                      </HoverCard>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                  >
                    <Users className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
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
            <TableHead>Shared By</TableHead>
            <TableHead>Shared With</TableHead>
            <TableHead>Modified</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.fileId}>
              <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                  <FileIcon fileName={file.fileName} fileType={file.type} className="w-5 h-5" outerClassName="p-2" />
                  <div className="w-4/5 truncate">
                    <span className="font-medium truncate">{file.fileName}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <HoverCard>
                  <HoverCardTrigger>
                    <div className="flex items-center gap-2">
                      {file.sharedBy && file.sharedBy.length > 0 && (
                        file.sharedBy.map(user => (
                          <>
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.profilePicture} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{user.name}</span>
                          </>
                        ))
                      )}
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <UserList users={file.sharedBy} title="Shared by" />
                  </HoverCardContent>
                </HoverCard>
              </TableCell>
              <TableCell>
                <HoverCard>
                  <HoverCardTrigger>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {file.sharedWith.map((user, index) => (
                          <Avatar key={index} className="h-6 w-6 border-2 border-background cursor-pointer">
                            <AvatarImage src={user.profilePicture} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                      >
                        <Users className="h-3 w-3" />
                      </Button>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <UserList users={file.sharedWith} title="Shared with" />
                  </HoverCardContent>
                </HoverCard>
              </TableCell>
              <TableCell>{timeAgo(file.updatedAt)}</TableCell>
              <TableCell>{formatBytes(file.fileSize)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(file.fileId)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare(file.fileName, file.fileId)}>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Share
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shared Files</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
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

      <Tabs onValueChange={handleTabChange} value={activeTab} className="space-y-4" >
        <TabsList>
          <TabsTrigger value="shared-with-me">Shared with me</TabsTrigger>
          <TabsTrigger value="shared-by-me">Shared by me</TabsTrigger>
        </TabsList>

        <TabsContent value="shared-with-me" className="space-y-4">
          {files.length > 0 ? (
            viewMode === 'grid' ? <GridView /> : <ListView />
          ) : (
            loading ? <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div> : <EmptySharedState type={activeTab} setActiveTab={handleTabChange} />
          )}
        </TabsContent>

        <TabsContent value="shared-by-me">
          {files.length > 0 ? (
            viewMode === 'grid' ? <GridView /> : <ListView />
          ) : (
            loading ? <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div> : <EmptySharedState type={activeTab} setActiveTab={handleTabChange} />
          )}
        </TabsContent>
      </Tabs>

      <ShareDialog
        isOpen={shareOpen.isOpen}
        onClose={() => setShareDialog({ isOpen: false, fileName: "", fileId: "" })}
        fileName={shareOpen.fileName}
        fileId={shareOpen.fileId}
      />

      <DownloadDialog />
    </div>
  )
}