import mongoose, { InferSchemaType } from 'mongoose';
import bcrypt from 'bcryptjs';
import { lruCache, redis } from '../db';
import app from "@/config/app.json"
import { parseSizeToBytes } from '../utils/common';
import filterSensitiveData from '../db/plugins/filter-sensitive-data';

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    profilePicture: {
      type: String,
      default: '',
    },
    storageUsed: {
      type: Number,
      default: 0,
    },
    storageLimit: {
      type: Number,
      default: parseSizeToBytes(app.maxStoragePerUser)
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      language: {
        type: String,
        default: 'en',
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
        storageWarning: {
          type: Boolean,
          default: true,
        },
        sharing: {
          type: Boolean,
          default: true,
        },
        comments: {
          type: Boolean,
          default: true,
        },
      },
    },
    security: {
      twoFactorEnabled: {
        type: Boolean,
        default: false,
      },
      lastPasswordChange: {
        type: Date,
        default: Date.now,
      },
      passwordHistory: [String],
      failedLoginAttempts: {
        type: Number,
        default: 0,
      },
      lockoutUntil: Date,
      deviceHistory: {
        type: Boolean,
        default: false,
      },
      publicLinks: {
        type: Boolean,
        default: false,
      },
      activityLog: {
        type: Boolean,
        default: false,
      },
    },
    authType: {
      type: String,
      enum: ['password', 'oauth'],
      default: 'password'
    },
    authProvider: {
      type: String,
      enum: ['google', 'github', 'facebook', 'twitter', 'microsoft', 'apple', 'linkedin', 'yahoo'],
      default: null
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled', 'past_due'],
        default: 'active',
      },
      startDate: Date,
      endDate: Date,
      autoRenew: {
        type: Boolean,
        default: true,
      },
    },
    devices: [{
      id: {
        type: String,
        required: true,
      },
      name: String,
      type: String,
      lastActive: {
        type: Date,
        default: Date.now,
      },
      ipAddress: String,
      userAgent: String,
    }],
  },
  {
    timestamps: true,
  }
);

const sensitiveFields = {
  password: 0,
  authType: 0,
  "security.twoFactorSecret": 0,
  "security.passwordHistory": 0,
  "security.failedLoginAttempts": 0,
  "security.lockoutUntil": 0
};

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.authType === 'oauth') return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    // Store password in history
    if (!this.security.passwordHistory) {
      this.security.passwordHistory = [];
    }
    this.security.passwordHistory.push(this.password);

    // Keep only last 5 passwords
    if (this.security.passwordHistory.length > 5) {
      this.security.passwordHistory.shift();
    }

    this.security.lastPasswordChange = new Date();
    next();
  } catch (error: any) {
    next(error);
  }
});

// Invalidate the cache after delete operations
["findOneAndDelete", "deleteOne"].forEach((hook: any) => {
  userSchema.post(hook, async function (doc) {
    let key = String(doc._id)

    // Delete from LRU Cache
    lruCache.delete(key)

    // Delete from Redis
    await redis?.del(key)
  })
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.plugin((schema) => filterSensitiveData(sensitiveFields, schema))

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export type User = InferSchemaType<typeof userSchema>