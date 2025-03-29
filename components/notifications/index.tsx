"use client"

import { useEffect, Fragment } from "react"
import _ from "lodash"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useNotifications } from "@/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/common"
import { Bell,Inbox, Loader } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { renderers } from "./renderers"

export function NotificationsTray() {
  const { notifications, unreadCount, loadNotifications, currentPage, totalPages, loading } = useNotifications()

  const loadFreshData = () => {
    loadNotifications({ currentPage, limit: 10 })
  }

  const handleLoadMore = () => {
    loadNotifications({ currentPage: currentPage + 1, limit: 10 })
  }

  const handleMarkAsRead = (id: string) => {
    console.log("Marking as read", id)
  }

  useEffect(() => {
    loadFreshData() // Load initial data
  }, [])

  return (
    <Fragment>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full h-full overflow-auto sm:max-w-md lg:max-w-lg">
          <SheetHeader>
            <SheetTitle>Notifications</SheetTitle>
            <SheetDescription>Stay updated with your latest activities</SheetDescription>
          </SheetHeader>
          <div className={cn("mt-6 space-y-4 min-h-[90%]")}>
            {/* Show Loader while fetching the first batch */}
            {loading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader className="h-6 w-6 animate-spin text-gray-500" />
                <p className="text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <EmptyState
                  icon={<Inbox className="h-6 w-6 text-gray-500" />}
                  title="No New Notifications"
                  description="Stay tuned for updates on your activities"
                  className="h-full min-h-full"
                />
              </div>
            ) : (
              // Notifications List
              notifications.map((notification) => {
                let { type } = notification
                const Renderer = renderers[type as keyof typeof renderers] || renderers.DEFAULT
                return <Renderer notification={notification as any} markAsRead={handleMarkAsRead} />
              })
            )}
          </div>
          {notifications.length > 0 && <div className="mt-4">
            <button
              onClick={handleLoadMore}
              disabled={loading || currentPage >= totalPages}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Bell className="w-4 h-4 mr-2" />
              )}
              Load More
            </button>
          </div>}
        </SheetContent>
      </Sheet>
    </Fragment>
  )
}