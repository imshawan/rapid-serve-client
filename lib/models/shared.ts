import mongoose, { InferSchemaType, Document } from "mongoose"
import softDelete, { SoftDeleteModel } from "@/lib/db/plugins/soft-delete"

const sharedSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sharedWith: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        accessLevel: {
          type: String,
          enum: ["viewer", "editor", "owner"],
          default: "viewer",
        },
        sharedAt: {
          type: Date,
          default: () => new Date(),
        },
      },
    ],
    linkShared: {
      type: Boolean,
      default: false,
    },
    linkAccessLevel: {
      type: String,
      enum: ["viewer", "editor"],
      default: "viewer",
    },
    expirationDate: {
      type: Date,
      default: null,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastDownloaded: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
sharedSchema.index({ fileId: 1, ownerId: 1 })
sharedSchema.index({ "sharedWith.userId": 1 })
sharedSchema.index({ expirationDate: 1 })

sharedSchema.plugin(softDelete)

export const Shared =
  (mongoose.models.Shared as SoftDeleteModel<Shared & Document>) ||
  mongoose.model<Shared, SoftDeleteModel<Shared & Document>>(
    "Shared",
    sharedSchema
  )

export type Shared = InferSchemaType<typeof sharedSchema>
