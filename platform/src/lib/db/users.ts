import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { doc, getTableName } from './client';
import type { User } from './types';

export async function createUser(user: User): Promise<User> {
  const now = new Date().toISOString();
  const TABLE_NAME = getTableName();
  const item = {
    PK: `USER#${user.id}`,
    SK: '#METADATA',
    GSI1PK: 'USERS',
    GSI1SK: user.email,
    ...user,
    createdAt: user.createdAt || now,
    updatedAt: now,
  };

  await doc.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return user;
}

export async function getUser(userId: string): Promise<User | null> {
  const TABLE_NAME = getTableName();
  const result = await doc.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: '#METADATA' },
    })
  );
  return result.Item ? (result.Item as User) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const TABLE_NAME = getTableName();
  const result = await doc.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK = :email',
      ExpressionAttributeValues: { ':pk': 'USERS', ':email': email },
    })
  );
  return result.Items?.[0] as User | null;
}

export async function updateUser(
  userId: string,
  updates: Partial<User>
): Promise<void> {
  const TABLE_NAME = getTableName();
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'id') continue;
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = value;
  }

  if (updateExpressions.length === 0) return;

  updateExpressions.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  await doc.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: '#METADATA' },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    })
  );
}
