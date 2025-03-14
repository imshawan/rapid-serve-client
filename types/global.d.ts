import { Document, Types } from "mongoose"
import { NextApiRequest } from "next"
import { createClient, RedisClientType } from 'redis';
import type { File } from "@/lib/models/upload";

export { }

declare global {

  var mongoose: {
    conn: mongoose.Connection | null
    promise: Promise<mongoose.Connection> | null
  }

  var redis: RedisClientType | null;

  interface JwtClaims {
    userId: string;
    email: string;
    role: string;
  }

  type ViewMode = "grid" | "list";

  interface ApiResponse<T = any> {
    success: boolean
    data?: Error | T
    error?: {
      code: string
      message: string
      details?: any
    }
    meta: {
      timestamp: string
      path: string
      duration?: number
      status: number
    }
  }

  interface IUser extends Document {
    email: string
    password: string
    name: string
    role: 'user' | 'admin'
    profilePicture?: string
    storageUsed: number
    storageLimit: number
    isEmailVerified: boolean
    lastLogin: Date
    preferences: {
      theme: 'light' | 'dark' | 'system'
      language: string
      timezone: string
      notifications: {
        email: boolean
        push: boolean
        storageWarning: boolean
      }
    }
    security: {
      twoFactorEnabled: boolean
      twoFactorSecret?: string
      lastPasswordChange: Date
      passwordHistory: string[]
      failedLoginAttempts: number
      lockoutUntil?: Date
    }
    subscription: {
      plan: 'free' | 'pro' | 'enterprise'
      status: 'active' | 'inactive' | 'cancelled' | 'past_due'
      startDate?: Date
      endDate?: Date
      autoRenew: boolean
    }
    devices: Array<{
      id: string
      name: string
      type: string
      lastActive: Date
      ipAddress: string
      userAgent: string
    }>
    createdAt: Date
    updatedAt: Date
    comparePassword(candidatePassword: string): Promise<boolean>
  }

  // interface File {
  //   id: string
  //   name: string
  //   type: string
  //   size: string
  //   modified: string
  //   path: string
  //   isStarred: boolean
  //   isDeleted: boolean
  //   deletedAt?: string
  //   originalPath?: string
  // }

  interface UploadUrl {
    url: string;
    token: string;
  }

  interface StorageNode {
    id: string;
    name: string;
    region: string;
    status: 'active' | 'maintenance' | 'offline';
    bucket: string;
    replicationFactor: number;
    credentials?: {
      accessKeyId: string;
      secretAccessKey: string;
    };
    load: number; // Runtime property
  }

  interface UploadChunk {
    hash: string;
    token: string;
    size: number;
  }

  interface FileMetaResponse {
    success: boolean;
    chunks: UploadChunk[];
    file: File;
    mimeType: string;
  }

  interface FileUploadStatus {
    fileId: string;
    missingChunks: string[];
    existingChunks: string[];
    uploadChunks: UploadChunk[];
    file: File
  }

  interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
  }

  interface Pagination {
    data: any[];
    currentPage: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    navigation: {
      current: string;
      next: string | null;
      previous: string | null;
    };
    start: number;
    end: number;
  }

  interface SharedWithUser {
    userId: Types.ObjectId | Partial<User>;
    name: string
    email: string
    profilePicture: string
    accessLevel: "viewer" | "editor" | "full";
    sharedAt: Date;
  };

  type SharedFilePopulated = Omit<Shared, "sharedWith"> & {
    fileSize: number;
    fileType: string;
    fileId: string;

    /**
     * `sharedWith` is an array of populated users which will contain when I see shared files by me
     */
    sharedWith: SharedWithUser[];

    /**
     * `sharedBy` is an array of populated users which I will see when the file has been shared by someone else
     */
    sharedBy?: SharedWithUser[]
  };

  interface Breadcrumb {
    fileId: string;
    fileName: string;
    parentId: string;
  }

  type Sort = "ASC" | "DESC"

  type SortBy<T> = keyof T;
}

declare module "next" {
  interface NextApiRequest {
    user?: {
      userId: string;
      email: string;
      role?: string;
    };
  }
}