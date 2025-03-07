import mongoose, { InferSchemaType } from "mongoose"

const recentSchema = new mongoose.Schema({
  fileId: {
    type: String,
    ref: "File",
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  }, // Per-user tracking
  fileName: {
    type: String,
    required: true,
  },
  isStarred: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ["file", "folder"],
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  accessCount: {
    type: Number,
    default: 1
  }, // Counts number of times accessed
  lastAccessed: {
    type: Date,
    required: true,
  },
  device: {
    type: String
  }, // E.g., mobile, desktop
  ipAddress: {
    type: String
  },
  accessedFrom: {
    type: String
  }, // E.g., "web", "mobile"
}, {
  timestamps: true,
})

// Index for faster retrieval
recentSchema.index({ lastAccessed: -1 })

export const Recent = mongoose.models.Recent || mongoose.model("Recent", recentSchema)
export type Recent = InferSchemaType<typeof recentSchema>