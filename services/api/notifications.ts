import { http } from "@/lib/api/http";
import { endpoints } from "./endpoints";
import { parseRouteParams } from "@/lib/utils/common";
import type { Notification } from "@/lib/models/notification";

export const notifications = {
  load: async (page: number, limit: number = 20) => {
    let query: any = { limit: String(limit), page: String(page) };

    let queryParams = new URLSearchParams(query).toString();
    return (await http.get(
      parseRouteParams(endpoints.LOAD_NOTIFICATIONS, { queryParams })
    )) as ApiResponse<{
      paginated: Pagination;
      notifications: Notification[];
      unreadCount: number;
    }>;
  },

  markRead: async (id: string) => {
    return await http.post(
      parseRouteParams(endpoints.MARK_NOTIFICATION_AS_READ, { notificationId: id }), {}
    ) as ApiResponse<{ unreadCount: number }>
  },

  markAllRead: async () => {
    return await http.post(endpoints.MARK_NOTIFICATIONS_AS_READ, {}) as ApiResponse<any>
  },
};
