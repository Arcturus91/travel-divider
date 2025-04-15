#!/bin/bash

# Set AWS region
REGION=eu-west-3

# Function names
CREATE_FUNCTION="traveler-stack-CreateExpenseFunction-8ciYG5Cgd8bZ"
GET_FUNCTION="traveler-stack-GetExpensesFunction-5COUmMKuPMWl"
UPDATE_FUNCTION="traveler-stack-UpdateExpenseFunction-Bo3GQKV1iCHv"
DELETE_FUNCTION="traveler-stack-DeleteExpenseFunction-Y1V8tYrtENWp"
UPLOAD_URL_FUNCTION="traveler-stack-GenerateUploadUrlFunction-VOV2LV1QUHND"
DOWNLOAD_URL_FUNCTION="traveler-stack-GetSignedDownloadUrlFunction-c9osP3rvGKxP"

# Create temp directory for flat zip files
TEMP_DIR="./temp-lambda"
mkdir -p $TEMP_DIR

# Function to create a flat zip file from the original zip
create_flat_zip() {
  FUNCTION_NAME=$1
  echo "Creating flat zip for $FUNCTION_NAME..."
  
  # Clean temp dir
  rm -rf $TEMP_DIR/*
  
  # Extract the original zip
  unzip -q "dist/$FUNCTION_NAME.zip" -d $TEMP_DIR
  
  # Find the inner directory containing the function code
  INNER_DIR=$(find $TEMP_DIR -type d -name "$FUNCTION_NAME" -o -name "nodejs" | head -1)
  
  if [ -z "$INNER_DIR" ]; then
    echo "Warning: Could not find inner directory for $FUNCTION_NAME, zip may already be flat"
    INNER_DIR=$TEMP_DIR
  fi
  
  # Create a new flat zip file
  pushd $INNER_DIR > /dev/null
  zip -r "../../dist/$FUNCTION_NAME-flat.zip" * > /dev/null
  popd > /dev/null
  
  echo "Created flat zip: dist/$FUNCTION_NAME-flat.zip"
}

# Process each function
echo "Creating flat zip files..."
create_flat_zip "createExpense"
create_flat_zip "getExpenses"
create_flat_zip "updateExpense"
create_flat_zip "deleteExpense"
create_flat_zip "generateUploadUrl"
create_flat_zip "getSignedDownloadUrl"

echo "Updating CreateExpense function..."
aws lambda update-function-code \
  --function-name $CREATE_FUNCTION \
  --zip-file fileb://dist/createExpense-flat.zip \
  --region $REGION

echo "Updating GetExpenses function..."
aws lambda update-function-code \
  --function-name $GET_FUNCTION \
  --zip-file fileb://dist/getExpenses-flat.zip \
  --region $REGION

echo "Updating UpdateExpense function..."
aws lambda update-function-code \
  --function-name $UPDATE_FUNCTION \
  --zip-file fileb://dist/updateExpense-flat.zip \
  --region $REGION

echo "Updating DeleteExpense function..."
aws lambda update-function-code \
  --function-name $DELETE_FUNCTION \
  --zip-file fileb://dist/deleteExpense-flat.zip \
  --region $REGION

echo "Updating GenerateUploadUrl function..."
aws lambda update-function-code \
  --function-name $UPLOAD_URL_FUNCTION \
  --zip-file fileb://dist/generateUploadUrl-flat.zip \
  --region $REGION

echo "Updating GetSignedDownloadUrl function..."
aws lambda update-function-code \
  --function-name $DOWNLOAD_URL_FUNCTION \
  --zip-file fileb://dist/getSignedDownloadUrl-flat.zip \
  --region $REGION

# Clean up
rm -rf $TEMP_DIR

echo "All Lambda functions updated successfully!"