# Project Achievements and Architecture Summary

## What We've Accomplished

We've successfully implemented a complete expense tracking system with the following features:

1. **Expense Management**
   - Listing all expenses with detailed information
   - Creating new expenses with validation
   - Assigning amounts to participants
   - Currency support

2. **Receipt Handling**
   - Secure file uploads to S3 using presigned POST URLs
   - Receipt viewing with presigned download URLs
   - Clean image viewing experience

3. **Architectural Improvements**
   - Properly separated client and server concerns
   - Moved sensitive AWS operations to server-side code
   - Implemented direct Next.js API routes for S3 operations
   - Fixed region configuration for S3 access

4. **Security Enhancements**
   - No AWS SDK or credentials in client-side code
   - Server-side generation of presigned URLs
   - Secure access patterns for AWS resources

## Updated Architecture

```
+------------------------+          +------------------------+          +------------------------+
|                        |          |                        |          |                        |
|    Client (Browser)    |--------->|    Next.js Server     |--------->|     AWS Services       |
|                        |          |                        |          |                        |
+------------------------+          +------------------------+          +------------------------+
                                           |         |                         |         |
                                           |         |                         |         |
                                           v         v                         v         v
                                    +--------------+  +-------------+  +---------------+  +----------------+
                                    |              |  |             |  |               |  |                |
                                    | Next.js API  |  | Static/SSR  |  | API Gateway  |  |  S3 Bucket     |
                                    | Routes       |  | Pages       |  | + Lambda     |  |  (eu-west-3)   |
                                    |              |  |             |  |               |  |                |
                                    +--------------+  +-------------+  +---------------+  +----------------+
                                           |                                    |                |
                                           |                                    |                |
                                           +----------------------------------->+----------------+
                                               Server-side AWS operations            DynamoDB
```

### Component Responsibilities

1. **Client (Browser)**
   - React components in Next.js pages
   - Form handling and validation
   - User interface for expense management
   - Makes requests only to Next.js API routes

2. **Next.js API Routes**
   - `/api/upload-url`: Generates presigned POST URLs for S3 uploads
   - `/api/download-url`: Generates presigned URLs for S3 downloads
   - `/api/expenses`: Proxies to API Gateway for expense operations
   - Keeps AWS credentials secure on server-side

3. **Next.js Pages**
   - `/trips`: Lists all expenses
   - `/trips/new-expense`: Form for creating expenses
   - `/receipts/[...key]`: Receipt viewer

4. **AWS API Gateway + Lambda**
   - Expense CRUD operations
   - DynamoDB access for data storage
   - No longer used for S3 upload/download URLs (handled by Next.js)

5. **S3 Bucket**
   - Located in eu-west-3 region (Paris)
   - Stores receipt images
   - Direct upload/download via presigned URLs

6. **DynamoDB**
   - Single table design: `travel-divider-expenses-dev`
   - Stores expense records with metadata
   - References to S3 objects via `receiptImageKey`

### Data Flow Examples

#### Creating an Expense with Receipt
1. User fills out expense form and selects image
2. Client calls `/api/upload-url` to get presigned POST URL
3. Client uploads file directly to S3 using presigned URL
4. Client submits expense data to `/api/expenses`
5. Next.js routes the request to API Gateway
6. Lambda function stores data in DynamoDB
7. User is redirected to expenses list

#### Viewing a Receipt
1. User clicks "View Receipt" button
2. Client navigates to `/receipts/[filename]`
3. Receipt page calls `/api/download-url` to get presigned download URL
4. Client displays image from the presigned URL

### Key Improvements
1. **Security**: AWS credentials only in server-side code
2. **Reliability**: Proper region configuration for S3 access
3. **Simplicity**: Direct Next.js API routes for S3 operations
4. **Performance**: Presigned URLs for direct S3 access
5. **Maintainability**: Clean separation of concerns

This architecture successfully blends the benefits of:
- Serverless backend (Lambda + DynamoDB + S3)
- Modern frontend framework (Next.js)
- Secure credential management
- Optimal user experience

The system is now properly configured, with client-side code completely isolated from AWS credentials while still allowing efficient file operations through presigned URLs.

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

## Implementation Details

- Region for S3 bucket: `eu-west-3` (Paris)
- Presigned POST used instead of PUT for better browser compatibility
- Only one DynamoDB table as per template: `travel-divider-expenses-dev`
- File paths in S3 bucket follow the pattern: `receipts/[uuid].ext`