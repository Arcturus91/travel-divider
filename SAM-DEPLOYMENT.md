# Travel Divider SAM Deployment Guide

This document explains how to deploy the Travel Divider application to AWS using the AWS Serverless Application Model (SAM).

## Prerequisites

Before deploying, ensure you have:

1. AWS CLI installed and configured with appropriate credentials
2. AWS SAM CLI installed 
3. Node.js 18.x or later

## Deployment Buckets

SAM requires an S3 bucket to store deployment artifacts. You can create the necessary deployment bucket for each environment using:

```bash
# For development environment
npm run create-bucket:dev

# For staging environment
npm run create-bucket:staging

# For production environment
npm run create-bucket:prod
```

These commands will create appropriately named deployment buckets in the eu-west-3 region.

## Configuration

The deployment configuration is stored in `samconfig.toml`. This file contains profiles for different environments:

- `default` - Default configuration (maps to dev)
- `dev` - Development environment
- `staging` - Staging environment
- `prod` - Production environment

Each profile specifies:
- Stack name
- Deployment S3 bucket
- AWS region
- Parameter overrides for the CloudFormation template
- Resource tags

## Deployment Commands

To deploy to the different environments, use these npm scripts:

```bash
# Deploy to development environment
npm run deploy:dev

# Deploy to staging environment
npm run deploy:staging

# Deploy to production environment
npm run deploy:prod
```

Each command will:
1. Build the SAM application
2. Deploy to the specified environment using the corresponding profile in samconfig.toml

## Testing a Deployment

After deployment, you can generate a report of the deployed resources with:

```bash
npm run report -- --environment dev --region eu-west-3
```

This will create a markdown file with details about all deployed resources.

## Troubleshooting

### Common Issues

1. **Bucket Does Not Exist**: If you see an error about a missing deployment bucket, run the appropriate bucket creation command (e.g., `npm run create-bucket:dev`).

2. **Permission Errors**: Ensure your AWS credentials have sufficient permissions for creating the required resources.

3. **Name Conflicts**: If you receive errors about resource names already in use, update the relevant parameters in the `samconfig.toml` file.

4. **Build Errors**: If the SAM build fails, check for TypeScript errors and ensure all dependencies are properly installed.

### Accessing Logs

To view logs for a deployed Lambda function:

```bash
sam logs -n FunctionName --stack-name travel-divider-dev
```

Replace `FunctionName` with the name of your function and `travel-divider-dev` with your stack name.

### CloudFormation Status

To check the status of your CloudFormation stack:

```bash
aws cloudformation describe-stacks --stack-name travel-divider-dev --region eu-west-3
```

## Resources Created

The SAM template will create the following AWS resources:

1. **DynamoDB Table**: For storing expenses data
2. **S3 Bucket**: For storing receipt images with proper security settings
3. **Lambda Functions**: For API operations (create, read, update, delete expenses)
4. **API Gateway**: For exposing Lambda functions as REST APIs
5. **IAM Roles and Policies**: For secure access to AWS resources

## Parameter Overrides

The template accepts the following parameters:

- `Environment`: Deployment environment (dev, staging, prod)
- `ExpensesTableName`: Name of the DynamoDB table
- `ReceiptsBucketName`: Base name for the S3 bucket
- `ApiStageName`: API Gateway stage name
- `AllowedOrigins`: CORS allowed origins

## Cleanup

To remove the deployed resources:

```bash
aws cloudformation delete-stack --stack-name travel-divider-dev --region eu-west-3
```

This will delete all resources created by the SAM template. Note that this won't delete the deployment bucket.