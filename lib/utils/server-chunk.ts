/**
 * @fileoverview Utility functions for handling file chunk retrieval and merging chunks into a single stream.
 * @author Shawan Mandal <github@imshawan.dev>
 */

import { PassThrough, Readable } from "stream"
import { File } from "../models/upload"
import { MAX_CHUNK_SIZE } from "@/common/constants";

/**
 * Retrieves the necessary chunks for a specified byte range.
 *
 * This function determines which chunks of a file are needed based on the requested
 * byte range. It constructs byte-range requests for each relevant chunk.
 *
 * @param {File} file - The file metadata containing chunk hashes.
 * @param {number} start - The start byte of the requested range.
 * @param {number} end - The end byte of the requested range.
 * @returns {Promise<{ hash: string; range: string }[]>} - A list of chunk hashes with their corresponding byte ranges.
 */
export async function getChunksForRange(file: File, start: number, end: number): Promise<{ hash: string; range: string; }[]> {
  const chunkSize = MAX_CHUNK_SIZE
  let currentByte = 0
  const chunkRequests = []

  for (const hash of file.chunkHashes) {
    const chunkStart = currentByte
    const chunkEnd = currentByte + chunkSize - 1

    if (end < chunkStart) break // Stop if requested range is before this chunk

    if (start <= chunkEnd) {
      // Include this chunk if it intersects with the requested range
      const byteStart = Math.max(start - chunkStart, 0)
      const byteEnd = Math.min(end - chunkStart, chunkSize - 1)
      const range = `bytes=${byteStart}-${byteEnd}`

      chunkRequests.push({ hash, range })
    }

    currentByte += chunkSize
  }

  return chunkRequests
}

/**
 * Merges multiple readable streams into a single readable stream.
 *
 * This function takes an array of readable streams (representing file chunks)
 * and sequentially pipes their data into a single PassThrough stream.
 *
 * @param {Readable[]} streams - The array of readable streams to be merged.
 * @returns {Readable} - A single readable stream containing merged data.
 */
export function mergeChunks(streams: Readable[]): Readable {
  const mergedStream = new PassThrough(); // Use PassThrough for continuous streaming

  (async () => {
    try {
      for (const stream of streams) {
        for await (let chunk of stream) {
          if (!(chunk instanceof Buffer)) {
            chunk = Buffer.from(chunk) // Convert non-buffer chunks to Buffer
          }
          mergedStream.write(chunk) // Append chunk to the stream
        }
      }
      mergedStream.end() // Close the stream when all chunks are processed
    } catch (error: any) {
      console.error("Error merging streams:", error)
      mergedStream.destroy(error) // Destroy stream on failure
    }
  })();

  return mergedStream;
}
