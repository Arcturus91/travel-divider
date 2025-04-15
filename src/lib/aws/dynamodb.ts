import { 
  GetCommand, 
  PutCommand, 
  QueryCommand,
  DeleteCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import { dynamoDbDocClient, TRIPS_TABLE, EXPENSES_TABLE } from "./config";
import { Trip, Expense } from "@/models/types";

/**
 * Creates a new trip in DynamoDB
 * @param trip The trip to create
 * @returns The created trip
 */
export async function createTrip(trip: Trip): Promise<Trip> {
  const timestamp = new Date().toISOString();
  
  const newTrip = {
    ...trip,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const command = new PutCommand({
    TableName: TRIPS_TABLE,
    Item: newTrip,
  });

  await dynamoDbDocClient.send(command);
  return newTrip;
}

/**
 * Gets a trip by ID
 * @param tripId The ID of the trip to get
 * @returns The trip
 */
export async function getTrip(tripId: string): Promise<Trip> {
  const command = new GetCommand({
    TableName: TRIPS_TABLE,
    Key: {
      id: tripId,
    },
  });

  const response = await dynamoDbDocClient.send(command);
  return response.Item as Trip;
}

/**
 * Gets all trips
 * @returns Array of trips
 */
export async function getAllTrips(): Promise<Trip[]> {
  // In a real implementation, this would use a scan or query operation
  // with appropriate pagination
  const command = new QueryCommand({
    TableName: TRIPS_TABLE,
    // Add appropriate query parameters based on your table design
  });

  const response = await dynamoDbDocClient.send(command);
  return response.Items as Trip[];
}

/**
 * Updates a trip
 * @param tripId The ID of the trip to update
 * @param updates The updates to apply
 * @returns The updated trip
 */
export async function updateTrip(
  tripId: string,
  updates: Partial<Trip>
): Promise<Trip> {
  const timestamp = new Date().toISOString();
  
  // Build update expression dynamically based on the updates object
  const updateExpressionParts: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  Object.entries(updates).forEach(([key, value]) => {
    updateExpressionParts.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = value;
  });

  // Always update the updatedAt timestamp
  updateExpressionParts.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = timestamp;

  const command = new UpdateCommand({
    TableName: TRIPS_TABLE,
    Key: {
      id: tripId,
    },
    UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });

  const response = await dynamoDbDocClient.send(command);
  return response.Attributes as Trip;
}

/**
 * Creates a new expense in DynamoDB
 * @param expense The expense to create
 * @returns The created expense
 */
export async function createExpense(expense: Expense): Promise<Expense> {
  const timestamp = new Date().toISOString();
  
  const newExpense = {
    ...expense,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const command = new PutCommand({
    TableName: EXPENSES_TABLE,
    Item: newExpense,
  });

  await dynamoDbDocClient.send(command);
  return newExpense;
}

/**
 * Gets expenses for a trip
 * @param tripId The ID of the trip
 * @returns Array of expenses
 */
export async function getExpensesByTrip(tripId: string): Promise<Expense[]> {
  const command = new QueryCommand({
    TableName: EXPENSES_TABLE,
    KeyConditionExpression: 'tripId = :tripId',
    ExpressionAttributeValues: {
      ':tripId': tripId,
    },
  });

  const response = await dynamoDbDocClient.send(command);
  return response.Items as Expense[];
}

/**
 * Updates an expense
 * @param expenseId The ID of the expense to update
 * @param tripId The ID of the trip
 * @param updates The updates to apply
 * @returns The updated expense
 */
export async function updateExpense(
  expenseId: string,
  tripId: string,
  updates: Partial<Expense>
): Promise<Expense> {
  const timestamp = new Date().toISOString();
  
  // Build update expression dynamically based on the updates object
  const updateExpressionParts: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  Object.entries(updates).forEach(([key, value]) => {
    updateExpressionParts.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = value;
  });

  // Always update the updatedAt timestamp
  updateExpressionParts.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = timestamp;

  const command = new UpdateCommand({
    TableName: EXPENSES_TABLE,
    Key: {
      id: expenseId,
      tripId: tripId,
    },
    UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });

  const response = await dynamoDbDocClient.send(command);
  return response.Attributes as Expense;
}

/**
 * Deletes an expense
 * @param expenseId The ID of the expense to delete
 * @param tripId The ID of the trip
 */
export async function deleteExpense(
  expenseId: string,
  tripId: string
): Promise<void> {
  const command = new DeleteCommand({
    TableName: EXPENSES_TABLE,
    Key: {
      id: expenseId,
      tripId: tripId,
    },
  });

  await dynamoDbDocClient.send(command);
}