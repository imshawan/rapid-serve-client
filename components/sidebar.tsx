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
  Files,
  Share2,
  Plus,
  Clock,
  Star,
  Trash2,
  FolderPlus,
  Upload,
  FileText,
} from "lucide-react"
import { useAppSelector } from "@/store"
import { useFiles } from "@/hooks/use-files"
import type { File } from "@/lib/models/upload"
import { toast } from "@/hooks/use-toast"
import { useMemo, useState } from "react"
import { CreateFolderDialog } from "./create-folder-dialog"
import { useAuth } from "@/hooks/use-auth"
import { formatBytes } from "@/lib/utils/common"
import { Progress } from "./ui/progress"

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen } = useAppSelector(state => state.app)
  const { appendUpdatedFile } = useFiles()
  const {user} = useAuth()

  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [open, setOpen] = useState(false)

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

  const createFolder = (name: string) => {
    const newFolder = {
      fileId: crypto.randomUUID(),
      fileName: name,
      fileSize: 0,
      isStarred: false,
      type: "folder",
      status: "complete",
      parentId: "", // Root level folder
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    appendUpdatedFile(newFolder as File)

    toast({
      title: "Folder created",
      description: `"${name}" has been created successfully.`,
    })
  }

  const navigation = [
    { name: "My Drive", href: "/dashboard", icon: Files },
    { name: "Shared", href: "/dashboard/shared", icon: Share2 },
    { name: "Recent", href: "/dashboard/recent", icon: Clock },
    { name: "Starred", href: "/dashboard/starred", icon: Star },
    { name: "Trash", href: "/dashboard/trash", icon: Trash2 },
  ]

  return (
    <aside className={`w-64 border-r bg-card h-[calc(100vh-4.1rem)] sticky top-16 transition-all duration-300 ${sidebarOpen ? '' : '-ml-64'}`}>
      <div className="p-4 space-y-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full justify-start" size="sm">
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
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
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
    </aside>
  )
}