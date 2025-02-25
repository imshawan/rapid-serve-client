/**
 * @file soft-delete.ts
 * @description A Mongoose plugin to implement soft delete functionality across multiple schemas.
 * @author Shawan Mandal <github@imshawan.dev>
 * @date 15-02-2025
 */

import { Schema, Document } from 'mongoose';
import type { File } from '@/lib/models/upload';

interface SoftDeleteOptions {
    includeDeleted?: boolean;
}

export interface SoftDeleteFields {
    isDeleted: boolean;
    deletedAt: Date | null;
}

interface SoftDeleteDocument extends Document<File>, SoftDeleteFields {
    delete: () => Promise<void>;
    restore: () => Promise<void>;
} 

export default function softDelete(schema: Schema, options: SoftDeleteOptions = {}): void {
    if (Array.isArray(options) || typeof options !== 'object') {
        options = {};
    }

    schema.add({
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },
    });

    schema.methods.delete = async function (this: SoftDeleteDocument): Promise<void> {
        this.isDeleted = true;
        this.deletedAt = new Date();
        await this.save();
    };

    schema.methods.restore = async function (this: SoftDeleteDocument): Promise<void> {
        this.isDeleted = false;
        this.deletedAt = null;
        await this.save();
    };

    if (!options?.includeDeleted) {
        schema.pre(/^find/, function (this: any, next) {
            if (!this.getQuery().includeDeleted) {
                this.where({ isDeleted: false });
            }
            next();
        });
    }
}