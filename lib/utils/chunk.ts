export const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB

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

export function splitFileIntoChunks(file: File): Blob[] {
  const chunks: Blob[] = [];
  let start = 0, fileSize = Number(file.size);

  while (start < fileSize) {
    const end = Math.min(start + CHUNK_SIZE, fileSize);
    chunks.push(file.slice(start, end));
    start = end;
  }

  return chunks;
}