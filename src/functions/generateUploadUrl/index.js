import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

/*
 * DEPRECATED: This Lambda function is no longer needed
 * 
 * File upload URL generation has been moved to the Next.js API route:
 * /src/app/api/upload-url/route.ts
 *
 * This function is kept for backward compatibility but should be 
 * phased out in future updates.
 *
 * Migration Path:
 * 1. Update clients to use the Next.js API route instead
 * 2. Once all clients are migrated, remove this Lambda function
 * 3. Update the CloudFormation template to remove this resource
 */

// Function to generate a unique ID without uuid dependency
const generateId = () => Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15) +
                       Date.now().toString(36);

// Initialize S3 client
const s3Client = new S3Client({
  region: 'eu-west-3', // Explicitly set region
});

// Get environment variables
const RECEIPTS_BUCKET = process.env.RECEIPTS_BUCKET;

/**
 * Generates a pre-signed POST URL for uploading an object to S3
 * This provides better permissions handling than the PUT method
 */
async function generateSignedUploadUrl(contentType, fileName, expiresIn = 900) {
  try {
    // Generate a unique key for the file
    const fileExtension = fileName ? fileName.split('.').pop() : contentType.split('/')[1] || 'jpg';
    const fileKey = `receipts/${generateId()}.${fileExtension}`;
    
    console.log("Generating presigned POST URL for bucket:", RECEIPTS_BUCKET);

    // Create a presigned POST request
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: RECEIPTS_BUCKET,
      Key: fileKey,
      Conditions: [
        ['content-length-range', 0, 10485760], // 10MB max file size
        ['eq', '$Content-Type', contentType],
      ],
      Fields: {
        'Content-Type': contentType,
        // No need to specify ACL here, will use the bucket default
      },
      Expires: expiresIn,
    });
    
    return {
      uploadUrl: url,
      fileKey,
      fields
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
 * Lambda function to generate a presigned POST URL for uploading files to S3
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
    
    // Generate a pre-signed POST URL
    const { uploadUrl, fileKey, fields } = await generateSignedUploadUrl(
      contentType, 
      fileName, 
      Math.min(expiresIn, 3600) // Cap at 1 hour max
    );
    
    // Return the presigned URL, fields, and file key
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        uploadUrl,
        fileKey,
        fields,
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