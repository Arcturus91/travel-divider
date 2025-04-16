import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createS3Client, S3_BUCKET_NAME } from "@/lib/aws/server-config";
import { S3_BUCKET_REGION } from "@/lib/aws/config";

/**
 * GET handler for getting a pre-signed download URL
 * This is a server-side API route - safe for AWS operations
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileKey = searchParams.get('fileKey');
    
    if (!fileKey) {
      return NextResponse.json(
        { error: 'fileKey is required' },
        { status: 400 }
      );
    }
    
    // Get a new S3 client for this request
    const s3Client = createS3Client();
    
    // Set the expiry time (1 hour default)
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600', 10);
    
    // Create a GetObject command
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileKey,
    });
    
    // Generate a presigned URL for downloading
    const downloadUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: Math.min(expiresIn, 7200) // Cap at 2 hours max
    });
    
    // Return the presigned URL and expiration
    return NextResponse.json({
      downloadUrl,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
    });
  } catch (error) {
    console.error('Error getting download URL:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get download URL',
        details: error instanceof Error ? error.message : String(error),
        bucket: S3_BUCKET_NAME,
        region: S3_BUCKET_REGION
      },
      { status: 500 }
    );
  }
}
