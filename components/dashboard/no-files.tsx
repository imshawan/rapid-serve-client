"use client"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { FolderIcon, UploadCloud, FolderPlus, FileQuestion } from "lucide-react"

interface NoFilesStateProps {
  title?: string
  description?: string
  onUpload?: () => void
  onCreateFolder?: () => void
  onHelp?: () => void
  username?: string
}

export function NoFilesState({ 
  title,
  description,
  onUpload, 
  onCreateFolder,
  onHelp,
  username 
}: NoFilesStateProps) {
  return (
    <EmptyState
      icon={<FolderIcon className="h-10 w-10 text-muted-foreground" />}
      title={username ? `${username}'s workspace is empty` : (title || "No files found")}
      description={description || "Upload files or create a new folder to get started with your workspace."}
      action={
        <div className="space-y-4">
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
            <Button onClick={onUpload} className="group relative">
              <span className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-md bg-primary/10 transition-transform group-hover:translate-x-0 group-hover:translate-y-0" />
              <span className="relative flex items-center justify-center">
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload Files
              </span>
            </Button>
            <Button 
              variant="outline" 
              onClick={onCreateFolder}
              className="border-dashed"
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              Create Folder
            </Button>
          </div>
          <div className="text-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onHelp}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <FileQuestion className="mr-1 h-3 w-3" />
              Need help getting started?
            </Button>
          </div>
        </div>
      }
      className="bg-background/50 backdrop-blur-sm p-0 h-[calc(100vh-300px)]"
    />
  )
}