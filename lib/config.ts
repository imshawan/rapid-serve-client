/**
 * Environment Configuration Module
 * 
 * This module provides utility functions to access environment variables 
 * in a type-safe manner, ensuring a centralized and consistent configuration 
 * for different application settings, such as database connections, API keys, 
 * authentication secrets, and third-party integrations.
 * 
 * These functions help avoid direct access to `process.env` throughout the codebase, 
 * improving maintainability and reducing the risk of undefined values.
 * 
 * @author Shawan Mandal <github@imshawan.dev>
 */

import type { StringValue } from "ms";

/**
 * Retrieves an environment variable by its key.
 * If the variable is not set, returns the provided default value.
 *
 * @param {string} key - The name of the environment variable.
 * @param {T} [defaultValue] - The default value to return if the key is not found.
 * @returns {T} - The environment variable value cast to the given type, or the default value.
 */
export const getEnvValue = <T>(key: string, defaultValue?: T): T => {
    const value = process.env[key];

    if (value === undefined || value === null) {
        return defaultValue!;
    }

    try {
        return JSON.parse(value) as T; // Auto-detects number, boolean, object, or string
    } catch {
        return value as T; // Fallback to string if parsing fails
    }
};

// Retrieves the current environment mode (e.g., 'development', 'production')
export const getEnv = (): string => getEnvValue("NODE_ENV");

// Determines if the application is running in production mode
export const isProduction = (): boolean => getEnvValue("NODE_ENV") === "production";

// Determines if the application is running in development mode
export const isDevelopment = (): boolean => getEnvValue("NODE_ENV") === "development";

// Determines the logging level based on the environment
export const getLoggingLevel = (): "info" | "debug" => {
    switch (getEnvValue("NODE_ENV")) {
        case "production":
            return "info";
        case "development":
            return "debug";
        default:
            return "info";
    }
};

// Retrieves the application port, defaulting to 3000 if not set
export const getPort = () => Number(getEnvValue("PORT", "3000"));

// Retrieves the MongoDB connection URI
export const getMongoURI = (): string => getEnvValue("MONGODB_URI");

// Retrieves the Redis connection URI
export const getRedisURI = (): string => getEnvValue("REDIS_URL");

// Retrieves Google OAuth credentials
export const getGoogleClientID = (): string => getEnvValue("GOOGLE_CLIENT_ID");
export const getGoogleClientSecret = (): string => getEnvValue("GOOGLE_CLIENT_SECRET");
export const getGoogleCallbackURL = (): string => getEnvValue("GOOGLE_CALLBACK_URL");

// Retrieves JWT configuration values
export const getJwtSecret = (): string => getEnvValue("JWT_SECRET");
export const getJwtExpiry = (): StringValue => getEnvValue("JWT_EXPIRES_IN", "7d") as StringValue;

// Retrieves Amazon S3 configuration for file storage
export const getS3ConnectionConfig = () => ({
    credentials: {
        accessKeyId: getEnvValue("AWS_ACCESS_KEY_ID", ""),
        secretAccessKey: getEnvValue("AWS_SECRET_ACCESS_KEY", ""),
    },
    region: getEnvValue("AWS_REGION", "ap-south-1"),
});

// Retrieves the Amazon S3 bucket name
export const getS3BucketName = (): string => getEnvValue("AWS_S3_BUCKET_NAME", "");