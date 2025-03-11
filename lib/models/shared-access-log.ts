import mongoose, { InferSchemaType, Document } from "mongoose"
import softDelete, { SoftDeleteModel } from "@/lib/db/plugins/soft-delete"

const sharedFileAccessLogSchema = new mongoose.Schema(
  {
    sharedFileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SharedFile",
      required: true,
      index: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    accessedAt: { type: Date, default: Date.now },
    ipAddress: { type: String },
    device: { type: String },
  },
  { timestamps: true }
)

sharedFileAccessLogSchema.index({ sharedFileId: 1, accessedAt: -1 })

sharedFileAccessLogSchema.plugin(softDelete)

export const SharedFileAccessLog =
  (mongoose.models.SharedFileAccessLog as SoftDeleteModel<SharedFileAccessLog & Document>) ||
  mongoose.model<SharedFileAccessLog, SoftDeleteModel<SharedFileAccessLog & Document>>("SharedFileAccessLog", sharedFileAccessLogSchema)

export type SharedFileAccessLog = InferSchemaType<typeof sharedFileAccessLogSchema>