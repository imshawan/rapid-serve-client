import { Document } from "mongoose"
import { NextApiRequest } from "next"
import { createClient, RedisClientType } from 'redis';

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

    interface File {
        id: string
        name: string
        type: string
        size: string
        modified: string
        path: string
        isStarred: boolean
        isDeleted: boolean
        deletedAt?: string
        originalPath?: string
      }
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