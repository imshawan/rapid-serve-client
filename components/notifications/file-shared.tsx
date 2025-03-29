import type { Notification } from "@/lib/models/notification"
import { cn, timeAgo } from "@/lib/utils/common"
import { Check, Eye } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import FileIcon from "../dashboard/file-icon"

interface FileSharedProps {
  notification: Notification & { creator: Partial<IUser>, _id: string }
  markAsRead?: (notificationId: string) => void
}

export default function FileShared({ notification, markAsRead }: FileSharedProps) {
  const handleRead = () => {
    if (markAsRead && !notification.isRead) {
      markAsRead(notification._id)
    }
  }

  return (
    <div
      key={notification._id}
      className={cn("relative rounded-lg border p-4 transition-all duration-200",
        notification.isRead ? 'bg-white border-gray-200' : 'bg-muted border-muted-200',
        "hover:shadow-md"
      )}
    >
      <div className="flex items-start space-x-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={notification.creator.profilePicture} alt={notification.creator.name} />
          <AvatarFallback>{notification.creator.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-900">
              <span className="font-medium">{notification.creator.name}</span>
              <span className="text-gray-500"> shared a {notification.metadata.type} with you</span>
            </p>

            <span className="text-xs text-gray-500">
              {timeAgo(notification.createdAt)}
            </span>
          </div>
          <div className="mt-2 flex items-center space-x-2 text-sm">
            <div className="flex w-full items-center space-x-2 bg-white px-3 py-1.5 rounded-md border border-gray-200">
              <FileIcon fileName={notification.metadata.fileName} fileType={notification.metadata.type} outerClassName="p-0" className="w-4 h-4" />
              <span className="truncate text-gray-700">{notification.metadata.fileName}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={handleRead}
              className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700"
            >
              {notification.isRead ? (
                <Check className="w-4 h-4 mr-1" />
              ) : (
                <Eye className="w-4 h-4 mr-1" />
              )}
              {notification.isRead ? 'Read' : 'Mark as read'}
            </button>
            <Link
              href={notification.metadata.link}
              className="text-xs font-medium text-gray-800 underline-offset-4 hover:underline transition"
            >
              View File
            </Link>

          </div>
        </div>
      </div>
    </div>
  )
}