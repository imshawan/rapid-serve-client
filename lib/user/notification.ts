import { Types } from "mongoose";
import { Notification as NotificationModel } from "@/lib/models/notification";
import type { Notification } from '@/lib/models/notification';
import { sendMessageToUser } from "@/server/websocket";
import { withCache } from "../db";
import { User } from "../models/user";

export const sendNotificationToUser = async (notification: Partial<Notification>) => {
  let {recipient} = notification
  if (!recipient) return;

  const payload: any = {
    ...notification,
    recipient: new Types.ObjectId(String(recipient)),
  }

  await NotificationModel.create(payload)

  const userId = notification.creator
  const sender = await withCache<IUser | null>("user:" + String(userId), async () => await User.findById(userId))
  if (sender) {
    payload.creator = {
      name: sender.name,
      email: sender.email,
      profilePicture: sender.profilePicture,
    }
  }

  payload.createdAt = new Date()
  payload.isRead = false

  // Send notification to user via websocket
  sendMessageToUser(String(recipient), "notification", payload)
}