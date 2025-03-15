import mongoose from "mongoose";
import { File } from "../models/upload";
import { User as UserModel } from "../models/user";
import type { User } from "../models/user";

/**
 * Increments the user's storage usage by a given amount.
 * @param {string} userId - The ID of the user.
 * @param {number} amount - The amount to increment (e.g., file size in bytes).
 * @returns {Promise<User | null>} - The updated user document.
 * @throws {Error} - Throws an error if the userId is invalid or update fails.
 */
export async function incrementStorageUsageCount(userId: string, amount: number): Promise<User | null> {
  if (amount <= 0) {
    throw new Error("Amount must be a positive number");
  }
  return await manageStorageCount(userId, amount);
}

/**
 * Decrements the user's storage usage by a given amount.
 * Ensures that storageUsed does not go below zero.
 * @param {string} userId - The ID of the user.
 * @param {number} amount - The amount to decrement.
 * @returns {Promise<User | null>} - The updated user document.
 * @throws {Error} - Throws an error if the userId is invalid or update fails.
 */
export async function decrementStorageUsageCount(userId: string, amount: number): Promise<User | null> {
  if (amount <= 0) {
    throw new Error("Amount must be a positive number");
  }
  return await manageStorageCount(userId, -amount);
}

/**
 * Increments the file count for a specified folder by a given amount.
 *
 * @param folderId - The ID of the folder whose file count is to be incremented.
 * @param amount - The amount by which to increment the file count. Must be a positive number.
 * @returns A promise that resolves when the file count has been successfully incremented.
 * @throws Will throw an error if the amount is not a positive number.
 */
export async function incrementFileCountByFolder(folderId: string, amount: number) {
  if (amount <= 0) {
    throw new Error("Amount must be a positive number")
  }
  return await manageFileCountByFolder(folderId, amount)
}

/**
 * Decrements the file count of a specified folder by a given amount.
 *
 * @param folderId - The ID of the folder whose file count is to be decremented.
 * @param amount - The number by which to decrement the file count. Must be a positive number.
 * @returns A promise that resolves when the file count has been decremented.
 * @throws An error if the amount is not a positive number.
 */
export async function decrementFileCountByFolder(folderId: string, amount: number) {
  if (amount <= 0) {
    throw new Error("Amount must be a positive number")
  }
  return await manageFileCountByFolder(folderId, -amount)
}

/**
 * Manages the user's storage usage (increment or decrement).
 * @param {string} userId - The ID of the user.
 * @param {number} amount - The amount to modify storageUsed (positive to increase, negative to decrease).
 * @returns {Promise<User | null>} - The updated user document.
 * @throws {Error} - Throws an error if the userId is invalid or update fails.
 */
async function manageStorageCount(userId: string, amount: number): Promise<User | null> {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  try {
    // Update storageUsed and ensure it does not go below zero
    return await UserModel.findByIdAndUpdate(
      { _id: userId },
      [
        {
          $set: {
            storageUsed: {
              $max: [{ $add: ["$storageUsed", amount] }, 0] // Ensures it never goes below 0
            }
          }
        }
      ],
      { new: true }
    );
  } catch (error) {
    console.error("Error updating storage usage:", error);
    throw error;
  }
}

/**
 * Updates the file count for a specific folder by a given amount.
 *
 * @param folderId - The ID of the folder (file.fileId) to update.
 * @param amount - The amount to adjust the file count by. This can be a positive or negative number.
 * @returns A promise that resolves to the updated file document.
 * @throws Will throw an error if the update operation fails.
 */
async function manageFileCountByFolder(folderId: string, amount: number) {
  try {
    return await File.findByIdAndUpdate(
      { _id: folderId },
      [
        {
          $set: {
            items: {
              $max: [{ $add: ["$items", amount] }, 0]
            }
          }
        }
      ],
      { new: true }
    );
  } catch (error) {
    throw error;
  }
}