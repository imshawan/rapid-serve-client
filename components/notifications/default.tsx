import { useNotifications } from "@/hooks/use-notifications"
import type { Notification } from "@/lib/models/notification"
import { cn, timeAgo } from "@/lib/utils/common"
import { Eye } from "lucide-react"

interface DefaultProps {
  notification: Notification & { creator: Partial<IUser>, _id: string }
  markAsRead?: (notificationId: string) => void
}

export default function Default({ notification, markAsRead }: DefaultProps) {
  const {markingRead} = useNotifications()
  
  const handleRead = () => {
    if (markAsRead && !notification.isRead) {
      markAsRead(notification._id)
    }
  }

  return (
    <div
      key={notification._id}
      className={cn("flex items-start p-4 hover:bg-gray-50 transition-colors", notification.isRead ? "bg-white" : "bg-blue-50")}
    >
      <img
        src={notification.creator.profilePicture}
        alt=""
        className="w-8 h-8 rounded-full mr-3 flex-shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="flex justify-between items-start">
          <p className="text-sm text-gray-900">
            <span className="font-medium">{notification.creator.name}</span>
            <span className="text-gray-500"> shared </span>
            <span className="font-medium">{notification.metadata.fileName}</span>
          </p>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <a
            href={notification.metadata.link}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View
          </a>
          {!notification.isRead && (
            <button
              onClick={handleRead}
              className="text-xs text-gray-500 hover:text-gray-700"
              disabled={markingRead === notification._id || markingRead === "all"}
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  )
}