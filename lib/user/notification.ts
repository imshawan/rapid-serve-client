import { Types } from "mongoose";
import { Notification as NotificationModel } from "@/lib/models/notification";
import type { Notification } from '@/lib/models/notification';
import { sendMessageToUser } from "@/server/websocket";

export const sendNotificationToUser = async (notification: Partial<Notification>) => {
  let {recipient} = notification
  if (!recipient) return;

  await NotificationModel.create({
    ...notification,
    recipient: new Types.ObjectId(String(recipient)),
  })

  // Send notification to user via websocket
  sendMessageToUser(String(recipient), "notification", notification)
}