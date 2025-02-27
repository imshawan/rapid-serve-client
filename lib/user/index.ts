import mongoose from "mongoose";
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