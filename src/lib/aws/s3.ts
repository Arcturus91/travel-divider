// This file is obsolete - all S3 operations should go through API routes
// Kept temporarily for reference purposes

/*
 * Architecture Overview:
 * 
 * CLIENT SIDE:
 * - No direct AWS SDK usage
 * - No AWS credentials
 * - All AWS operations go through the Next.js API routes
 * 
 * SERVER SIDE (Next.js API routes):
 * - Creates ephemeral AWS clients when needed
 * - Handles all AWS interactions
 * - Uses server-side credentials
 * - Returns presigned URLs for upload/download
 * 
 * AWS LAMBDA FUNCTIONS:
 * - Handle DynamoDB operations
 * - Used as fallback for complex operations
 * - API Gateway integration for REST endpoints
 * 
 * SECURITY:
 * - AWS credentials only in server-side code
 * - Presigned URLs for secure, temporary access to S3
 * - Fine-grained IAM permissions
 * 
 * PRESIGNED URL FLOW:
 * 1. Client requests presigned URL from Next.js API route
 * 2. API route creates a temporary AWS client with proper credentials
 * 3. API route generates presigned URL with S3 client
 * 4. Client uses presigned URL to upload/download directly to/from S3
 */

// This file is deprecated - use server-side API routes instead