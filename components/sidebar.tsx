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
import { useAppSelector } from "@/store/store"

export function Sidebar() {
    const pathname = usePathname()
    const {sidebarOpen} = useAppSelector(state => state.app)

    const navigation = [
        { name: "My Drive", href: "/dashboard", icon: Files },
        { name: "Shared", href: "/dashboard/shared", icon: Share2 },
        { name: "Recent", href: "/dashboard/recent", icon: Clock },
        { name: "Starred", href: "/dashboard/starred", icon: Star },
        { name: "Trash", href: "/dashboard/trash", icon: Trash2 },
      ]

    return (
        <aside className={`w-64 border-r bg-card h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300 ${sidebarOpen ? '' : '-ml-64'}`}>
          <div className="p-4 space-y-4">
            <Dialog>
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
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
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
                    className={`
                      flex items-center px-3 py-2 rounded-lg text-sm font-medium
                      ${isActive 
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }
                    `}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <div className="pt-4 border-t">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase">
                  Storage
                </div>
                <div className="space-y-2">
                  <div className="text-sm">23.4 GB of 100 GB used</div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '23.4%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
    )
}