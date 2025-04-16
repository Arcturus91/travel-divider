// ==========================================
// SERVER-SIDE ONLY - DO NOT IMPORT IN CLIENT COMPONENTS
// This file should only be imported by API routes or server components
// ==========================================

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { S3_BUCKET_REGION } from "./config";

// AWS SDK Configuration (server-side only)
const getAwsConfig = () => {
  return {
    region: S3_BUCKET_REGION, // Use the region where your resources are located
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  };
};

// Initialize the DynamoDB client (server-side only)
export const createDynamoDbClient = () => {
  const dynamoClient = new DynamoDBClient(getAwsConfig());
  return DynamoDBDocumentClient.from(dynamoClient);
};

// Initialize the S3 client (server-side only)
export const createS3Client = () => {
  return new S3Client(getAwsConfig());
};

// Table names from environment variables
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "";
