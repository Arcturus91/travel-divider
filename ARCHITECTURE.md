# Travel Divider Architecture

## Overview

This application uses a hybrid architecture with:

1. Next.js frontend and API routes (frontend & middleware layer)
2. AWS Lambda functions and API Gateway (backend)
3. S3 and DynamoDB for storage

## Core Principles

- **Security:** AWS credentials only in server-side code
- **Separation:** Client code never directly uses AWS SDKs
- **Reliability:** Server-side generation of presigned URLs
- **Simplicity:** Clean API for frontend consumption

## Architecture Diagram

```
Client Side (Browser)                   Server Side (Next.js)                  AWS Cloud
+-------------------+                 +------------------------+             +------------------+
|                   |                 |                        |             |                  |
|  React Components | --- API call -> |  Next.js API Routes    | ---------> |  S3 Bucket       |
|                   |                 |  (Server-Side Only)    |             |  (eu-west-3)     |
+-------------------+                 |                        |             |                  |
        |                             +------------------------+             +------------------+
        |                                       |                                     ^
        |                                       |                                     |
        | Presigned URL                         | Presigned URL                      |
        | for direct S3                         | Generation                         |
        | access                                |                                     |
        v                                       |                                     |
+-------------------+                           |                                    File
|  Direct S3 Upload |                           |                                  Upload/Download
|  (Presigned POST) | ------------------------------------------->                   |
+-------------------+                                                                |
                                                                                     v
                                                                            +------------------+
                                                                            |                  |
                                                                            |  API Gateway     |
                                                                            |                  |
                                                                            +------------------+
                                                                                     |
                                                                                     |
                                                                                     v
                                                                            +------------------+
                                                                            |                  |
                                                                            |  Lambda Functions|
                                                                            |                  |
                                                                            +------------------+
                                                                                     |
                                                                                     |
                                                                                     v
                                                                            +------------------+
                                                                            |                  |
                                                                            |  DynamoDB        |
                                                                            |                  |
                                                                            +------------------+
```

## Key Flows

### File Upload Flow:

1. Client requests an upload URL from the Next.js API route
2. Next.js API route creates an S3 client (server-side only)
3. Next.js API route generates a presigned POST URL with fields
4. Client uploads directly to S3 using the presigned POST URL
5. No AWS credentials exposed to client

### Expense Management Flow:

1. Client makes CRUD requests to Next.js API routes
2. Next.js API routes forward to AWS API Gateway endpoints
3. Lambda functions interact with DynamoDB (business logic)
4. Response flows back through API Gateway, Next.js, to client

## Security Considerations

- AWS credentials only exist on server-side
- Presigned URLs have limited lifespan (15 min for uploads, 1 hour for downloads)
- S3 bucket CORS setup to allow uploads from application domain
- Fine-grained IAM permissions for Lambda functions

## Implementation Details

- Region for S3 bucket: `eu-west-3` (Paris)
- Presigned POST used instead of PUT for better browser compatibility
- Only one DynamoDB table as per template: `travel-divider-expenses-dev`

## Migration Notes

We've moved critical AWS operations from Lambda functions to Next.js API routes:

1. **File Upload URLs**: 
   - Old: `/upload-url` Lambda function
   - New: `/api/upload-url` Next.js API route

2. **File Download URLs**:
   - Old: `/download-url` Lambda function
   - New: `/api/download-url` Next.js API route

The Lambda functions are kept temporarily for backward compatibility but are marked as deprecated. This gives us:

- Better security control (AWS SDK and credentials only in server-side code)
- Simpler architecture (fewer hops between components)
- More direct error handling (no proxy layer)
- Reduced costs (fewer Lambda invocations)

Future work should include removing these Lambda functions entirely once all clients are migrated to use the Next.js API routes.