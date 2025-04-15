import { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { s3Client, S3_BUCKET_NAME } from "./config";

/**
 * Uploads a file to S3
 * @param file The file to upload
 * @param key The key to store the file under (optional - will generate if not provided)
 * @returns The URL of the uploaded file
 */
export async function uploadFileToS3(
  file: File,
  key?: string
): Promise<string> {
  try {
    const fileKey = key || `receipts/${uuidv4()}.${file.name.split('.').pop()}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
      ACL: 'private',
      ServerSideEncryption: 'AES256',
      ContentDisposition: 'inline',
      Metadata: {
        'uploaded-by': 'travel-divider-app',
        'original-filename': file.name
      }
    });

    await s3Client.send(command);
    
    // Return the key of the uploaded file
    return fileKey;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
}

/**
 * Generates a pre-signed URL for retrieving an object from S3
 * @param key The key of the object
 * @param expiresIn The expiration time in seconds (default: 1 hour)
 * @returns The pre-signed URL
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error("Error generating download URL:", error);
    throw error;
  }
}

/**
 * Generates a pre-signed URL for uploading an object to S3
 * @param contentType The content type of the file to be uploaded
 * @param fileName Optional original file name to use for metadata
 * @param expiresIn The expiration time in seconds (default: 15 minutes)
 * @returns Object containing the upload URL and the S3 key
 */
export async function getSignedUploadUrl(
  contentType: string,
  fileName?: string,
  expiresIn: number = 900
): Promise<{ uploadUrl: string; fileKey: string }> {
  try {
    // Generate a unique key for the file
    const fileExtension = fileName ? fileName.split('.').pop() : contentType.split('/')[1] || 'jpg';
    const fileKey = `receipts/${uuidv4()}.${fileExtension}`;
    
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
      ACL: 'private',
      ServerSideEncryption: 'AES256',
      Metadata: fileName ? { 'original-filename': fileName } : undefined
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
    
    return {
      uploadUrl,
      fileKey
    };
  } catch (error) {
    console.error("Error generating upload URL:", error);
    throw error;
  }
}

/**
 * Deletes an object from S3
 * @param key The key of the object to delete
 * @returns A promise that resolves when the object is deleted
 */
export async function deleteFileFromS3(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw error;
  }
}