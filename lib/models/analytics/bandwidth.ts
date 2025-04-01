import mongoose, { InferSchemaType, Document } from "mongoose";

const bandwidthTrackerSchema = new mongoose.Schema(
  {
    fileId: { type: String, required: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    callerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["upload", "download", "preview"], required: true },
    resourceType: { type: String, enum: ["file", "folder"], required: true },
    size: { type: Number, required: true },
    chunkId: { type: mongoose.Schema.Types.ObjectId, ref: "Chunk", default: null },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
)

export const Bandwidth =
  (mongoose.models.bandwidth) || mongoose.model<Bandwidth & Document>(
    "bandwidth",
    bandwidthTrackerSchema
  )

export type Bandwidth = InferSchemaType<typeof bandwidthTrackerSchema>