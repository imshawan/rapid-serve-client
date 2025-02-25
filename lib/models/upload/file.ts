import softDelete from "@/lib/db/plugins/soft-delete";
import mongoose, { InferSchemaType } from "mongoose";

const fileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
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
}, {
  timestamps: true,
});

fileSchema.plugin(softDelete)

export const File = mongoose.models.File || mongoose.model("File", fileSchema);

export type File = InferSchemaType<typeof fileSchema>;