import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

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

    console.log("Looking up expense with ID:", expenseId);

    // First, get the existing item to check if it exists and to get createdAt
    // Use a scan operation to find by expenseId without needing to know createdAt

    const scanCommand = new ScanCommand({
      TableName: EXPENSES_TABLE,
      FilterExpression: "expenseId = :expenseId",
      ExpressionAttributeValues: {
        ":expenseId": expenseId,
      },
    });

    const scanResult = await docClient.send(scanCommand);

    // Check if we got any items back
    if (!scanResult.Items || scanResult.Items.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Expense with ID ${expenseId} not found`,
        }),
      };
    }

    // Use the first item that matches (should only be one)
    const existingItem = { Item: scanResult.Items[0] };

    // Build update expression dynamically
    const updateFields = [
      "totalAmount",
      "currency",
      "isShared",
      "receiptImageKey",
      "description",
      "category",
      "tripId",
      "allocations",
    ];

    let updateExpression = "SET updatedAt = :updatedAt";
    const expressionAttributeValues = {
      ":updatedAt": new Date().toISOString(),
    };

    // Add each field that exists in the request body to the update expression
    updateFields.forEach((field) => {
      if (field in requestBody) {
        updateExpression += `, ${field} = :${field}`;
        expressionAttributeValues[`:${field}`] = requestBody[field];
      }
    });

    // Check createdAt exists in the item
    if (!existingItem.Item.createdAt) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Item found but createdAt is missing for expense with ID ${expenseId}`,
        }),
      };
    }

    console.log("Existing item:", JSON.stringify(existingItem.Item));
    console.log(
      "Using composite key with expenseId:",
      expenseId,
      "and createdAt:",
      existingItem.Item.createdAt
    );

    // Prepare update command
    const updateCommand = new UpdateCommand({
      TableName: EXPENSES_TABLE,
      Key: {
        expenseId,
        createdAt: existingItem.Item.createdAt,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    // Execute update
    const result = await docClient.send(updateCommand);

    // Return the updated item
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    console.error("Error updating expense:", error);

    // Return error response
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Error updating expense",
        error: error.message,
      }),
    };
  }
};
