"use client"

import { useState } from "react"
import { Check, Folder, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/common"

interface CreateFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateFolder: (name: string) => void
  existingFolderNames?: string[]
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  onCreateFolder,
  existingFolderNames = [],
}: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("Untitled folder")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!folderName.trim()) {
      setError("Folder name cannot be empty")
      return
    }
    
    if (existingFolderNames.includes(folderName)) {
      setError("A folder with this name already exists")
      return
    }
    
    onCreateFolder(folderName)
    setFolderName("Untitled folder")
    setError(null)
    onOpenChange(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFolderName(e.target.value)
    if (error) setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Create new folder
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                value={folderName}
                onChange={handleChange}
                className={cn(
                  "pr-10",
                  error && "border-destructive focus-visible:ring-destructive"
                )}
                autoFocus
                onFocus={(e) => e.target.select()}
              />
              {folderName && (
                <button
                  type="button"
                  onClick={() => setFolderName("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setFolderName("Untitled folder")
                setError(null)
                onOpenChange(false)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-1">
              <Check className="h-4 w-4" />
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}