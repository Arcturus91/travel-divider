import { NextRequest, NextResponse } from "next/server";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { v4 as uuidv4 } from "uuid";
import { createS3Client, S3_BUCKET_NAME } from "@/lib/aws/server-config";
import { S3_BUCKET_REGION } from "@/lib/aws/config";

/**
 * GET handler for getting a pre-signed upload URL using presigned POST
 * This is a server-side API route - safe for AWS operations
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contentType = searchParams.get("contentType");
    const fileName = searchParams.get("fileName");

    if (!contentType || !fileName) {
      return NextResponse.json(
        { error: "contentType and fileName are required" },
        { status: 400 }
      );
    }

    // Generate a unique key for the file
    const fileExtension =
      fileName.split(".").pop() || contentType.split("/")[1] || "jpg";
    const fileKey = `receipts/${uuidv4()}.${fileExtension}`;

    // Get a new S3 client for this request (using server-side config)
    const s3Client = createS3Client();

    // Set the expiry time (15 minutes)
    const expiresIn = 900;

    console.log(
      "Generating presigned POST URL for bucket:",
      S3_BUCKET_NAME,
      "in region:", S3_BUCKET_REGION
    );

    // Create a presigned POST request
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: S3_BUCKET_NAME,
      Key: fileKey,
      Conditions: [
        ["content-length-range", 0, 10485760], // 10MB max file size
        ["eq", "$Content-Type", contentType],
      ],
      Fields: {
        "Content-Type": contentType,
      },
      Expires: expiresIn,
    });

    return NextResponse.json({
      uploadUrl: url,
      fileKey,
      fields,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Error getting upload URL:", error);
    return NextResponse.json(
      {
        error: "Failed to get upload URL",
        details: error instanceof Error ? error.message : String(error),
        bucket: S3_BUCKET_NAME,
        region: S3_BUCKET_REGION,
      },
      { status: 500 }
    );
  }
}
