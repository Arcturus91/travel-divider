const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Initialize S3 client
const s3Client = new S3Client({});

// Get environment variables
const EXPENSES_TABLE = process.env.EXPENSES_TABLE;
const RECEIPTS_BUCKET = process.env.RECEIPTS_BUCKET;

/**
 * Lambda function to delete an expense and its associated receipt image if any
 */
exports.handler = async (event) => {
  try {
    const expenseId = event.pathParameters.expenseId;
    
    // First, get the expense to check if it exists and if it has a receipt image
    const getCommand = new GetCommand({
      TableName: EXPENSES_TABLE,
      Key: {
        expenseId
      }
    });
    
    const existingItem = await docClient.send(getCommand);
    
    if (!existingItem.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Expense with ID ${expenseId} not found`
        })
      };
    }
    
    // If there's a receipt image, delete it from S3
    if (existingItem.Item.receiptImageKey) {
      const deleteImageCommand = new DeleteObjectCommand({
        Bucket: RECEIPTS_BUCKET,
        Key: existingItem.Item.receiptImageKey
      });
      
      await s3Client.send(deleteImageCommand);
    }
    
    // Delete the expense from DynamoDB
    const deleteCommand = new DeleteCommand({
      TableName: EXPENSES_TABLE,
      Key: {
        expenseId,
        createdAt: existingItem.Item.createdAt
      }
    });
    
    await docClient.send(deleteCommand);
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Expense with ID ${expenseId} successfully deleted`
      })
    };
    
  } catch (error) {
    console.error('Error deleting expense:', error);
    
    // Return error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Error deleting expense',
        error: error.message
      })
    };
  }
};