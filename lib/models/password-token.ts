
import mongoose, { Schema, InferSchemaType } from 'mongoose'
import config from "@/config/app.json"
import ms from "ms"

const passwordTokenExpiry = ms((config.passwordTokenExpiration || '1h') as ms.StringValue)

const passwordResetSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: passwordTokenExpiry
  },
  expiresAt: {
    type: Date,
    default: function () {
      return new Date(Date.now() + passwordTokenExpiry)
    }
  }
})

export const PasswordResetToken = mongoose.model<PasswordResetToken>('PasswordResetToken', passwordResetSchema)

export type PasswordResetToken = InferSchemaType<typeof passwordResetSchema>