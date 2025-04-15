import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Function to generate a unique ID without uuid dependency
const generateId = () => Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15) +
                       Date.now().toString(36);

// Initialize S3 client
const s3Client = new S3Client({});

// Get environment variables
const RECEIPTS_BUCKET = process.env.RECEIPTS_BUCKET;

/**
 * Generates a pre-signed URL for uploading an object to S3
 */
async function generateSignedUploadUrl(contentType, fileName, expiresIn = 900) {
  try {
    // Generate a unique key for the file
    const fileExtension = fileName ? fileName.split('.').pop() : contentType.split('/')[1] || 'jpg';
    const fileKey = `receipts/${generateId()}.${fileExtension}`;
    
    const command = new PutObjectCommand({
      Bucket: RECEIPTS_BUCKET,
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
 * CORS configuration for API Gateway responses
 */
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,OPTIONS'
};

/**
 * Lambda function to generate a presigned URL for uploading files to S3
 */
export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({})
    };
  }
  
  try {
    const queryParams = event.queryStringParameters || {};
    
    // Get file info from query parameters
    const contentType = queryParams.contentType || 'image/jpeg';
    const fileName = queryParams.fileName;
    
    // Custom expiration time (in seconds)
    const expiresIn = parseInt(queryParams.expiresIn, 10) || 900; // 15 minutes default
    
    // Generate a pre-signed URL
    const { uploadUrl, fileKey } = await generateSignedUploadUrl(
      contentType, 
      fileName, 
      Math.min(expiresIn, 3600) // Cap at 1 hour max
    );
    
    // Return the presigned URL and file key
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        uploadUrl,
        fileKey,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
      })
    };
    
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    
    // Return error response
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: 'Error generating upload URL',
        error: error.message
      })
    };
  }
};