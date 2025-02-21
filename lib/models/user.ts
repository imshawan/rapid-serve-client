import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { lruCache, redis } from '../db';

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
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters long'],
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
            default: 5 * 1024 * 1024 * 1024, // 5GB for free users
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
            },
        },
        security: {
            twoFactorEnabled: {
                type: Boolean,
                default: false,
            },
            twoFactorSecret: String,
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
    "security.twoFactorSecret": 0,
    "security.passwordHistory": 0,
    "security.failedLoginAttempts": 0,
    "security.lockoutUntil": 0
};

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

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

["findOneAndUpdate", "findOneAndDelete", "deleteOne", "updateOne"].forEach((hook: any) => {
    userSchema.post(hook, async function (doc) {
        let key = String(doc._id)
        
        // Delete from LRU Cache
        lruCache.delete(key)

        // Delete from Redis
        await redis.del(key)
    })
});

// Method to retrieve sensitive data only in specific cases, else the fields are not captured
["find", "findOne"].forEach((hook: any) => {
    userSchema.pre(hook, function (next) {
        const query: any = this;
        if (!query.options["includeAll"]) {
            query.select(sensitiveFields);
        }
        next();
    });
});

// Compare password method
userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);