import mongoose from "mongoose";
import { createClient, RedisClientType } from "redis";
import { LRUCache } from "lru-cache";
import { BSON } from "bson";
import { getMongoURI, getRedisURI } from "./config";

// Check if Redis connection exists globally
const globalForRedis = global as unknown as { redis: RedisClientType | null };
const redisUri = getRedisURI();

// Reuse existing Redis connection if available
export let redis: RedisClientType | null = globalForRedis.redis || null

// Initialize Redis only if the URI exists
if (redisUri) {
  redis = createClient({ url: redisUri });

  // Handle errors
  redis.on("error", (err) => console.error("Redis Error:", err));

  // Ensure Redis is connected before usage
  (async () => {
    try {
      if (!redis?.isOpen) {
        await redis?.connect();
      }
    } catch (error) {
      console.error("Redis connection failed:", error);
    }
  })();
}

// MongoDB connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Create LRU Cache (In-memory)
export const lruCache = new LRUCache<string, any>({
  max: 500, // Maximum 500 items in cache
  ttl: 60 * 1000, // Time-to-live: 60 seconds
  maxSize: 100 * 1024 * 1024, // 100 MB
  sizeCalculation: (value) => BSON.serialize(value).length, // BSON byte size
});

export async function initializeDbConnection() {
  if (cached.conn) {
    return cached.conn;
  }

  const connectionUri = getMongoURI();

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(connectionUri, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Cache wrapper function
export async function withCache<T>(
  key: string,
  fetchData: () => Promise<T>,
  expirationSeconds: number = 86400
): Promise<T> {
  try {
    // Check in LRU Cache
    if (lruCache.has(key)) {
      return lruCache.get(key) as T;
    }

    // Try to get data from cache
    const cachedData = await redis?.get(key);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      lruCache.set(key, parsedData, { ttl: expirationSeconds * 1000 }); // Also store in LRU
      return parsedData;
    }

    // If not in cache, fetch data
    const data = await fetchData();

    // Store in both Redis (distributive cache) and LRU Cache
    lruCache.set(key, data, { ttl: expirationSeconds * 1000 });
    await redis?.setEx(key, expirationSeconds, JSON.stringify(data));

    return data;
  } catch (error) {
    console.error("Cache error:", error);
    // If cache fails, fall back to direct fetch
    return fetchData();
  }
}