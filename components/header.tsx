"use client"

import { Fragment, use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
    Cloud,
    CreditCard,
    Settings,
    User,
    LogOut,
    HelpCircle,
    Bell,
    Search,
    Filter,
    Menu,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { SearchDialog } from "./ui/search-dialog"
import { toggleSidebar } from "@/store/slices/app"
import { useAppDispatch } from "@/store"
import useScreenSize from "@/hooks/use-screen-size"

export function Header() {
    const router = useRouter()
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const { user, logout } = useAuth()
    const dispatch = useAppDispatch()
    const {screenSize} = useScreenSize()

    const handleLogout = () => {
        logout(() => router.push("/login"))
    }

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

    const userNavigation = [
        { name: "Profile", href: "/dashboard/profile", icon: User },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
        { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    ]

    const handleSidebarToggle = () => {
        dispatch(toggleSidebar(null))
    }

    useEffect(() => {
        if (screenSize === "xs" || screenSize === "sm") {
            dispatch(toggleSidebar(false))
        } else {
            dispatch(toggleSidebar(true))
        }
    }, [screenSize])

    return (
        <Fragment>
            <header className="border-b bg-card sticky top-0 z-50">
                <div className="flex h-16 justify-between items-center px-4 gap-x-4">
                    <div className="flex">
                        <Button variant="ghost" size="icon" onClick={handleSidebarToggle}>
                            <Menu className="h-6 w-6" />
                        </Button>
                        {/* Logo */}
                        <div className="flex hidden sm:flex items-center">
                            <span className="text-xl font-semibold">RapidServe</span>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        {/* Search Bar */}
                        <div className="flex-1 max-w-2xl mr-2">
                        
                            <div className="relative hidden sm:block">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search files and folders..."
                                    className="pl-10 w-full"
                                    onFocus={() => setIsSearchOpen(true)}
                                />
                            </div>
                        </div>
                        {/* Right side items */}
                        <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="relative sm:hidden flex justify-center" onClick={() => setIsSearchOpen(true)}>
                            <Search className="h-5 w-5" />
                        </Button>
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
                                                className={`p-4 rounded-lg border ${notification.unread ? "bg-muted" : ""
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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative ml-2 h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user?.profilePicture} alt={user?.name} />
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
                                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
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
            <SearchDialog isOpen={isSearchOpen} setIsOpen={() => setIsSearchOpen(!isSearchOpen)} />
        </Fragment>
    )
}