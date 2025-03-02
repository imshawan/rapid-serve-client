/**
 * @file soft-delete.ts
 * @description A Mongoose plugin to implement soft delete functionality across multiple schemas.
 * @author Shawan Mandal <github@imshawan.dev>
 * @date 15-02-2025
 */

import { Schema, Document, Model } from 'mongoose';

interface SoftDeleteOptions {
  includeDeleted?: boolean;
}

export interface SoftDeleteFields {
  isDeleted: boolean;
  deletedAt: Date | null;
}

export interface SoftDeleteDocument extends Document, SoftDeleteFields {
  delete: () => Promise<void>;
  restore: () => Promise<void>;
}

export interface SoftDeleteModel<T extends Document> extends Model<T> {
  deleteManySoft: (filter: Record<string, any>) => Promise<void>;
  restoreMany: (filter: Record<string, any>) => Promise<void>;
}

export default function softDelete<T extends Document>(schema: Schema<T>): void {
  // Add soft delete fields
  schema.add({
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  } as any);

  // Instance Methods
  schema.methods.delete = async function (): Promise<void> {
    this.isDeleted = true;
    this.deletedAt = new Date();
    await this.save();
  };

  schema.methods.restore = async function (): Promise<void> {
    this.isDeleted = false;
    this.deletedAt = null;
    await this.save();
  };

  // Static Methods (Soft Delete for Multiple Records)
  schema.statics.deleteManySoft = async function (filter: Record<string, any>): Promise<void> {
    await this.updateMany(filter, { $set: { isDeleted: true, deletedAt: new Date() } });
  };

  // Static Methods (Restore Soft Deleted Records)
  schema.statics.restoreMany = async function (filter: Record<string, any>): Promise<void> {
    await this.updateMany(filter, { $set: { isDeleted: false, deletedAt: null } });
  };

  // Middleware to exclude soft deleted documents
  schema.pre(/^find/, function (this: any, next) {
    const includeDeleted = this.get("includeDeleted") || (this.options && this.options.includeDeleted);
    if (!includeDeleted) {
      this.where({ isDeleted: false });
    }
    next();
  });
}