import { Notification } from "@/lib/models/notification"
import { Types } from "mongoose";

/**
 * The NotificationService class provides methods to create, read, and update notifications.
 * 
 * @class NotificationService
 * @example
 * // Example usage:
 * const notifications = await NotificationService.getUserNotifications(userId);
 */
export class NotificationService {
	/**
	 * Create a new notification
	 */
	static async createNotification(payload: NotificationPayload): Promise<void> {
		try {
			const notification = new Notification({
				recipient: payload.recipient,
				creator: payload.creator,
				entity: payload.entity,
				type: payload.type,
				message: payload.message,
				metadata: payload.metadata || {},
			});

			await notification.save();

			// TODO: Emit via WebSockets or push notifications
		} catch (error) {
			console.error("❌ Error creating notification:", error);
		}
	}

	/**
	 * Mark notifications as read for a user
	 */
	static async markAsRead(notificationId: Types.ObjectId): Promise<void> {
		await Notification.findByIdAndUpdate(notificationId, { isRead: true });
	}

	/**
	 * Get unread notifications for a user with pagination
	 */
	static async getUnreadNotifications(userId: Types.ObjectId, start = 0, end = 20) {
		const totalCount = await Notification.countDocuments({ recipient: userId, isRead: false });

		const notifications = await Notification.find({ recipient: userId, isRead: false })
			.sort({ createdAt: -1 })
			.skip(start)
			.limit(end - start);

		return { data: notifications, total: totalCount };
	}

	/**
	 * Get all notifications for a user with pagination
	 */
	static async getUserNotifications(userId: Types.ObjectId, start = 0, end = 20) {
		const totalCount = await Notification.countDocuments({ recipient: userId });

		const notifications = await Notification.find({ recipient: userId })
			.sort({ createdAt: -1 })
			.skip(start)
			.limit(end - start);

		return { data: notifications, total: totalCount };
	}
}