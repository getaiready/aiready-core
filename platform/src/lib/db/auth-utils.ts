import { createHash, randomBytes } from 'node:crypto';
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { doc, getTableName } from './client';
import type { ApiKey, MagicLinkToken, RemediationRequest } from './types';

// API Key operations
export async function createApiKey(
  userId: string,
  name: string
): Promise<{ key: string; apiKeyId: string }> {
  const TABLE_NAME = getTableName();
  const apiKeyId = randomBytes(16).toString('hex');
  const rawKey = `ar_${randomBytes(32).toString('hex')}`;
  const keyHash = createHash('sha256').update(rawKey).digest('hex');
  const prefix = `${rawKey.substring(0, 7)}...`;

  const item: ApiKey = {
    id: apiKeyId,
    userId,
    name,
    keyHash,
    prefix,
    createdAt: new Date().toISOString(),
  };

  const dbItem = {
    PK: `USER#${userId}`,
    SK: `APIKEY#${apiKeyId}`,
    GSI1PK: 'APIKEYS',
    GSI1SK: keyHash,
    ...item,
  };
  await doc.send(new PutCommand({ TableName: TABLE_NAME, Item: dbItem }));
  return { key: rawKey, apiKeyId };
}

export async function listUserApiKeys(userId: string): Promise<ApiKey[]> {
  const TABLE_NAME = getTableName();
  const result = await doc.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':prefix': 'APIKEY#',
      },
    })
  );
  return result.Items as ApiKey[];
}

export async function deleteApiKey(
  userId: string,
  apiKeyId: string
): Promise<void> {
  const TABLE_NAME = getTableName();
  await doc.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: `APIKEY#${apiKeyId}` },
    })
  );
}

// Magic Link operations
export async function createMagicLinkToken(
  tokenData: MagicLinkToken
): Promise<string> {
  const TABLE_NAME = getTableName();
  await doc.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { PK: `MAGIC#${tokenData.token}`, SK: '#METADATA', ...tokenData },
    })
  );
  return tokenData.token;
}

export async function getMagicLinkToken(
  token: string
): Promise<MagicLinkToken | null> {
  const TABLE_NAME = getTableName();
  const result = await doc.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `MAGIC#${token}`, SK: '#METADATA' },
    })
  );
  return (result.Item as MagicLinkToken) || null;
}

export async function markMagicLinkUsed(token: string): Promise<void> {
  const TABLE_NAME = getTableName();
  await doc.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `MAGIC#${token}`, SK: '#METADATA' },
      UpdateExpression: 'SET used = :u',
      ExpressionAttributeValues: { ':u': true },
    })
  );
}
