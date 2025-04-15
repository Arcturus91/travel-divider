#!/bin/bash
set -e

# Default values
ENVIRONMENT="dev"
REGION="eu-west-3"
STACK_NAME="travel-divider"

# Color definitions for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print usage information
function print_usage {
  echo "Usage: $0 [options]"
  echo "Options:"
  echo "  -e, --environment ENV   Deployment environment (dev, staging, prod) [default: dev]"
  echo "  -r, --region REGION     AWS region [default: eu-west-3]"
  echo "  -s, --stack-name NAME   Stack name prefix [default: travel-divider]"
  echo "  -h, --help              Show this help message"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    -e|--environment)
      ENVIRONMENT="$2"
      shift
      shift
      ;;
    -r|--region)
      REGION="$2"
      shift
      shift
      ;;
    -s|--stack-name)
      STACK_NAME="$2"
      shift
      shift
      ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      print_usage
      exit 1
      ;;
  esac
done

# Create bucket name
BUCKET_NAME="${STACK_NAME}-deployment-${ENVIRONMENT}-${REGION}"

echo -e "${BLUE}Creating deployment bucket: ${BUCKET_NAME}${NC}"

# Check if bucket exists
if aws s3api head-bucket --bucket "${BUCKET_NAME}" --region "${REGION}" 2>/dev/null; then
  echo -e "${YELLOW}Bucket ${BUCKET_NAME} already exists${NC}"
else
  # Create bucket
  echo -e "${BLUE}Creating bucket: ${BUCKET_NAME}${NC}"
  
  # For eu-west-3 (Paris) region, we need to specify LocationConstraint
  aws s3api create-bucket \
    --bucket "${BUCKET_NAME}" \
    --region "${REGION}" \
    --create-bucket-configuration LocationConstraint="${REGION}"
  
  # Enable versioning
  echo -e "${BLUE}Enabling versioning on bucket${NC}"
  aws s3api put-bucket-versioning \
    --bucket "${BUCKET_NAME}" \
    --versioning-configuration Status=Enabled \
    --region "${REGION}"
  
  # Add tags
  echo -e "${BLUE}Adding tags to bucket${NC}"
  aws s3api put-bucket-tagging \
    --bucket "${BUCKET_NAME}" \
    --tagging "TagSet=[{Key=Application,Value=${STACK_NAME}},{Key=Environment,Value=${ENVIRONMENT}}]" \
    --region "${REGION}"
  
  echo -e "${GREEN}Bucket ${BUCKET_NAME} created successfully${NC}"
fi

echo -e "${GREEN}You can now deploy using:${NC}"
echo -e "${YELLOW}npm run deploy:${ENVIRONMENT}${NC}"

exit 0