import mongoose, { InferSchemaType } from "mongoose";

const UploadTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  fileId: { type: String, required: true },
  hash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }, // TTL index
});


export const Token = mongoose.models.Token || mongoose.model('Token', UploadTokenSchema);

export type Token = InferSchemaType<typeof UploadTokenSchema>;