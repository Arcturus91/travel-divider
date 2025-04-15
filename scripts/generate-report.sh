#!/bin/bash
set -e

# Color definitions for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="dev"
REGION="eu-west-3"
STACK_NAME="travel-divider"
OUTPUT_FILE="deployment-report.md"

# Print usage information
function print_usage {
  echo "Usage: $0 [options]"
  echo "Options:"
  echo "  -e, --environment ENV   Deployment environment (dev, staging, prod) [default: dev]"
  echo "  -r, --region REGION     AWS region [default: eu-west-3]"
  echo "  -s, --stack-name NAME   CloudFormation stack name prefix [default: travel-divider]"
  echo "  -o, --output FILE       Output file for report [default: deployment-report.md]"
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
    -o|--output)
      OUTPUT_FILE="$2"
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

# Set full stack name with environment suffix
FULL_STACK_NAME="${STACK_NAME}-${ENVIRONMENT}"

echo -e "${BLUE}=========================================================="
echo -e "Travel Divider Deployment Report"
echo -e "Environment: ${ENVIRONMENT}"
echo -e "Region: ${REGION}"
echo -e "Stack Name: ${FULL_STACK_NAME}"
echo -e "Timestamp: $(date)"
echo -e "==========================================================${NC}"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
  echo -e "${RED}Error: AWS CLI is not configured properly. Please run 'aws configure' and try again.${NC}"
  exit 1
fi

# Create temporary directory for report data
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

# Get stack information
echo -e "${BLUE}Fetching CloudFormation stack information...${NC}"
if ! aws cloudformation describe-stacks --stack-name "${FULL_STACK_NAME}" --region "${REGION}" > "${TEMP_DIR}/stack.json" 2>/dev/null; then
  echo -e "${RED}Error: Stack '${FULL_STACK_NAME}' not found in region '${REGION}'.${NC}"
  exit 1
fi

# Get stack resources
echo -e "${BLUE}Fetching CloudFormation stack resources...${NC}"
aws cloudformation describe-stack-resources --stack-name "${FULL_STACK_NAME}" --region "${REGION}" > "${TEMP_DIR}/resources.json"

# Get stack outputs
jq -r '.Stacks[0].Outputs' "${TEMP_DIR}/stack.json" > "${TEMP_DIR}/outputs.json"

# Extract essential information
STACK_STATUS=$(jq -r '.Stacks[0].StackStatus' "${TEMP_DIR}/stack.json")
CREATION_TIME=$(jq -r '.Stacks[0].CreationTime' "${TEMP_DIR}/stack.json")
LAST_UPDATE_TIME=$(jq -r '.Stacks[0].LastUpdatedTime // "N/A"' "${TEMP_DIR}/stack.json")
RESOURCE_COUNT=$(jq -r '.StackResources | length' "${TEMP_DIR}/resources.json")

# Extract DynamoDB and S3 resource information
DYNAMO_TABLE=$(jq -r '.[] | select(.OutputKey=="ExpensesTable") | .OutputValue' "${TEMP_DIR}/outputs.json")
S3_BUCKET=$(jq -r '.[] | select(.OutputKey=="ReceiptsBucket") | .OutputValue' "${TEMP_DIR}/outputs.json")
API_ENDPOINT=$(jq -r '.[] | select(.OutputKey=="ApiEndpoint") | .OutputValue' "${TEMP_DIR}/outputs.json")

# Check DynamoDB table
echo -e "${BLUE}Checking DynamoDB table...${NC}"
if [ -n "${DYNAMO_TABLE}" ]; then
  aws dynamodb describe-table --table-name "${DYNAMO_TABLE}" --region "${REGION}" > "${TEMP_DIR}/dynamo.json" 2>/dev/null || echo "{}" > "${TEMP_DIR}/dynamo.json"
  DYNAMO_EXISTS=$(jq -r 'if has("Table") then "Yes" else "No" end' "${TEMP_DIR}/dynamo.json")
  
  if [ "${DYNAMO_EXISTS}" = "Yes" ]; then
    DYNAMO_STATUS=$(jq -r '.Table.TableStatus' "${TEMP_DIR}/dynamo.json")
    DYNAMO_ITEM_COUNT=$(aws dynamodb scan --table-name "${DYNAMO_TABLE}" --select COUNT --region "${REGION}" --query "Count" --output text 2>/dev/null || echo "N/A")
    DYNAMO_SIZE=$(jq -r '.Table.TableSizeBytes // "0"' "${TEMP_DIR}/dynamo.json")
    DYNAMO_SIZE_MB=$(awk "BEGIN { printf \"%.2f\", ${DYNAMO_SIZE}/1024/1024 }")
  else
    DYNAMO_STATUS="Not Found"
    DYNAMO_ITEM_COUNT="N/A"
    DYNAMO_SIZE_MB="N/A"
  fi
else
  DYNAMO_EXISTS="No"
  DYNAMO_STATUS="Not Found"
  DYNAMO_ITEM_COUNT="N/A"
  DYNAMO_SIZE_MB="N/A"
fi

# Check S3 bucket
echo -e "${BLUE}Checking S3 bucket...${NC}"
if [ -n "${S3_BUCKET}" ]; then
  if aws s3api head-bucket --bucket "${S3_BUCKET}" --region "${REGION}" 2>/dev/null; then
    S3_EXISTS="Yes"
    
    # Get bucket versioning
    aws s3api get-bucket-versioning --bucket "${S3_BUCKET}" --region "${REGION}" > "${TEMP_DIR}/s3-versioning.json" 2>/dev/null || echo "{}" > "${TEMP_DIR}/s3-versioning.json"
    S3_VERSIONING=$(jq -r '.Status // "Not enabled"' "${TEMP_DIR}/s3-versioning.json")
    
    # Get bucket encryption
    aws s3api get-bucket-encryption --bucket "${S3_BUCKET}" --region "${REGION}" > "${TEMP_DIR}/s3-encryption.json" 2>/dev/null || echo "{}" > "${TEMP_DIR}/s3-encryption.json"
    S3_ENCRYPTION=$(jq -r '.ServerSideEncryptionConfiguration.Rules[0].ServerSideEncryptionByDefault.SSEAlgorithm // "Not enabled"' "${TEMP_DIR}/s3-encryption.json")
    
    # Get bucket CORS
    aws s3api get-bucket-cors --bucket "${S3_BUCKET}" --region "${REGION}" > "${TEMP_DIR}/s3-cors.json" 2>/dev/null || echo "{\"CORSRules\": []}" > "${TEMP_DIR}/s3-cors.json"
    S3_CORS_CONFIGURED=$(jq -r 'if .CORSRules | length > 0 then "Yes" else "No" end' "${TEMP_DIR}/s3-cors.json")
    
    # Get object count (this can be slow for large buckets)
    S3_OBJECT_COUNT=$(aws s3api list-objects-v2 --bucket "${S3_BUCKET}" --region "${REGION}" --query 'KeyCount' --output text 2>/dev/null || echo "N/A")
  else
    S3_EXISTS="No"
    S3_VERSIONING="N/A"
    S3_ENCRYPTION="N/A"
    S3_CORS_CONFIGURED="N/A"
    S3_OBJECT_COUNT="N/A"
  fi
else
  S3_EXISTS="No"
  S3_VERSIONING="N/A"
  S3_ENCRYPTION="N/A"
  S3_CORS_CONFIGURED="N/A"
  S3_OBJECT_COUNT="N/A"
fi

# Check API Gateway
echo -e "${BLUE}Checking API Gateway...${NC}"
if [ -n "${API_ENDPOINT}" ]; then
  API_ID=$(jq -r '.[] | select(.OutputKey=="ApiId") | .OutputValue' "${TEMP_DIR}/outputs.json")
  API_STAGE=$(jq -r '.[] | select(.OutputKey=="ApiStageName") | .OutputValue' "${TEMP_DIR}/outputs.json")
  
  if [ -n "${API_ID}" ]; then
    aws apigateway get-stage --rest-api-id "${API_ID}" --stage-name "${API_STAGE}" --region "${REGION}" > "${TEMP_DIR}/api-stage.json" 2>/dev/null || echo "{}" > "${TEMP_DIR}/api-stage.json"
    API_DEPLOYMENT_ID=$(jq -r '.deploymentId // "N/A"' "${TEMP_DIR}/api-stage.json")
    API_CREATED_DATE=$(jq -r '.createdDate // "N/A"' "${TEMP_DIR}/api-stage.json")
    
    # Get API methods
    aws apigateway get-resources --rest-api-id "${API_ID}" --region "${REGION}" > "${TEMP_DIR}/api-resources.json" 2>/dev/null || echo "{\"items\": []}" > "${TEMP_DIR}/api-resources.json"
    API_RESOURCE_COUNT=$(jq -r '.items | length' "${TEMP_DIR}/api-resources.json")
    API_METHOD_COUNT=$(jq -r '.items[].resourceMethods | select(. != null) | to_entries | length' "${TEMP_DIR}/api-resources.json" | awk '{sum+=$1} END {print sum}')
    API_METHOD_COUNT=${API_METHOD_COUNT:-0}
  else
    API_DEPLOYMENT_ID="N/A"
    API_CREATED_DATE="N/A"
    API_RESOURCE_COUNT="N/A"
    API_METHOD_COUNT="N/A"
  fi
else
  API_ID="N/A"
  API_STAGE="N/A"
  API_DEPLOYMENT_ID="N/A"
  API_CREATED_DATE="N/A"
  API_RESOURCE_COUNT="N/A"
  API_METHOD_COUNT="N/A"
fi

# Generate markdown report
echo -e "${BLUE}Generating markdown report...${NC}"

cat > "${OUTPUT_FILE}" << EOF
# Travel Divider Deployment Report

## Stack Information

- **Environment:** ${ENVIRONMENT}
- **Region:** ${REGION}
- **Stack Name:** ${FULL_STACK_NAME}
- **Status:** ${STACK_STATUS}
- **Creation Time:** ${CREATION_TIME}
- **Last Update Time:** ${LAST_UPDATE_TIME}
- **Total Resources:** ${RESOURCE_COUNT}

## DynamoDB Resources

- **Table Name:** ${DYNAMO_TABLE}
- **Status:** ${DYNAMO_STATUS}
- **Item Count:** ${DYNAMO_ITEM_COUNT}
- **Size:** ${DYNAMO_SIZE_MB} MB

## S3 Resources

- **Bucket Name:** ${S3_BUCKET}
- **Exists:** ${S3_EXISTS}
- **Versioning:** ${S3_VERSIONING}
- **Encryption:** ${S3_ENCRYPTION}
- **CORS Configured:** ${S3_CORS_CONFIGURED}
- **Object Count:** ${S3_OBJECT_COUNT}

## API Gateway Resources

- **API Endpoint:** ${API_ENDPOINT}
- **API ID:** ${API_ID}
- **Stage:** ${API_STAGE}
- **Deployment ID:** ${API_DEPLOYMENT_ID}
- **Created Date:** ${API_CREATED_DATE}
- **Resource Count:** ${API_RESOURCE_COUNT}
- **Method Count:** ${API_METHOD_COUNT}

## Lambda Functions

| Function Name | Runtime | Memory | Timeout | Last Modified |
|---------------|---------|--------|---------|---------------|
EOF

# Add Lambda functions to the report
echo -e "${BLUE}Fetching Lambda functions...${NC}"
LAMBDA_FUNCTIONS=$(jq -r '.StackResources[] | select(.ResourceType=="AWS::Lambda::Function" or .ResourceType=="AWS::Serverless::Function") | .PhysicalResourceId' "${TEMP_DIR}/resources.json")

for function_name in ${LAMBDA_FUNCTIONS}; do
  aws lambda get-function --function-name "${function_name}" --region "${REGION}" > "${TEMP_DIR}/lambda-${function_name}.json" 2>/dev/null || continue
  
  RUNTIME=$(jq -r '.Configuration.Runtime' "${TEMP_DIR}/lambda-${function_name}.json")
  MEMORY=$(jq -r '.Configuration.MemorySize' "${TEMP_DIR}/lambda-${function_name}.json")
  TIMEOUT=$(jq -r '.Configuration.Timeout' "${TEMP_DIR}/lambda-${function_name}.json")
  LAST_MODIFIED=$(jq -r '.Configuration.LastModified' "${TEMP_DIR}/lambda-${function_name}.json")
  
  echo "| ${function_name} | ${RUNTIME} | ${MEMORY} MB | ${TIMEOUT} sec | ${LAST_MODIFIED} |" >> "${OUTPUT_FILE}"
done

# Add stack outputs to the report
cat >> "${OUTPUT_FILE}" << EOF

## Stack Outputs

| Output Key | Output Value | Description |
|------------|--------------|-------------|
EOF

jq -r '.[] | "| \(.OutputKey) | \(.OutputValue) | \(.Description) |"' "${TEMP_DIR}/outputs.json" >> "${OUTPUT_FILE}"

# Add resource list to the report
cat >> "${OUTPUT_FILE}" << EOF

## Resource List

| Logical ID | Resource Type | Physical ID | Status |
|------------|---------------|-------------|--------|
EOF

jq -r '.StackResources[] | "| \(.LogicalResourceId) | \(.ResourceType) | \(.PhysicalResourceId) | \(.ResourceStatus) |"' "${TEMP_DIR}/resources.json" >> "${OUTPUT_FILE}"

# Add deployment timestamp
cat >> "${OUTPUT_FILE}" << EOF

---
Report generated on: $(date -u "+%Y-%m-%d %H:%M:%S UTC")
EOF

echo -e "${GREEN}Deployment report generated: ${OUTPUT_FILE}${NC}"

# Print a summary
echo -e "${BLUE}=========================================================="
echo -e "Deployment Summary:"
echo -e "==========================================================${NC}"
echo -e "Stack Status: ${STACK_STATUS}"
echo -e "DynamoDB Table: ${DYNAMO_TABLE} (${DYNAMO_STATUS})"
echo -e "S3 Bucket: ${S3_BUCKET} (${S3_EXISTS})"
echo -e "API Endpoint: ${API_ENDPOINT}"
echo -e "Report File: ${OUTPUT_FILE}"

exit 0