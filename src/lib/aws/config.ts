import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";

// AWS SDK Configuration
const region = process.env.AWS_REGION;
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
};

// AWS API Gateway URL from environment variables
export const AWS_API_GATEWAY_URL = process.env.AWS_API_GATEWAY || '';

// Initialize the DynamoDB client
const dynamoClient = new DynamoDBClient({
  region,
  credentials,
});

// Initialize the DynamoDB Document client
export const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoClient);

// Initialize the S3 client
export const s3Client = new S3Client({
  region,
  credentials,
});

// Table names from environment variables
export const TRIPS_TABLE = process.env.DYNAMODB_TRIPS_TABLE;
export const EXPENSES_TABLE = process.env.DYNAMODB_EXPENSES_TABLE;
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;