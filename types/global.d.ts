import { Document, Types } from "mongoose"
import { NextApiRequest } from "next"
import { createClient, RedisClientType } from 'redis';
import type { File } from "@/lib/models/upload";
import { NotificationType } from "@/common/enums/notification-types";

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

  namespace Statistics {
    interface Trash {
      items: number
      size: number
    }
  }

  namespace AppSettings {
    interface Appearance {
      theme: string
      language: string
      timezone: string
    }

    interface Notifications {
      email: boolean,
      push: boolean,
      sharing: boolean,
      comments: boolean,
      storageWarning: boolean
    }
    interface Privacy {
      twoFactorEnabled: boolean,
      publicLinks: boolean,
      deviceHistory: boolean,
      activityLog: boolean
    }
    interface Storage {
      limit: number
      plan: "free" | "pro" | "enterprise";
      status: "active" | "inactive" | "cancelled" | "past_due";
      autoRenew: boolean;
      trash: Statistics.Trash | null;
      used: number | null;
    }
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
        sharing: boolean,
        comments: boolean,
      }
    }
    security: {
      twoFactorEnabled: boolean
      lastPasswordChange: Date
      passwordHistory: string[]
      failedLoginAttempts: number
      lockoutUntil?: Date
      publicLinks: boolean
      deviceHistory: boolean
      activityLog: boolean
    }
    authType: 'password' | 'oauth'
    authProvider: 'google' | 'github' | 'facebook' | 'twitter' | 'microsoft' | 'apple' | 'linkedin' | 'yahoo' | null
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
    toSafeObject(): IUser
  }

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

  /**
 * Interface representing the payload for a notification.
 */
  interface NotificationPayload {
    recipient: Types.ObjectId;
    creator?: Types.ObjectId;
    entity: {
      entityId: Types.ObjectId;
      entityType: "File" | "User" | "Shared";
    };
    type: NotificationType;
    message: string;
    metadata?: Record<string, any>;
  }

  type Duration = "week" | "last-week" | "month" | "last-month" | "year" | "last-year"
  interface Bandwidth {
    upload: number;
    download: number;
    preview: number;
    total: number;
  }

  interface AnalyticsOverviewComparison {
    bandwidth: {
      type: "inc" | "dec";
      value: number;
    };
    averageResponseTimeMs: {
      type: "inc" | "dec";
      value: number;
    };
    storageUsed: {
      type: "inc" | "dec";
      value: number;
    };
    userEngagement: {
      type: "inc" | "dec";
      value: number;
    };
  }
  interface UserEngagement {
    download: number
    preview: number
    total: number
  }
  interface AnalyticsOverview extends AppSettings.Storage {
    bandwidth: Bandwidth;
    averageResponseTimeMs: number;
    totalRequests: any;
    userEngagement: UserEngagement;
    comparisons: AnalyticsOverviewComparison
  }
}

declare module "next" {
  interface NextApiRequest {
    user?: IUser & {
      userId: string;
      email: string;
      role?: string;
    };
  }
}