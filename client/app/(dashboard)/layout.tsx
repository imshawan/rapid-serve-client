"use client"

import { Fragment, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Cloud,
  CreditCard,
  Files,
  Settings,
  Share2,
  User,
  LogOut,
  Menu,
  HelpCircle,
  Bell,
  Search,
  Filter,
  Plus,
  Clock,
  Star,
  Trash2,
  FolderPlus,
  Upload,
  FileText,
  File,
  Folder,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/app/auth/auth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navigation = [
    { name: "My Drive", href: "/dashboard", icon: Files },
    { name: "Shared", href: "/dashboard/shared", icon: Share2 },
    { name: "Recent", href: "/dashboard/recent", icon: Clock },
    { name: "Starred", href: "/dashboard/starred", icon: Star },
    { name: "Trash", href: "/dashboard/trash", icon: Trash2 },
  ]

  const userNavigation = [
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  ]

  const notifications = [
    {
      id: 1,
      title: "File shared with you",
      description: "John Doe shared 'Project Proposal.pdf' with you",
      time: "2 minutes ago",
      unread: true,
    },
    {
      id: 2,
      title: "Storage limit warning",
      description: "You're approaching your storage limit",
      time: "1 hour ago",
      unread: false,
    },
  ]

  const searchResults = [
    {
      type: "files",
      items: [
        { id: 1, name: "Document.pdf", icon: FileText },
        { id: 2, name: "Image.jpg", icon: File },
      ],
    },
    {
      type: "folders",
      items: [
        { id: 1, name: "Projects", icon: Folder },
        { id: 2, name: "Documents", icon: Folder },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="flex h-16 items-center px-4 gap-x-4">
          {/* Logo */}
          <div className="flex items-center">
            <Cloud className="h-6 w-6 text-primary mr-2" />
            <span className="text-xl font-semibold">RapidServe</span>
          </div>

          <div className="flex w-full justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files and folders..."
                  className="pl-10 w-full"
                  onFocus={() => setIsSearchOpen(true)}
                />
                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Right side items */}
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.some(n => n.unread) && (
                      <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Notifications</SheetTitle>
                    <SheetDescription>Stay updated with your latest activities</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${
                          notification.unread ? "bg-muted" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {notification.description}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {notification.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {userNavigation.map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link href={item.href} className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Search Dialog */}
      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <CommandInput placeholder="Type to search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchResults.map((group, i) => (
            <Fragment key={'-' + i}>
              <CommandGroup heading={group.type === "files" ? "Files" : "Folders"}>
                {group.items.map((item) => (
                  <CommandItem key={item.id}>
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </Fragment>
          ))}
        </CommandList>
      </CommandDialog>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`w-64 border-r bg-card h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300 ${isSidebarOpen ? '' : '-ml-64'}`}>
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

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}