import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/*
 * DEPRECATED: This Lambda function is no longer needed
 *
 * File download URL generation has been moved to the Next.js API route:
 * /src/app/api/download-url/route.ts
 *
 * This function is kept for backward compatibility but should be
 * phased out in future updates.
 *
 * Migration Path:
 * 1. Update clients to use the Next.js API route instead
 * 2. Once all clients are migrated, remove this Lambda function
 * 3. Update the CloudFormation template to remove this resource
 */

// Initialize S3 client
const s3Client = new S3Client({
  region: "eu-west-3", // Explicitly set region
});

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
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

/**
 * Lambda function to generate a presigned URL for downloading files from S3
 */
export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({}),
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
          message: "Missing required parameter: fileKey",
        }),
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
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      }),
    };
  } catch (error) {
    console.error("Error generating download URL:", error);

    // Return error response
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: "Error generating download URL",
        error: error.message,
      }),
    };
  }
};
