import { S3Client, HeadObjectCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3"
import crypto from "crypto"
import { getAwsConnectionConfig, getS3BucketName } from "../../lib/config"
import storageConfig from "@/config/storage-nodes.json"
import { File, Token } from "@/lib/models/upload"
import { Readable } from "stream"
import { Types } from "mongoose"

const BUCKET_NAME = getS3BucketName()
const TOKEN_EXPIRY = 3600; // 1 hour in seconds
const { credentials } = getAwsConnectionConfig()
const s3Clients = new WeakMap<StorageNode, S3Client>()
const validTokenActions = Token.schema.path("action").options.enum as string[]

// Initialize nodes with load counters
const STORAGE_NODES: StorageNode[] = storageConfig.nodes.map(node => ({
  ...node,
  status: node.status as "active" | "maintenance" | "offline",
  load: 0
}));

/**
 * Selects an active storage node with the lowest load.
 * If no active nodes are available, an error is thrown.
 * 
 * @returns {Promise<StorageNode>} The selected storage node.
 * @throws {Error} If no active storage nodes are available.
 * 
 * @author Shawan Mandal <github@imshawan.dev>
 */
export async function selectStorageNode(): Promise<StorageNode> {
  // Filter active nodes
  const activeNodes = STORAGE_NODES.filter(node => node.status === "active")
  if (activeNodes.length === 0) {
    throw new Error("No active storage nodes available")
  }

  // Select node with lowest load
  const selectedNode = activeNodes.reduce((prev, current) =>
    prev.load <= current.load ? prev : current
  )

  // we will update node load (in production, this would be handled by a load balancer)
  selectedNode.load += 1

  return selectedNode
}

/**
 * Retrieves a storage node by its ID.
 * 
 * @param {string} id - The ID of the storage node.
 * @returns {StorageNode | undefined} The matching storage node, or undefined if not found.
 * 
 * @author Shawan Mandal <github@imshawan.dev>
 */
export function getStorageNodeById(id: string) {
  return STORAGE_NODES.find(node => node.id === id)
}

/**
 * Uploads a chunk of a file to the specified storage node using S3.
 * 
 * @param {string} fileId - The ID of the file.
 * @param {string} hash - The hash of the file chunk.
 * @param {Buffer} buffer - The binary data of the chunk.
 * @param {StorageNode} node - The target storage node.
 * 
 * @throws {Error} If the upload fails.
 * 
 * @author Shawan Mandal <github@imshawan.dev>
 */
export async function uploadChunkByNode(fileId: string, hash: string, buffer: Buffer, node: StorageNode): Promise<void> {
  try {
    const s3Client = getS3Client(node)

    await s3Client.send(new PutObjectCommand({
      Bucket: getBucket(node),
      Key: `${node.id}/${fileId}/${hash}`,
      Body: buffer,
      ContentType: "application/octet-stream",
      Metadata: {
        "node-region": node.region,
        "node-id": node.id,
        "node-name": node.name
      },
    }))
  } catch (error) {
    console.error("Error uploading to S3:", error)
    throw new Error(`Failed to upload chunk to storage node ${node.name} (${node.id}) in region ${node.region}`)
  }
}

/**
 * Validates an upload token against saved tokens.
 * Ensures the token matches the expected file ID and hash and has not expired.
 * 
 * @param {string} token - The upload token.
 * @param {string} fileId - The file ID associated with the token.
 * @param {string} hash - The hash associated with the token.
 * @returns {Promise<boolean>} True if the token is valid, otherwise false.
 * 
 * @author Shawan Mandal <github@imshawan.dev>
 */
export async function validateUploadToken(
  token: string,
  fileId: string,
  hash: string
): Promise<boolean> {
  try {
    if (!token) {
      return false
    }
    const tokenData = await Token.findOne({ token })
    if (!tokenData) {
      return false
    }

    const { fileId: storedFileId, hash: storedHash, expires } = tokenData

    // Validate token data
    if (
      storedFileId !== fileId ||
      storedHash !== hash ||
      expires < Date.now()
    ) {
      return false
    }

    // Token is valid, delete it to prevent reuse
    await Token.deleteOne({ token })
    return true
  } catch (error) {
    console.error("Error validating upload token:", error)
    return false
  }
}

/**
 * Generates a secure upload/download token for a file chunk.
 * 
 * @param {string} fileId - The file ID.
 * @param {string} hash - The hash of the file chunk.
 * @param {string} actionType - The action type ("upload" or "download").
 * @param {string} [contentType] - The content type of the chunk.
 * @returns {Promise<string>} The generated token.
 * @throws {Error} If the chunk already exists or token generation fails.
 * 
 * @author Shawan Mandal <github@imshawan.dev>
 */
export async function generateToken(fileId: string, hash: string, userId: string, actionType: "upload" | "download" = "upload", contentType?: string): Promise<string> {
  try {
    // Check if chunk already exists (query the database instead of S3)
    const existingChunk = await Token.findOne({ fileId, hash, action: actionType, userId: new Types.ObjectId(userId) })

    if (existingChunk) {
      existingChunk.expiresAt = getTokenExpirationDuration()
      await existingChunk.save()
      return existingChunk.token
    }

    if (!validTokenActions.includes(actionType)) {
      throw new Error("Invalid action type")
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex")
    const tokenData = {
      userId: new Types.ObjectId(userId),
      fileId,
      token,
      hash,
      expiresAt: getTokenExpirationDuration(), // Auto-expiry timestamp
      action: actionType,
      contentType,
    }

    // Store token in MongoDB with TTL index
    await Token.create(tokenData)

    return token
  } catch (error) {
    console.error("Error generating custom pre-signed URL:", error)
    throw new Error("Failed to generate upload URL")
  }
}

/**
 * Verifies if a chunk has been successfully uploaded to S3.
 * 
 * @param {string} fileId - The file ID.
 * @param {string} hash - The hash of the file chunk.
 * @param {StorageNode} node - The storage node.
 * @returns {Promise<boolean>} True if the chunk exists, otherwise false.
 * 
 * @author Shawan Mandal <github@imshawan.dev>
 */
export async function verifyChunkUpload(fileId: string, hash: string, node: StorageNode): Promise<boolean> {
  try {
    const s3Client = getS3Client(node)
    await s3Client.send(new HeadObjectCommand({
      Bucket: node.bucket,
      Key: `${node.id}/${fileId}/${hash}`,
    }))
    return true
  } catch (error) {
    return false
  }
}

export async function getChunkFromBucket(fileId: string, hash: string, nodeId: string): Promise<Uint8Array> {
  const node = STORAGE_NODES.find(n => n.id === nodeId)
  if (!node) {
    throw new Error(`Storage node ${nodeId} not found`)
  }

  try {
    const s3Client = getS3Client(node)
    const response = await s3Client.send(new GetObjectCommand({
      Bucket: node.bucket,
      Key: `${node.id}/${fileId}/${hash}`,
    }))

    if (!response.Body) {
      throw new Error("No data received from S3")
    }

    return new Uint8Array(await response.Body.transformToByteArray())
  } catch (error) {
    console.error("Error downloading from S3:", error)
    throw new Error(`Failed to download chunk from storage node`)
  }
}

/**
 * Fetches a chunk from an S3 storage node and returns a readable stream.
 * This avoids loading large files into memory, improving performance.
 *
 * @param fileId - The unique identifier of the file.
 * @param hash - The hash representing the chunk.
 * @param nodeId - The storage node ID.
 * @param range - Optional byte range to fetch a specific part of the chunk.
 * @returns A readable stream containing the chunk data.
 * @throws Error if the storage node is not found or if fetching fails.
 */
export async function getChunkStreamFromBucket(fileId: string, hash: string, nodeId: string, range?: String): Promise<Readable> {
  const node = STORAGE_NODES.find(n => n.id === nodeId);
  if (!node) {
    throw new Error(`Storage node ${nodeId} not found`);
  }

  try {
    const s3Client = getS3Client(node);
    const params: any = {
      Bucket: node.bucket,
      Key: `${node.id}/${fileId}/${hash}`,
    }
    if (range) {
      params.Range = range; // Fetch only the requested byte range
    }
    
    const response = await s3Client.send(new GetObjectCommand(params))

    if (!response.Body) {
      throw new Error("No data received from S3");
    }

    // Return the S3 response body as a readable stream
    return response.Body as Readable;
  } catch (error) {
    console.error("Error streaming from S3", error);
    throw new Error("Failed to stream chunk from storage node");
  }
}

/**
 * Deletes a chunk from an S3 storage node.
 *
 * @param fileId - The unique identifier of the file.
 * @param hash - The hash representing the chunk.
 * @param nodeId - The storage node ID.
 * @throws Error if the storage node is not found or deletion fails.
 */
export async function deleteChunkFromBucket(fileId: string, hash: string, nodeId: string): Promise<void> {
  const node = STORAGE_NODES.find(n => n.id === nodeId);
  if (!node) {
    throw new Error(`Storage node ${nodeId} not found`);
  }

  try {
    const s3Client = getS3Client(node);
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: node.bucket,
        Key: `${node.id}/${fileId}/${hash}`,
      })
    );

  } catch (error) {
    console.error(`Error deleting from S3 [Node: ${nodeId}, Key: ${fileId}/${hash}]`, error);
    throw new Error("Failed to delete chunk from storage node");
  }
}

/**
 * Deletes multiple chunks for a file from an S3 storage node.
 *
 * @param fileId - The unique identifier of the file.
 * @param hashes - An array of hashes representing the chunks.
 * @param nodeId - The storage node ID.
 * @throws Error if the storage node is not found or deletion fails.
 */
export async function deleteChunksFromBucket(fileId: string, hashes: string[], nodeId: string): Promise<void> {
  const node = STORAGE_NODES.find(n => n.id === nodeId);
  if (!node) {
    throw new Error(`Storage node ${nodeId} not found`);
  }

  if (hashes.length === 0) {
    // console.log("No chunks to delete.");
    return;
  }

  try {
    const s3Client = getS3Client(node);

    const deleteParams = {
      Bucket: node.bucket,
      Delete: {
        Objects: hashes.map(hash => ({ Key: `${node.id}/${fileId}/${hash}` })),
      },
    };

    await s3Client.send(new DeleteObjectsCommand(deleteParams));

  } catch (error) {
    console.error(`Error deleting chunks from S3 [Node: ${nodeId}, File: ${fileId}]`, error);
    throw new Error("Failed to delete chunks from storage node");
  }
}

/**
 * Deletes multiple chunks from an S3 storage node for multiple files.
 *
 * @param files - An array of objects containing files.
 * @param nodeId - The storage node ID.
 * @throws Error if the storage node is not found or deletion fails.
 */
export async function deleteMultipleFilesFromBucket(files: File[]): Promise<void> {
  const filesByNode: Record<string, { fileId: string; chunkHashes: string[] }[]> = {};

  for (const file of files) {
    let storageNode = String(file.storageNode);
    if (!filesByNode[storageNode]) {
      filesByNode[storageNode] = [];
    }
    filesByNode[storageNode].push({ fileId: file.fileId, chunkHashes: file.chunkHashes });
  }

  try {
    for (const nodeId of Object.keys(filesByNode)) {
      const node = STORAGE_NODES.find(n => n.id === nodeId);
      if (!node) {
        console.error(`Storage node ${nodeId} not found. Skipping.`);
        continue; // Skip this node instead of throwing an error
      }

      const bucketName = node.bucket; // Get the bucket name from the node

      // Collect all keys to delete for this node
      const objectsToDelete = filesByNode[nodeId].flatMap(file =>
        file.chunkHashes.map(hash => ({ Key: `${node.id}/${file.fileId}/${hash}` }))
      );

      if (objectsToDelete.length === 0) {
        // console.log(`No files to delete for storage node ${nodeId}.`);
        continue;
      }

      const s3Client = getS3Client(node);
      const deleteParams = {
        Bucket: bucketName,
        Delete: { Objects: objectsToDelete },
      };

      await s3Client.send(new DeleteObjectsCommand(deleteParams));
    }
  } catch (error) {
    console.error("Error deleting files from S3:", error);
    throw new Error("Failed to delete files from storage nodes");
  }
}


/**
 * Retrieves the bucket name for a given storage node.
 * 
 * @param {StorageNode} node - The storage node.
 * @returns {string} The bucket name.
 * 
 * @author Shawan Mandal <github@imshawan.dev>
 */
function getBucket(node: StorageNode) {
  return node.bucket || BUCKET_NAME
}

/**
 * Retrieves or creates an S3 client for a given storage node.
 * 
 * @param {StorageNode} node - The storage node.
 * @returns {S3Client} The S3 client instance.
 * 
 * @author Shawan Mandal <github@imshawan.dev>
 */
function getS3Client(node: StorageNode): S3Client {
  if (!s3Clients.has(node)) {
    s3Clients.set(node, new S3Client({
      region: node.region,
      credentials: credentials,
    }))
  }
  return s3Clients.get(node)!
}

/**
 * Calculates the expiration duration for a token.
 * @returns {number} The expiration duration in milliseconds.
 */
function getTokenExpirationDuration(): number {
  return Date.now() + TOKEN_EXPIRY * 1000
}