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
    let fileKey = searchParams.get('fileKey');
    const direct = searchParams.get('direct') === 'true';
    
    if (!fileKey) {
      return NextResponse.json(
        { error: 'fileKey is required' },
        { status: 400 }
      );
    }
    
    // Fix double-encoded slashes (%252F) → (%2F) → (/)
    // First try to decode the URL component to see if it's double-encoded
    try {
      // If it contains '%25' (encoded %), it might be double-encoded
      if (fileKey.includes('%25')) {
        // Decode once to handle potential double-encoding
        fileKey = decodeURIComponent(fileKey);
      }
    } catch (e) {
      console.warn("Error decoding possibly double-encoded URL:", e);
      // Continue with original fileKey if decoding fails
    }
    
    console.log("Using fileKey:", fileKey);
    
    // Get a new S3 client for this request
    const s3Client = createS3Client();
    
    // Set the expiry time (1 hour default)
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600', 10);
    
    // Ensure fileKey is well-formed - it should start with 'receipts/'
    const normalizedKey = fileKey.startsWith('receipts/') 
      ? fileKey 
      : `receipts/${fileKey}`;
      
    console.log("Normalized key:", normalizedKey);
      
    // Create a GetObject command
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: normalizedKey,
    });
    
    // Generate a presigned URL for downloading
    const downloadUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: Math.min(expiresIn, 7200) // Cap at 2 hours max
    });
    
    console.log("Generated presigned URL:", downloadUrl);
    
    // If direct parameter is true, redirect directly to the URL
    if (direct) {
      return NextResponse.redirect(downloadUrl);
    }
    
    // Otherwise return the JSON response with URL
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
