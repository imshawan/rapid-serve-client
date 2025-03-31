"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Share2,
  Plus,
  FolderPlus,
  Upload,
  FileText,
} from "lucide-react"
import { useFiles } from "@/hooks/use-files"
import { toast } from "@/hooks/use-toast"
import { useMemo, useState } from "react"
import { CreateFolderDialog } from "./create-folder-dialog"
import { useAuth } from "@/hooks/use-auth"
import { cn, formatBytes } from "@/lib/utils/common"
import { Progress } from "./ui/progress"
import { navigation } from "@/common/paths"
import { UploadDialog } from "./upload-dialog"
import { useApp } from "@/hooks/use-app"

export function Sidebar() {
  const pathname = usePathname()
  const { createFolder: createFolderRequest } = useFiles()
  const {sidebarOpen} = useApp()
  const { user } = useAuth()

  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const [uploadModal, setUploadModal] = useState(false)

  const used = useMemo(() => formatBytes(Number(user?.storageUsed || 0)), [user])
  const total = useMemo(() => formatBytes(Number(user?.storageLimit || 0)), [user])
  const percentage = useMemo(() => {
    const used = Number(user?.storageUsed || 0)
    const total = Number(user?.storageLimit || 0)
    return Math.round((used / total) * 100)
  }, [user])

  const handleCreateFolder = () => {
    setCreateFolderOpen(true)
    setOpen(false)
  }

  const handleUpload = () => {
    setUploadModal(true)
    setOpen(false)
  }

  const createFolder = (name: string) => {
    createFolderRequest(name, undefined, () => {
      toast({
        title: "Folder created",
        description: `"${name}" has been created successfully.`,
      })
    }, () => {})
  }

  return (
    <aside className={cn(
      "w-64 border-r bg-card h-[calc(100vh-4.1rem)] fixed sm:sticky top-16 transition-all duration-300",
      "left-0 sm:left-auto z-40 sm:z-0",
      sidebarOpen ? "translate-x-0" : "sm:-ml-64 -translate-x-full",
      "lg:translate-x-0 lg:block"
    )}>
      <div className="p-4 space-y-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full justify-start h-10" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New</DialogTitle>
              <DialogDescription>Choose what you want to create</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" onClick={handleCreateFolder}>
                <FolderPlus className="h-8 w-8" />
                New Folder
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" onClick={handleUpload}>
                <Upload className="h-8 w-8" />
                Upload Files
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                <FileText className="h-8 w-8" />
                New Document
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                <Share2 className="h-8 w-8" />
                Request Files
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium
                      ${isActive ? "bg-secondary border text-secondary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {user && <div className="pt-4 border-t">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase">
              Storage
            </div>
            <div className="space-y-2">
              <div className="text-sm">{used} of {total} used</div>
              <Progress value={percentage} className="h-3" />
            </div>
          </div>
        </div>}
      </div>

      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        onCreateFolder={createFolder}
      />

      <UploadDialog open={uploadModal} setOpen={setUploadModal} />
    </aside>
  )
}