import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Get environment variables
const EXPENSES_TABLE = process.env.EXPENSES_TABLE;

/**
 * Lambda function to get expenses
 * Can filter by tripId if provided as a query parameter
 */
export const handler = async (event) => {
  try {
    const queryParams = event.queryStringParameters || {};
    const { tripId } = queryParams;
    
    let command;
    
    if (tripId) {
      // If tripId is provided, query expenses for that trip
      command = new QueryCommand({
        TableName: EXPENSES_TABLE,
        IndexName: 'TripIdIndex', // This would need to be added to the table definition
        KeyConditionExpression: 'tripId = :tripId',
        ExpressionAttributeValues: {
          ':tripId': tripId
        },
        ScanIndexForward: false // Sort by most recent first
      });
    } else {
      // Otherwise, return all expenses (with pagination)
      command = new ScanCommand({
        TableName: EXPENSES_TABLE,
        Limit: 50 // Limit results to 50 items
      });
      
      // Handle pagination token if provided
      if (queryParams.nextToken) {
        command.input.ExclusiveStartKey = JSON.parse(
          Buffer.from(queryParams.nextToken, 'base64').toString()
        );
      }
    }
    
    // Execute the command
    const result = await docClient.send(command);
    
    // Generate next token for pagination if there are more results
    let nextToken = null;
    if (result.LastEvaluatedKey) {
      nextToken = Buffer.from(
        JSON.stringify(result.LastEvaluatedKey)
      ).toString('base64');
    }
    
    // Return results
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: result.Items,
        nextToken
      })
    };
    
  } catch (error) {
    console.error('Error fetching expenses:', error);
    
    // Return error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Error fetching expenses',
        error: error.message
      })
    };
  }
};