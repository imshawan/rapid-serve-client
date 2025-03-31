import { MAX_CHUNK_SIZE } from "@/common/constants"

/**
 * Calculates the SHA-256 hash of the given input, which can be either a `Blob` or a `Buffer`.
 *
 * @param chunk - The input data to hash. It can be a `Blob` (typically used in browser environments)
 *                or a `Buffer` (typically used in Node.js environments).
 * @returns A promise that resolves to the SHA-256 hash of the input as a hexadecimal string.
 * @throws An error if the input type is neither `Buffer` nor `Blob`.
 */
export async function calculateSHA256(chunk: Blob | Buffer): Promise<string> {
  let arrayBuffer: ArrayBuffer;

  if (chunk instanceof Buffer) {
    // Convert Buffer to a proper ArrayBuffer
    const uint8Array = new Uint8Array(chunk);
    arrayBuffer = uint8Array.buffer.slice(0, uint8Array.byteLength);
  } else if (chunk instanceof Blob) {
    // Handle Blob in browser
    arrayBuffer = await chunk.arrayBuffer();
  } else {
    throw new Error("Invalid input type: Expected Buffer or Blob.");
  }

  // Compute SHA-256 hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Validates the hash of a given chunk against an expected hash value.
 *
 * @param chunk - The data chunk to validate, which can be a `Blob` or `Buffer`.
 * @param expectedHash - The expected SHA-256 hash value as a string.
 * @returns A promise that resolves to `true` if the calculated hash matches the expected hash, otherwise `false`.
 * @throws An error if the hash validation process fails.
 */
export async function validateChunkHash(chunk: Blob | Buffer, expectedHash: string): Promise<boolean> {
  try {
    const calculatedHash = await calculateSHA256(chunk);
    return calculatedHash.toLowerCase() === expectedHash.toLowerCase();
  } catch (error: any) {
    throw new Error(`Failed to validate chunk hash: ${error.message}`);
  }
}

/**
 * Splits a given file into smaller chunks of a specified maximum size.
 *
 * @param file - The file to be split into chunks.
 * @returns An array of `Blob` objects, each representing a chunk of the file.
 *
 * @remarks
 * The function uses the `File.slice` method to create chunks of the file.
 * The size of each chunk is determined by the constant `MAX_CHUNK_SIZE`.
 * Ensure that `MAX_CHUNK_SIZE` is defined in the same scope or imported
 * before using this function.
 */
export function splitFileIntoChunks(file: File): Blob[] {
  const chunks: Blob[] = [];
  let start = 0, fileSize = Number(file.size);

  while (start < fileSize) {
    const end = Math.min(start + MAX_CHUNK_SIZE, fileSize);
    chunks.push(file.slice(start, end));
    start = end;
  }

  return chunks;
}