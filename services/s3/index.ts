import { getS3BucketName, getS3ConnectionConfig } from '@/lib/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Credentials = getS3ConnectionConfig()
const bucket = getS3BucketName()
export const s3 = new S3Client(s3Credentials);

export const uploadToS3 = async (fileName: string, fileBuffer: Buffer, fileType: string): Promise<string> => {
  try {
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      Body: fileBuffer,
      ContentType: fileType,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    return constructFileUrl(fileName)
  } catch (error) {
    throw new Error(`S3 Upload Failed: ${(error as Error).message}`);
  }
};

function constructFileUrl(fileName: string) {
  return `https://${bucket}.s3.${s3Credentials.region}.amazonaws.com/${fileName}`;
}