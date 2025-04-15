# Travel Divider Deployment Guide

This guide explains how to deploy the Travel Divider application to AWS using the AWS Serverless Application Model (SAM).

## Prerequisites

Before you can deploy the application, you need to:

1. Install the AWS CLI and configure your credentials
2. Install the AWS SAM CLI
3. Install Node.js 18 or newer
4. Install jq (for deployment report generation)

You can run the setup script to check your environment:

```bash
npm run deploy:setup
```

## Deployment Configuration

The application can be deployed to different environments (dev, staging, prod) using configuration files in the `config/` directory. Each environment has its own configuration file:

- `config/dev.json` - Development environment
- `config/staging.json` - Staging environment
- `config/prod.json` - Production environment

You can modify these files to customize the deployment for each environment.

## Deployment Commands

The following commands are available for deployment:

### Deploy to Development Environment

```bash
npm run deploy:dev
```

This deploys the application to the development environment in eu-west-3 region.

### Deploy to Staging Environment

```bash
npm run deploy:staging
```

This deploys the application to the staging environment in eu-west-3 region.

### Deploy to Production Environment

```bash
npm run deploy:prod
```

This deploys the application to the production environment in eu-west-3 region.

### Custom Deployment

You can also customize the deployment command:

```bash
npm run deploy -- --environment dev --region eu-west-3 --stack-name my-travel-divider
```

Or directly use the script:

```bash
bash scripts/deploy.sh --environment dev --region eu-west-3 --stack-name my-travel-divider
```

### Generate Deployment Report

After deployment, you can generate a report of deployed resources:

```bash
npm run report -- --environment dev --region eu-west-3
```

This creates a Markdown file with information about the deployed resources.

## Deployed Resources

The application deploys the following AWS resources:

1. **DynamoDB Table**: Stores expense data
   - Table name: `travel-divider-expenses-{env}`

2. **S3 Bucket**: Stores receipt images
   - Bucket name: `travel-divider-receipts-{env}-{account_id}-{region}`
   - Configured with:
     - Server-side encryption (AES-256)
     - Lifecycle policies
     - CORS configuration for web access
     - Public access blocking
     - Versioning enabled

3. **Lambda Functions**:
   - `CreateExpenseFunction`: Creates new expenses
   - `GetExpensesFunction`: Retrieves expenses
   - `UpdateExpenseFunction`: Updates expenses
   - `DeleteExpenseFunction`: Deletes expenses
   - `GenerateUploadUrlFunction`: Generates S3 presigned URLs for uploads
   - `GetSignedDownloadUrlFunction`: Generates S3 presigned URLs for downloads

4. **API Gateway**: Exposes Lambda functions as REST APIs

## Environment Variables

Lambda functions receive the following environment variables:

- `EXPENSES_TABLE`: DynamoDB table name for expenses
- `RECEIPTS_BUCKET`: S3 bucket name for receipt images
- `ENVIRONMENT`: Deployment environment (dev, staging, prod)
- `ALLOWED_ORIGIN`: CORS allowed origins

## Outputs

After deployment, important resource information is available as CloudFormation outputs:

- API endpoint URLs
- DynamoDB table name
- S3 bucket name and URL

You can view these outputs in the deployment logs or by generating a deployment report.

## Monitoring Deployments

Deployment logs are stored in the `deployment-logs/` directory. Each deployment creates log files with timestamps.

## CI/CD Integration

The deployment scripts can be integrated into CI/CD pipelines by executing them in the build phase. For example, with GitHub Actions:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v1
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-west-3
      - name: Deploy to development
        run: npm run deploy:dev
```

## Troubleshooting

If you encounter issues during deployment:

1. Check the AWS CloudFormation console for error messages
2. Review the deployment logs in the `deployment-logs/` directory
3. Ensure your AWS credentials have the necessary permissions
4. Make sure the S3 bucket names are globally unique
5. Verify that the AWS region is supported and appropriate for your use case

For more help, see the [AWS SAM CLI documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html).