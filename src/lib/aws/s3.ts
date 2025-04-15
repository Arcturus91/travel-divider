import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, S3_BUCKET_NAME } from "./config";

/**
 * Uploads a file to S3
 * @param file The file to upload
 * @param key The key to store the file under
 * @returns The URL of the uploaded file
 */
export async function uploadFileToS3(
  file: File,
  key: string
): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);
    
    // Return the URL to the uploaded file
    return `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
}

/**
 * Gets a signed URL for an S3 object
 * @param key The key of the object
 * @param expiresIn The expiration time in seconds (default: 3600)
 * @returns The signed URL
 */
export async function getSignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    // This would typically use AWS SDK's getSignedUrl, but for now we'll just return the basic URL
    return `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
  } catch (error) {
    console.error("Error getting signed URL:", error);
    throw error;
  }
}