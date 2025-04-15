import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Get environment variables
const EXPENSES_TABLE = process.env.EXPENSES_TABLE;

/**
 * Lambda function to update an existing expense
 */
export const handler = async (event) => {
  try {
    const expenseId = event.pathParameters.expenseId;
    const requestBody = JSON.parse(event.body);
    
    // First, get the existing item to check if it exists and to get createdAt
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
    
    // Build update expression dynamically
    const updateFields = [
      'totalAmount',
      'currency',
      'isShared',
      'receiptImageKey',
      'description',
      'category',
      'tripId',
      'allocations'
    ];
    
    let updateExpression = 'SET updatedAt = :updatedAt';
    const expressionAttributeValues = {
      ':updatedAt': new Date().toISOString()
    };
    
    // Add each field that exists in the request body to the update expression
    updateFields.forEach(field => {
      if (field in requestBody) {
        updateExpression += `, ${field} = :${field}`;
        expressionAttributeValues[`:${field}`] = requestBody[field];
      }
    });
    
    // Prepare update command
    const updateCommand = new UpdateCommand({
      TableName: EXPENSES_TABLE,
      Key: {
        expenseId,
        createdAt: existingItem.Item.createdAt
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });
    
    // Execute update
    const result = await docClient.send(updateCommand);
    
    // Return the updated item
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result.Attributes)
    };
    
  } catch (error) {
    console.error('Error updating expense:', error);
    
    // Return error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Error updating expense',
        error: error.message
      })
    };
  }
};