# Travel Divider

A web application for tracking and splitting travel expenses among friends and family. Built with Next.js, TypeScript, AWS services, and Tailwind CSS.

## Features

- Create and manage trips with multiple participants
- Add expenses and assign them to specific people
- Upload receipts and store them securely
- Calculate who owes what to whom
- Generate payment summary reports

## Tech Stack

- **Frontend**: Next.js with App Router, React, TypeScript, Tailwind CSS
- **Backend**: AWS Lambda, API Gateway, AWS SAM
- **Database**: Amazon DynamoDB
- **Storage**: Amazon S3 for receipt images
- **Authentication**: (TBD)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- AWS account with appropriate permissions
- AWS SAM CLI for deploying serverless resources

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/travel-divider.git
   cd travel-divider
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment variables
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` with your AWS API Gateway URL from the AWS Lambda deployment.
   
   The AWS_API_GATEWAY variable should point to your deployed AWS API Gateway endpoint. During development, the Next.js API routes will proxy requests to this AWS endpoint.

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## AWS Deployment

To deploy the AWS resources:

1. Make sure you have the AWS SAM CLI installed and configured.

2. Build and package the application
   ```bash
   npm run sam-package
   ```

3. Deploy to AWS
   ```bash
   npm run sam-deploy
   ```

## Project Structure

```
travel-divider/
├── src/
│   ├── app/                # Next.js App Router pages and layouts
│   │   ├── api/            # Next.js API routes (backend proxy to AWS)
│   │   └── ...             # Page components and layouts
│   ├── components/         # Reusable React components
│   ├── functions/          # Lambda function handlers
│   ├── lib/                # Utility functions and AWS clients
│   │   ├── aws/            # AWS API client and services
│   │   └── ...             # Other utility functions
│   ├── models/             # TypeScript interfaces and types
│   └── styles/             # Global styles
├── public/                 # Static assets
├── template.yaml          # AWS SAM template
└── ...config files
```

## AWS Resources

The application uses the following AWS resources:

1. **DynamoDB Table** - For storing expenses with fields:
   - expenseId (Primary Key)
   - createdAt (Sort Key)
   - totalAmount
   - currency
   - isShared
   - receiptImageKey
   - allocations (list of personName and amount)

2. **S3 Bucket** - For storing receipt images

3. **Lambda Functions**:
   - CreateExpense - Creates a new expense
   - GetExpenses - Retrieves expenses with optional filtering
   - UpdateExpense - Updates an existing expense
   - DeleteExpense - Deletes an expense and its receipt image
   - GenerateUploadUrl - Generates a presigned URL for S3 uploads

4. **IAM Role** - Permissions for Lambda functions to access DynamoDB and S3

## License

MIT