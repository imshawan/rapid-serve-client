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
};
