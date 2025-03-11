import softDelete, { SoftDeleteModel } from '@/lib/db/plugins/soft-delete';
import mongoose, { InferSchemaType, Document } from 'mongoose';

const chunkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    index: true
  },
  fileId: {
    type: String,
    required: true,
    index: true,
  },
  hash: {
    type: String,
    required: true,
  },
  storageNode: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
}, { timestamps: true });

chunkSchema.plugin(softDelete)

export type Chunk = InferSchemaType<typeof chunkSchema>;

export const Chunk = (mongoose.models.Chunk as SoftDeleteModel<Chunk & Document>) || mongoose.model<Chunk, SoftDeleteModel<Chunk & Document>>('Chunk', chunkSchema);