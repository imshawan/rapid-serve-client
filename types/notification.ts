import { z } from "zod"
import type { Notification } from "@/lib/models/notification"

export const WebSocketMessageSchema = z.object({
  type: z.enum(["notification", "connection", "error"]),
  payload: z.unknown(),
})

export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>

export type NotificationEvent = {
  type: "notification"
  payload: Partial<Notification>
}

export const ConnectionEventSchema = z.object({
  type: z.literal("connection"),
  payload: z.object({
    status: z.enum(["connected", "disconnected"]),
    message: z.string(),
  }),
})

export type ConnectionEvent = z.infer<typeof ConnectionEventSchema>

export const ErrorEventSchema = z.object({
  type: z.literal("error"),
  payload: z.object({
    code: z.string(),
    message: z.string(),
  }),
})

export type ErrorEvent = z.infer<typeof ErrorEventSchema>