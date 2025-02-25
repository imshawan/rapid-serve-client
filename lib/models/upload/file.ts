import mongoose, { InferSchemaType } from 'mongoose';

const fileSchema = new mongoose.Schema({
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
  chunkHashes: [{
    type: String,
    required: true,
  }],
  storageNode: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'complete'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

export const File = mongoose.models.File || mongoose.model('File', fileSchema);

export type File = InferSchemaType<typeof fileSchema>;