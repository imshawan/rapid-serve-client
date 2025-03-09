import mongoose, { InferSchemaType, Document } from "mongoose"
import bcrypt from "bcryptjs"
import softDelete, { SoftDeleteModel } from "@/lib/db/plugins/soft-delete"
import filterSensitiveData from "../db/plugins/filter-sensitive-data"

const sharedSchema = new mongoose.Schema(
  {
    fileId: {
      type: String,
      ref: "File",
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
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
          enum: ["viewer", "editor", "full"],
          default: "viewer",
        },
        sharedAt: {
          type: Date,
          default: () => new Date(),
        },
      },
    ],
    isPasswordProtected: {
      type: Boolean,
      default: false,
    },
    passwordHash: {
      type: String, // Hashed password (same for all users)
      default: null,
    },
    linkShared: {
      type: Boolean,
      default: false,
    },
    shareId: {
      type: String,
      required: false
    },    
    linkAccessLevel: {
      type: String,
      enum: ["viewer", "editor", "full"],
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

const sensitiveFields = {
  passwordHash: 0,
}

// Indexes for efficient queries
sharedSchema.index({ fileId: 1, ownerId: 1 })
sharedSchema.index({ "sharedWith.userId": 1 })
sharedSchema.index({ expirationDate: 1 })

// Hash password before saving (if password-protected)
sharedSchema.pre("save", async function (next) {
  if (this.linkShared && !this.shareId) {
    return next(new Error("shareId is required when linkShared is true"));
  }
  if (this.isModified("passwordHash") && this.passwordHash) {
    const salt = await bcrypt.genSalt(10)
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt)
  }
  next()
});

sharedSchema.plugin(softDelete)
sharedSchema.plugin((schema) => filterSensitiveData(sensitiveFields, schema))

export const Shared =
  (mongoose.models.Shared as SoftDeleteModel<Shared & Document>) ||
  mongoose.model<Shared, SoftDeleteModel<Shared & Document>>(
    "Shared",
    sharedSchema
  )

export type Shared = InferSchemaType<typeof sharedSchema>