const { S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand } = require('@aws-sdk/client-s3');

// Initialize S3 client
const s3Client = new S3Client({});

// Get environment variables
const RECEIPTS_BUCKET = process.env.RECEIPTS_BUCKET;

/**
 * Generates a pre-signed URL for downloading an object from S3
 */
async function generateSignedDownloadUrl(fileKey, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: RECEIPTS_BUCKET,
      Key: fileKey,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error("Error generating download URL:", error);
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
 * Lambda function to generate a presigned URL for downloading files from S3
 */
exports.handler = async (event) => {
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
    
    // Get file key from query parameters
    const fileKey = queryParams.fileKey;
    
    if (!fileKey) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          message: 'Missing required parameter: fileKey'
        })
      };
    }
    
    // Custom expiration time (in seconds)
    const expiresIn = parseInt(queryParams.expiresIn, 10) || 3600; // 1 hour default
    
    // Generate a pre-signed URL
    const downloadUrl = await generateSignedDownloadUrl(
      fileKey, 
      Math.min(expiresIn, 86400) // Cap at 24 hours max
    );
    
    // Return the presigned URL
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        downloadUrl,
        fileKey,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
      })
    };
    
  } catch (error) {
    console.error('Error generating download URL:', error);
    
    // Return error response
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: 'Error generating download URL',
        error: error.message
      })
    };
  }
};