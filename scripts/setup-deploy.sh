#!/bin/bash
set -e

# Color definitions for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================================="
echo -e "Travel Divider Deployment Setup"
echo -e "==========================================================${NC}"

# Check for Node.js
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  echo -e "${GREEN}Node.js is installed: ${NODE_VERSION}${NC}"
else
  echo -e "${RED}Node.js is not installed. Please install Node.js 18.x or later.${NC}"
  exit 1
fi

# Check for AWS CLI
if command -v aws &> /dev/null; then
  AWS_VERSION=$(aws --version)
  echo -e "${GREEN}AWS CLI is installed: ${AWS_VERSION}${NC}"
else
  echo -e "${RED}AWS CLI is not installed. Installing...${NC}"
  echo -e "${YELLOW}Please visit https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html for installation instructions.${NC}"
  exit 1
fi

# Check for SAM CLI
if command -v sam &> /dev/null; then
  SAM_VERSION=$(sam --version)
  echo -e "${GREEN}AWS SAM CLI is installed: ${SAM_VERSION}${NC}"
else
  echo -e "${RED}AWS SAM CLI is not installed. Installing...${NC}"
  echo -e "${YELLOW}Please visit https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html for installation instructions.${NC}"
  exit 1
fi

# Check for jq
if command -v jq &> /dev/null; then
  JQ_VERSION=$(jq --version)
  echo -e "${GREEN}jq is installed: ${JQ_VERSION}${NC}"
else
  echo -e "${RED}jq is not installed. Installing...${NC}"
  echo -e "${YELLOW}Please install jq using your package manager (e.g., brew install jq, apt-get install jq)${NC}"
  exit 1
fi

# Check if AWS CLI is configured
if aws sts get-caller-identity &> /dev/null; then
  AWS_IDENTITY=$(aws sts get-caller-identity)
  AWS_ACCOUNT=$(echo "$AWS_IDENTITY" | jq -r '.Account')
  AWS_USER=$(echo "$AWS_IDENTITY" | jq -r '.Arn')
  echo -e "${GREEN}AWS CLI is configured. Account: ${AWS_ACCOUNT}, User: ${AWS_USER}${NC}"
else
  echo -e "${RED}AWS CLI is not configured. Please run 'aws configure' to set up your AWS credentials.${NC}"
  exit 1
fi

# Install required npm packages
echo -e "${BLUE}Installing required npm packages...${NC}"
npm install --no-save commander aws-sdk

# Make scripts executable
echo -e "${BLUE}Making deployment scripts executable...${NC}"
chmod +x scripts/deploy.sh
chmod +x scripts/generate-report.sh

# Create deployment logs directory
mkdir -p deployment-logs

# Add commander for build-lambda.js script (if not already in package.json)
if ! grep -q '"commander"' package.json; then
  echo -e "${BLUE}Adding commander package for build scripts...${NC}"
  npm install --save-dev commander
fi

echo -e "${GREEN}Deployment setup complete! You can now deploy the application using:${NC}"
echo -e "${YELLOW}npm run deploy -- --environment dev --region eu-west-3${NC}"
echo -e "${GREEN}Or using the shortcuts:${NC}"
echo -e "${YELLOW}npm run deploy:dev${NC}"
echo -e "${YELLOW}npm run deploy:staging${NC}"
echo -e "${YELLOW}npm run deploy:prod${NC}"

# Additional help
echo -e "\n${BLUE}Additional commands:${NC}"
echo -e "Generate a deployment report:  ${YELLOW}bash scripts/generate-report.sh --environment dev${NC}"
echo -e "Build Lambda functions:        ${YELLOW}npm run build:lambda${NC}"

exit 0