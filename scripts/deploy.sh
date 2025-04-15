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
DEPLOY_BUCKET=""
OUTPUT_FILE="deployment-output.json"
BUILD_TYPESCRIPT=true
FORCE_DEPLOY=false
LOGS_FOLDER="deployment-logs"

# Print usage information
function print_usage {
  echo "Usage: $0 [options]"
  echo "Options:"
  echo "  -e, --environment ENV   Deployment environment (dev, staging, prod) [default: dev]"
  echo "  -r, --region REGION     AWS region to deploy to [default: eu-west-3]"
  echo "  -s, --stack-name NAME   CloudFormation stack name [default: travel-divider-{env}]"
  echo "  -b, --bucket NAME       S3 bucket for deployment artifacts"
  echo "  -o, --output FILE       Output file for deployment information [default: deployment-output.json]"
  echo "  -n, --no-typescript     Skip TypeScript build"
  echo "  -f, --force             Force deployment, even if there are no changes"
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
    -b|--bucket)
      DEPLOY_BUCKET="$2"
      shift
      shift
      ;;
    -o|--output)
      OUTPUT_FILE="$2"
      shift
      shift
      ;;
    -n|--no-typescript)
      BUILD_TYPESCRIPT=false
      shift
      ;;
    -f|--force)
      FORCE_DEPLOY=true
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

# Create logs directory if it doesn't exist
mkdir -p "${LOGS_FOLDER}"
LOG_FILE="${LOGS_FOLDER}/deploy-${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S).log"

# Log function to print and also save to log file
function log {
  echo -e "$1" | tee -a "${LOG_FILE}"
}

log "${BLUE}=========================================================="
log "Travel Divider Deployment Script"
log "Environment: ${ENVIRONMENT}"
log "Region: ${REGION}"
log "Stack Name: ${FULL_STACK_NAME}"
log "Timestamp: $(date)"
log "==========================================================${NC}"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
  log "${RED}Error: AWS CLI is not configured properly. Please run 'aws configure' and try again.${NC}"
  exit 1
fi

# Check if SAM CLI is installed
if ! command -v sam > /dev/null; then
  log "${RED}Error: AWS SAM CLI is not installed. Please install it and try again.${NC}"
  exit 1
fi

# Load environment-specific variables from config file
ENV_CONFIG_FILE="./config/${ENVIRONMENT}.json"
if [ -f "${ENV_CONFIG_FILE}" ]; then
  log "${GREEN}Loading environment configuration from ${ENV_CONFIG_FILE}${NC}"
else
  log "${YELLOW}Warning: No environment configuration file found at ${ENV_CONFIG_FILE}, using defaults${NC}"
  # Create directory and file if they don't exist
  mkdir -p ./config
  echo '{
  "Parameters": {
    "Environment": "'${ENVIRONMENT}'",
    "ExpensesTableName": "travel-divider-expenses-'${ENVIRONMENT}'",
    "ApiStageName": "'${ENVIRONMENT}'"
  },
  "Tags": {
    "Environment": "'${ENVIRONMENT}'",
    "Application": "travel-divider",
    "ManagedBy": "sam"
  }
}' > "${ENV_CONFIG_FILE}"
  log "${GREEN}Created default environment configuration file at ${ENV_CONFIG_FILE}${NC}"
fi

# Build TypeScript Lambda functions
if [ "$BUILD_TYPESCRIPT" = true ]; then
  log "${BLUE}Building TypeScript Lambda functions...${NC}"
  
  # Create directory for compiled JS files if it doesn't exist
  for dir in ./src/functions/*/; do
    if [ -f "${dir}tsconfig.json" ]; then
      dir_name=$(basename "$dir")
      log "Building TypeScript function: ${dir_name}"
      
      # Ensure node_modules exist for each function
      if [ ! -d "${dir}node_modules" ] && [ -f "${dir}package.json" ]; then
        (cd "${dir}" && npm install --production)
      fi
      
      # Compile TypeScript to JavaScript
      npx tsc -p "${dir}tsconfig.json"
    fi
  done
  
  log "${GREEN}TypeScript build complete!${NC}"
fi

# Create parameter override string from config file
PARAMS_OVERRIDE=""
if [ -f "${ENV_CONFIG_FILE}" ]; then
  PARAMS=$(jq -r '.Parameters | to_entries | map("\(.key)=\(.value)") | join(" ")' "${ENV_CONFIG_FILE}")
  PARAMS_OVERRIDE="--parameter-overrides ${PARAMS}"
fi

# Create tags string from config file
TAGS_OVERRIDE=""
if [ -f "${ENV_CONFIG_FILE}" ]; then
  TAGS=$(jq -r '.Tags | to_entries | map("\(.key)=\(.value)") | join(" ")' "${ENV_CONFIG_FILE}")
  TAGS_OVERRIDE="--tags ${TAGS}"
fi

# Check if S3 bucket is provided or set default
if [ -z "${DEPLOY_BUCKET}" ]; then
  # Create a default bucket name
  DEPLOY_BUCKET="${STACK_NAME}-deployment-${ENVIRONMENT}-${REGION}"
  
  # Check if bucket exists, create if it doesn't
  if ! aws s3api head-bucket --bucket "${DEPLOY_BUCKET}" --region "${REGION}" 2>/dev/null; then
    log "${YELLOW}Deployment bucket does not exist. Creating bucket: ${DEPLOY_BUCKET}${NC}"
    aws s3 mb "s3://${DEPLOY_BUCKET}" --region "${REGION}"
    
    # Enable versioning on the bucket for better artifact management
    aws s3api put-bucket-versioning \
      --bucket "${DEPLOY_BUCKET}" \
      --versioning-configuration Status=Enabled \
      --region "${REGION}"
  fi
fi

# Run SAM build
log "${BLUE}Building SAM application...${NC}"
sam build

# Package SAM application
log "${BLUE}Packaging SAM application...${NC}"
sam package \
  --s3-bucket "${DEPLOY_BUCKET}" \
  --output-template-file packaged.yaml \
  --region "${REGION}"

# Deploy SAM application
log "${BLUE}Deploying SAM application...${NC}"
DEPLOY_CMD="sam deploy \
  --template-file packaged.yaml \
  --stack-name ${FULL_STACK_NAME} \
  --capabilities CAPABILITY_IAM \
  --region ${REGION} \
  ${PARAMS_OVERRIDE} \
  ${TAGS_OVERRIDE} \
  --no-fail-on-empty-changeset"

if [ "$FORCE_DEPLOY" = true ]; then
  DEPLOY_CMD="${DEPLOY_CMD} --force-upload"
fi

# Execute deployment
eval "${DEPLOY_CMD}"

# Generate report of deployed resources
log "${BLUE}Generating deployment report...${NC}"

# Get stack resources
aws cloudformation describe-stack-resources \
  --stack-name "${FULL_STACK_NAME}" \
  --region "${REGION}" \
  > "${LOGS_FOLDER}/stack-resources-${ENVIRONMENT}.json"

# Get stack outputs
aws cloudformation describe-stacks \
  --stack-name "${FULL_STACK_NAME}" \
  --region "${REGION}" \
  --query "Stacks[0].Outputs" \
  > "${LOGS_FOLDER}/stack-outputs-${ENVIRONMENT}.json"

# Create deployment output file
cat > "${OUTPUT_FILE}" << EOF
{
  "deployment": {
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "environment": "${ENVIRONMENT}",
    "region": "${REGION}",
    "stackName": "${FULL_STACK_NAME}"
  },
  "outputs": $(cat "${LOGS_FOLDER}/stack-outputs-${ENVIRONMENT}.json"),
  "resources": $(cat "${LOGS_FOLDER}/stack-resources-${ENVIRONMENT}.json" | jq '.StackResources')
}
EOF

# Verify DynamoDB and S3 bucket creation
log "${BLUE}Verifying deployed resources...${NC}"

# Get DynamoDB table name from outputs
DYNAMO_TABLE=$(jq -r '.outputs[] | select(.OutputKey=="ExpensesTable") | .OutputValue' "${OUTPUT_FILE}")
if [ -n "${DYNAMO_TABLE}" ]; then
  # Check if table exists
  if aws dynamodb describe-table --table-name "${DYNAMO_TABLE}" --region "${REGION}" > /dev/null 2>&1; then
    log "${GREEN}DynamoDB table ${DYNAMO_TABLE} created successfully!${NC}"
    
    # Get table details for verification
    aws dynamodb describe-table \
      --table-name "${DYNAMO_TABLE}" \
      --region "${REGION}" \
      --query "Table.{Name:TableName,Status:TableStatus,ReadCapacity:ProvisionedThroughput.ReadCapacityUnits,WriteCapacity:ProvisionedThroughput.WriteCapacityUnits,BillingMode:BillingModeSummary.BillingMode}" \
      > "${LOGS_FOLDER}/dynamo-details-${ENVIRONMENT}.json"
      
    log "${BLUE}DynamoDB table details:${NC}"
    cat "${LOGS_FOLDER}/dynamo-details-${ENVIRONMENT}.json" | jq '.'
  else
    log "${RED}DynamoDB table ${DYNAMO_TABLE} not found or not accessible${NC}"
  fi
else
  log "${YELLOW}DynamoDB table name not found in stack outputs${NC}"
fi

# Get S3 bucket name from outputs
S3_BUCKET=$(jq -r '.outputs[] | select(.OutputKey=="ReceiptsBucket") | .OutputValue' "${OUTPUT_FILE}")
if [ -n "${S3_BUCKET}" ]; then
  # Check if bucket exists
  if aws s3api head-bucket --bucket "${S3_BUCKET}" --region "${REGION}" > /dev/null 2>&1; then
    log "${GREEN}S3 bucket ${S3_BUCKET} created successfully!${NC}"
    
    # Get bucket details for verification
    aws s3api get-bucket-versioning --bucket "${S3_BUCKET}" --region "${REGION}" > "${LOGS_FOLDER}/s3-versioning-${ENVIRONMENT}.json"
    aws s3api get-bucket-encryption --bucket "${S3_BUCKET}" --region "${REGION}" > "${LOGS_FOLDER}/s3-encryption-${ENVIRONMENT}.json" 2>/dev/null || echo "{\"ServerSideEncryptionConfiguration\": {\"Rules\": [{\"ApplyServerSideEncryptionByDefault\": {\"SSEAlgorithm\": \"None\"}}]}}" > "${LOGS_FOLDER}/s3-encryption-${ENVIRONMENT}.json"
    aws s3api get-bucket-cors --bucket "${S3_BUCKET}" --region "${REGION}" > "${LOGS_FOLDER}/s3-cors-${ENVIRONMENT}.json" 2>/dev/null || echo "{\"CORSRules\": []}" > "${LOGS_FOLDER}/s3-cors-${ENVIRONMENT}.json"
    
    log "${BLUE}S3 bucket details:${NC}"
    echo "Versioning:" && cat "${LOGS_FOLDER}/s3-versioning-${ENVIRONMENT}.json" | jq '.'
    echo "Encryption:" && cat "${LOGS_FOLDER}/s3-encryption-${ENVIRONMENT}.json" | jq '.'
    echo "CORS:" && cat "${LOGS_FOLDER}/s3-cors-${ENVIRONMENT}.json" | jq '.'
  else
    log "${RED}S3 bucket ${S3_BUCKET} not found or not accessible${NC}"
  fi
else
  log "${YELLOW}S3 bucket name not found in stack outputs${NC}"
fi

# Get API Gateway endpoint from outputs
API_ENDPOINT=$(jq -r '.outputs[] | select(.OutputKey=="ApiEndpoint") | .OutputValue' "${OUTPUT_FILE}")
if [ -n "${API_ENDPOINT}" ]; then
  log "${GREEN}API Gateway endpoint: ${API_ENDPOINT}${NC}"
else
  log "${YELLOW}API Gateway endpoint not found in stack outputs${NC}"
fi

log "${GREEN}Deployment complete! Results saved to ${OUTPUT_FILE}${NC}"
log "${GREEN}Log file: ${LOG_FILE}${NC}"

# Print summary of deployed resources
RESOURCE_COUNT=$(jq '.resources | length' "${OUTPUT_FILE}")
log "${BLUE}Deployed ${RESOURCE_COUNT} resources:${NC}"
jq -r '.resources[] | "- " + .ResourceType + ": " + .LogicalResourceId' "${OUTPUT_FILE}"

# Print stack outputs
log "${BLUE}Stack outputs:${NC}"
jq -r '.outputs[] | "- " + .OutputKey + ": " + .OutputValue' "${OUTPUT_FILE}"

exit 0