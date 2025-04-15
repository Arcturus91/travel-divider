const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

// Initialize DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Get environment variables
const EXPENSES_TABLE = process.env.EXPENSES_TABLE;

/**
 * Lambda function to create a new expense
 */
exports.handler = async (event) => {
  try {
    // Parse request body
    const requestBody = JSON.parse(event.body);
    
    // Validate request
    if (!requestBody.totalAmount || !requestBody.currency) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Missing required fields: totalAmount and currency are required'
        })
      };
    }
    
    // Generate unique ID and timestamp
    const expenseId = uuidv4();
    const createdAt = new Date().toISOString();
    
    // Prepare item for DynamoDB
    const item = {
      expenseId,
      createdAt,
      totalAmount: requestBody.totalAmount,
      currency: requestBody.currency,
      isShared: requestBody.isShared || false,
      receiptImageKey: requestBody.receiptImageKey || null,
      description: requestBody.description || '',
      category: requestBody.category || 'Uncategorized',
      tripId: requestBody.tripId || null,
      allocations: requestBody.allocations || [],
    };
    
    // Write to DynamoDB
    const command = new PutCommand({
      TableName: EXPENSES_TABLE,
      Item: item
    });
    
    await docClient.send(command);
    
    // Return success response with created item
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
    };
    
  } catch (error) {
    console.error('Error creating expense:', error);
    
    // Return error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Error creating expense',
        error: error.message
      })
    };
  }
};