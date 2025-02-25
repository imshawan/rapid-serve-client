import mongoose, { InferSchemaType } from 'mongoose';

const chunkSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  fileId: {
    type: String,
    required: true,
    index: true,
  },
  hash: {
    type: String,
    required: true,
    unique: true,
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

export const Chunk = mongoose.models.Chunk || mongoose.model('Chunk', chunkSchema);

export type Chunk = InferSchemaType<typeof chunkSchema>;