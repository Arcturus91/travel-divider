import { NextRequest, NextResponse } from "next/server";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { v4 as uuidv4 } from "uuid";

/**
 * GET handler for getting a pre-signed upload URL using presigned POST
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

    // Initialize S3 client with server-side credentials - FIXED REGION
    const s3Client = new S3Client({
      region: process.env.AWS_REGION, // Using the correct region for the bucket
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });

    // Set the expiry time (15 minutes)
    const expiresIn = 900;

    const bucketName = process.env.S3_BUCKET_NAME || "";
    console.log(
      "Generating presigned POST URL for bucket:",
      bucketName,
      "in region: eu-west-3"
    );

    // Create a presigned POST request
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: bucketName,
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

    console.log("Generated presigned POST URL:", url);

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
        bucket: process.env.S3_BUCKET_NAME,
        region: "eu-west-3",
      },
      { status: 500 }
    );
  }
}
