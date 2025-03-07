import softDelete, { SoftDeleteModel } from '@/lib/db/plugins/soft-delete'
import mongoose, { InferSchemaType, Document } from 'mongoose'

const fileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    index: true
  },
  fileId: {
    type: String,
    required: true,
    unique: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
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
  chunkHashes: [{
    type: String,
  }],
  storageNode: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "complete"],
    default: "pending",
  },
  parentId: {
    type: String,
    default: null,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  isShared: {
    type: Boolean,
    default: false,
  },
  downloads: {
    type: Number,
    default: 0,
  },
  lastDownloaded: {
    type: Date,
  },
  accessedFrom: {
    type: String,
  },
  lastAccessed: {
    type: Date,
  },
  accessCount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
})

fileSchema.plugin(softDelete)

export const File = (mongoose.models.File as SoftDeleteModel<File & Document>) || mongoose.model<File, SoftDeleteModel<File & Document>>("File", fileSchema)

export type File = InferSchemaType<typeof fileSchema>