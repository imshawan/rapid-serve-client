import { z } from "zod"

export const WebSocketMessageSchema = z.object({
  type: z.enum(["notification", "connection", "error"]),
  payload: z.unknown(),
})

export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>

export const NotificationEventSchema = z.object({
  type: z.literal("notification"),
  payload: z.object({}),
})

export type NotificationEvent = z.infer<typeof NotificationEventSchema>

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