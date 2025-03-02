"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import FileIcon from "@/components/dashboard/file-icon"
import { TFile } from "@/store/slices/files"

interface RenameDialogProps {
  file: TFile | null
  isOpen: boolean
  onClose: () => void
  onRename: (fileId: string, newName: string) => void
  existingNames?: string[]
}

export function RenameDialog({ file, isOpen, onClose, onRename, existingNames = [] }: RenameDialogProps) {
  const [newName, setNewName] = useState("")
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (file) {
      setNewName(file.fileName)
      setError(null)
    }
  }, [file])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newName.trim()) {
      setError("Name cannot be empty")
      return
    }
    
    if (file?.type !== "folder") {
      // For files, preserve the extension
      const currentExt = file?.fileName.split(".").pop()
      const newNameBase = newName.includes(".") ? newName.split(".").slice(0, -1).join(".") : newName
      
      if (existingNames.includes(`${newNameBase}.${currentExt}`)) {
        setError(`A file named "${newNameBase}.${currentExt}" already exists`)
        return
      }
      
      if (file) {
        onRename(file.fileId, `${newNameBase}.${currentExt}`)
      }
    } else {
      // For folders
      if (existingNames.includes(newName)) {
        setError(`A folder named "${newName}" already exists`)
        return
      }
      
      if (file) {
        onRename(file.fileId, newName)
      }
    }
    
    onClose()
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {file && <FileIcon fileName={file.fileName} fileType={file.type} className="w-5 h-5" outerClassName="p-1" />}
            Rename {file?.type === "folder" ? "Folder" : "File"}
          </DialogTitle>
          <DialogDescription>
            Enter a new name for this {file?.type === "folder" ? "folder" : "file"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value)
                  setError(null)
                }}
                className={error ? "border-destructive" : ""}
                autoFocus
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Rename</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}