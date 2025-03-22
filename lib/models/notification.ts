import mongoose, { Schema, Types, InferSchemaType, Document } from "mongoose";
import softDelete, { SoftDeleteModel } from "@/lib/db/plugins/soft-delete";
import { NotificationType } from "@/common/enums/notification-types";

const notificationSchema = new Schema(
  {
    recipient: { type: Types.ObjectId, ref: "User", required: true }, // User receiving the notification
    creator: { type: Types.ObjectId, ref: "User", default: null }, // User triggering the notification
    entity: {
      entityId: { type: Types.ObjectId, required: true }, // Related entity (file, user, etc.)
      entityType: {
        type: String,
        required: true,
        enum: ["File", "User", "Shared"],
      },
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    message: { type: String, required: true }, // Readable message for UI
    metadata: { type: Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

notificationSchema.plugin(softDelete);

export type Notification = InferSchemaType<typeof notificationSchema>
export const Notification =
  (mongoose.models.Notification as SoftDeleteModel<Notification & Document>) ||
  mongoose.model<Notification, SoftDeleteModel<Notification & Document>>("Notification", notificationSchema)
