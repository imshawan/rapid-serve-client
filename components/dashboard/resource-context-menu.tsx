"use client"

import { Fragment } from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from "@/components/ui/context-menu"
import { TFile } from "@/store/slices/files"
import {
  Eye, Star, Share, Copy, Edit, Trash, Download, Info, FolderOpen, Lock, Users, Globe, Clipboard,
  Share2, Activity
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface FileContextMenuProps {
  file: TFile
  children: React.ReactNode
  onPreview: (file: TFile) => void
  onToggleStar: (fileId: string) => void
  onShare: (fileName: string, fileId: string) => void
  onRename: (file: TFile) => void
  onDelete: (fileId: string, fileName: string) => void
  onDownload: (fileId: string) => void
  onFileInfo: (file: TFile) => void
}

export function ResourceContextMenu({
  file,
  children,
  onPreview,
  onToggleStar,
  onShare,
  onRename,
  onDelete,
  onDownload,
  onFileInfo
}: FileContextMenuProps) {
  const { toast } = useToast()

  const handleCopyLink = () => {
    const host = window.location.origin
    navigator.clipboard.writeText(`${host}/files/${file.fileId}`)
    toast({
      title: "Link copied",
      description: "File link has been copied to clipboard"
    })
  }

  const handleMakeCopy = () => {
    toast({
      title: "File copied",
      description: `A copy of "${file.fileName}" has been created`
    })
  }

  const handleViewHistory = () => {
    toast({
      title: "Version history",
      description: "Version history feature is coming soon"
    })
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>

      <ContextMenuContent className="w-64">
        {/* Primary Actions */}
        <ContextMenuItem
          className="cursor-pointer flex items-center"
          onClick={() => file.type === "folder" ? null : onPreview(file)}
        >
          {file.type === "folder" ? (
            <Fragment>
              <FolderOpen className="mr-2 h-4 w-4" />
              Open
            </Fragment>
          ) : (
            <Fragment>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Fragment>
          )}
        </ContextMenuItem>

        <ContextMenuItem
          className="cursor-pointer flex items-center"
          onClick={() => onToggleStar(file.fileId)}
        >
          <Star className={`mr-2 h-4 w-4 ${file.isStarred ? "fill-yellow-400 text-yellow-400" : ""}`} />
          {file.isStarred ? "Remove from Starred" : "Add to Starred"}
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Sharing Section */}

        <ContextMenuSub>
          <ContextMenuSubTrigger className="cursor-pointer flex items-center">
            <Share className="mr-2 h-4 w-4" />
            Share
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-60">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium mb-1">Share "{file.fileName}"</p>
              <p className="text-xs text-muted-foreground">Choose how you want to share this file</p>
            </div>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onShare(file.fileName, file.fileId)} className="cursor-pointer">
              <Users className="mr-2 h-4 w-4" />
              Share with people
            </ContextMenuItem>
            <ContextMenuItem onClick={handleCopyLink} className="cursor-pointer">
              <Clipboard className="mr-2 h-4 w-4" />
              Copy link
            </ContextMenuItem>
            <ContextMenuSeparator />
            <div className="px-2 py-1.5 space-y-2">
              <p className="text-xs font-medium">Access</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">Restricted</span>
                </div>
                <Badge variant="outline" className="text-[10px] h-5">Default</Badge>
              </div>
              <div className="flex items-center justify-between opacity-60">
                <div className="flex items-center">
                  <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">Anyone with link</span>
                </div>
              </div>
            </div>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* File Operations */}
        <ContextMenuItem onClick={() => onRename(file)} className="cursor-pointer">
          <Edit className="mr-2 h-4 w-4" />
          Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={handleMakeCopy} className="cursor-pointer flex items-center">
          <Copy className="mr-2 h-4 w-4" />
          Make a Copy
        </ContextMenuItem>

        {file.type !== "folder" && (
          <ContextMenuItem onClick={() => onDownload(file.fileId)} className="cursor-pointer flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Download
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />

        {/* Advanced Operations */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="cursor-pointer flex items-center">
            More actions
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-56">

            <ContextMenuItem onClick={() => onFileInfo(file)} className="cursor-pointer">
              <Info className="mr-2 h-4 w-4" />
              File details
            </ContextMenuItem>

            <ContextMenuSeparator />

            <ContextMenuItem onClick={handleViewHistory} className="cursor-pointer">
              <Activity className="mr-2 h-4 w-4" />
              Activities
            </ContextMenuItem>
            <ContextMenuItem className="cursor-pointer" onClick={() => console.log("Preview Clicked")}>
              <Share2 className="mr-2 h-4 w-4" />
              Shared Info
            </ContextMenuItem>

            <ContextMenuSeparator />

            <ContextMenuItem
              onClick={() => onDelete(file.fileId, file.fileName)}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Move to Trash
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  )
}