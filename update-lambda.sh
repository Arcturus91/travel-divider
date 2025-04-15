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

echo "Updating CreateExpense function..."
aws lambda update-function-code \
  --function-name $CREATE_FUNCTION \
  --zip-file fileb://dist/createExpense.zip \
  --region $REGION

echo "Updating GetExpenses function..."
aws lambda update-function-code \
  --function-name $GET_FUNCTION \
  --zip-file fileb://dist/getExpenses.zip \
  --region $REGION

echo "Updating UpdateExpense function..."
aws lambda update-function-code \
  --function-name $UPDATE_FUNCTION \
  --zip-file fileb://dist/updateExpense.zip \
  --region $REGION

echo "Updating DeleteExpense function..."
aws lambda update-function-code \
  --function-name $DELETE_FUNCTION \
  --zip-file fileb://dist/deleteExpense.zip \
  --region $REGION

echo "Updating GenerateUploadUrl function..."
aws lambda update-function-code \
  --function-name $UPLOAD_URL_FUNCTION \
  --zip-file fileb://dist/generateUploadUrl.zip \
  --region $REGION

echo "Updating GetSignedDownloadUrl function..."
aws lambda update-function-code \
  --function-name $DOWNLOAD_URL_FUNCTION \
  --zip-file fileb://dist/getSignedDownloadUrl.zip \
  --region $REGION

echo "All Lambda functions updated successfully!"