const { S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

// Initialize S3 client
const s3Client = new S3Client({});

// Get environment variables
const RECEIPTS_BUCKET = process.env.RECEIPTS_BUCKET;

/**
 * Lambda function to generate a presigned URL for uploading files to S3
 */
exports.handler = async (event) => {
  try {
    const queryParams = event.queryStringParameters || {};
    
    // Get file extension from contentType or default to .jpg
    const contentType = queryParams.contentType || 'image/jpeg';
    const fileExtension = contentType.split('/')[1] || 'jpg';
    
    // Generate a unique key for the file
    const fileKey = `receipts/${uuidv4()}.${fileExtension}`;
    
    // Create command for S3 put operation
    const putCommand = new PutObjectCommand({
      Bucket: RECEIPTS_BUCKET,
      Key: fileKey,
      ContentType: contentType
    });
    
    // Generate presigned URL with 5-minute expiration
    const presignedUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 300 // 5 minutes
    });
    
    // Return the presigned URL and file key
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // For CORS support
      },
      body: JSON.stringify({
        uploadUrl: presignedUrl,
        fileKey: fileKey
      })
    };
    
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    
    // Return error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Error generating upload URL',
        error: error.message
      })
    };
  }
};