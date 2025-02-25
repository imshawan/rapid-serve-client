import { S3Client, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'
import { redis } from '@/lib/db'
import { getAwsConnectionConfig, getS3BucketName } from '../../lib/config'
import storageConfig from '@/config/storage-nodes.json'
import { Token } from '@/lib/models/upload'

const BUCKET_NAME = getS3BucketName()
const TOKEN_EXPIRY = 3600; // 1 hour in seconds
const { credentials } = getAwsConnectionConfig()
const s3Clients = new WeakMap<StorageNode, S3Client>()
const validTokenActions = Token.schema.path("action").options.enum as string[]

// Initialize nodes with load counters
const STORAGE_NODES: StorageNode[] = storageConfig.nodes.map(node => ({
  ...node,
  status: node.status as 'active' | 'maintenance' | 'offline',
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
  const activeNodes = STORAGE_NODES.filter(node => node.status === 'active')
  if (activeNodes.length === 0) {
    throw new Error('No active storage nodes available')
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
      ContentType: 'application/octet-stream',
      Metadata: {
        'node-region': node.region,
        'node-id': node.id,
        'node-name': node.name
      },
    }))
  } catch (error) {
    console.error('Error uploading to S3:', error)
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
    console.error('Error validating upload token:', error)
    return false
  }
}

/**
 * Generates a secure upload/download token for a file chunk.
 * 
 * @param {string} fileId - The file ID.
 * @param {string} hash - The hash of the file chunk.
 * @param {string} actionType - The action type ('upload' or 'download').
 * @param {string} [contentType] - The content type of the chunk.
 * @returns {Promise<string>} The generated token.
 * @throws {Error} If the chunk already exists or token generation fails.
 * 
 * @author Shawan Mandal <github@imshawan.dev>
 */
export async function generateToken(fileId: string, hash: string, userId: string, actionType: 'upload' | 'download' = 'upload', contentType?: string): Promise<string> {
  try {
    // Check if chunk already exists (query the database instead of S3)
    const existingChunk = await Token.findOne({ fileId, hash, action: actionType, userId })

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
      userId,
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
export async function verifyChunkUpload(
  fileId: string,
  hash: string,
  node: StorageNode
): Promise<boolean> {
  try {
    const s3Client = getS3Client(node)
    await s3Client.send(new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${node.id}/${fileId}/${hash}`,
    }))
    return true
  } catch (error) {
    return false
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