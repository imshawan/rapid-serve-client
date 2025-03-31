import { Schema, Document } from "mongoose";
import { lruCache, redis } from "@/lib/db";

/**
* Mongoose plugin to filter and remove sensitive data from database queries and updates.
* 
* - During `find` and `findOne`, sensitive fields are excluded unless explicitly requested.
* - After `updateOne` or `findOneAndUpdate`, sensitive fields are removed from the returned document.
* - Cache is invalidated after updates to ensure fresh data retrieval.
*
* @template T - The Mongoose document type.
* @param {Record<string, any>} sensitiveFields - Object specifying which fields to filter.
* @param {Schema<T>} schema - Mongoose schema to apply the plugin.
* 
* @author Shawan Mandal <github@imshawan.dev>
*/
export default function filterSensitiveData<T extends Document>(sensitiveFields: Object, schema: Schema<T>): void {

  // Method to retrieve sensitive data only in specific cases, else the fields are not captured
  ["find", "findOne"].forEach((hook: any) => {
    schema.pre(hook, function (next) {
      const query: any = this;
      if (!query.options["includeAll"]) {
        query.select(sensitiveFields);
      }
      next();
    })
  });

  // Remove sensitive fields after update operations and invalidate the cache
  ["updateOne", "findOneAndUpdate"].forEach((hook: any) => {
    schema.post(hook, async function (doc: any) {
      if (doc) {
        Object.keys(sensitiveFields).forEach((field) => {
          if (field.includes(".")) {
            // Handle nested fields (e.g., "security.twoFactorSecret")
            const [parent, child] = field.split(".");
            if (doc[parent]) {
              doc[parent][child] = undefined;
            }
          } else {
            doc.set(field, undefined);
          }
        });

        let key = String(doc._id)

        // Delete from LRU Cache
        lruCache.delete(key)

        // Delete from Redis
        await redis?.del(key)
      }
    })
  });

  // Method to return a sanitized object without sensitive fields
  schema.method("toSafeObject", function () {
    const docObject = this.toObject() // Convert Mongoose document to plain object

    Object.keys(sensitiveFields).forEach(field => {
      const keys = field.split(".")
      let obj = docObject as any
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) return;
        obj = obj[keys[i]]
      }
      delete obj[keys[keys.length - 1]]
    });

    return docObject as T
  })
}