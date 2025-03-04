/**
 * @file soft-delete.ts
 * @description A Mongoose plugin to implement soft delete functionality across multiple schemas.
 * @author Shawan Mandal <github@imshawan.dev>
 * @date 15-02-2025
 */

import { Schema, Document, Model } from 'mongoose';

export interface SoftDeleteFields {
  isDeleted: boolean;
  deletedAt: Date | null;
}

export interface SoftDeleteDocument extends Document, SoftDeleteFields {
  /**
   * Soft deletes the current document.
   * This typically sets a `deletedAt` timestamp or an `isDeleted` flag.
   * @returns A promise that resolves when the document is soft deleted.
   */
  delete: () => Promise<void>;

  /**
   * Restores a previously soft-deleted document.
   * This typically removes the `deletedAt` timestamp or updates the `isDeleted` flag.
   * @returns A promise that resolves when the document is restored.
   */
  restore: () => Promise<void>;
}

export interface SoftDeleteModel<T extends Document> extends Model<T> {
  /**
   * Retrieves only the soft-deleted documents that match the given filter.
   * @param filter - Query conditions to filter the soft-deleted documents.
   * @returns A promise resolving to an array of soft-deleted documents.
   */
  findAllSoftDeleted: (filter: Record<string, any>) => Promise<T[]>;

  /**
   * Soft deletes multiple documents matching the given filter.
   * This typically sets a `deletedAt` timestamp instead of removing the records permanently.
   * @param filter - Query conditions to identify documents for soft deletion.
   * @returns A promise that resolves when the operation is complete.
   */
  softDeleteMany: (filter: Record<string, any>) => Promise<void>;

  /**
   * Restores multiple soft-deleted documents that match the given filter.
   * Typically removes the `deletedAt` timestamp or updates the `isDeleted` flag.
   * @param filter - Query conditions to identify documents for restoration.
   * @returns A promise that resolves when the restoration is complete.
   */
  restoreMany: (filter: Record<string, any>) => Promise<void>;

  /**
   * Permanently deletes a single document that matches the given filter.
   * This action removes the document from the database entirely.
   * @param filter - Query conditions to identify the document for hard deletion.
   * @returns A promise that resolves when the document is deleted.
   */
  deleteHard: (filter: Record<string, any>) => Promise<void>;

  /**
   * Permanently deletes multiple documents that match the given filter.
   * This action removes the documents from the database entirely.
   * @param filter - Query conditions to identify documents for hard deletion.
   * @returns A promise that resolves when the deletion is complete.
   */
  deleteManyHard: (filter: Record<string, any>) => Promise<void>;
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

  schema.statics.findAllSoftDeleted = async function (filter: Record<string, any>): Promise<T[]> {
    return this.find({ ...filter, isDeleted: true, deletedAt: { $ne: null } }).setOptions({ includeDeleted: true });
  };

  // Static Methods (Soft Delete for Multiple Records)
  schema.statics.deleteManySoft = async function (filter: Record<string, any>): Promise<void> {
    await this.updateMany(filter, { $set: { isDeleted: true, deletedAt: new Date() } });
  };

  // Static Methods (Restore Soft Deleted Records)
  schema.statics.restoreMany = async function (filter: Record<string, any>): Promise<void> {
    await this.updateMany(filter, { $set: { isDeleted: false, deletedAt: null } });
  };

  schema.statics.deleteHard = async function (filter: Record<string, any>): Promise<void> {
    await this.deleteOne(filter);
  };

  schema.statics.deleteManyHard = async function (filter: Record<string, any>): Promise<void> {
    await this.deleteMany(filter);
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