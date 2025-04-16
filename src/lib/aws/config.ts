// This file only contains client-safe configuration
// No AWS credentials here - will be used by server and client codee

export const AWS_API_GATEWAY_URL = process.env.AWS_API_GATEWAY;

export const S3_BUCKET_REGION = process.env.AWS_REGION;

export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
