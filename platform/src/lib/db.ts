/**
 * DynamoDB Single-Table Design for AIReady Platform
 *
 * This file now serves as the entry point for database operations,
 * which are split into modular sub-modules in the db/ directory.
 */

export * from './db/types';
export * from './db/client';
export * from './db/users';
export * from './db/teams';
export * from './db/repositories';
export * from './db/analysis';
export * from './db/remediation';
export * from './db/auth-utils';

// Re-export specific common helpers if needed
import { createHash } from 'node:crypto';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { doc, getTableName } from './db/client';

/**
 * Update API key lastUsedAt
 */
export async function updateApiKeyLastUsed(
  userId: string,
  apiKeyId: string
): Promise<void> {
  const TABLE_NAME = getTableName();
  await doc
    .send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: `APIKEY#${apiKeyId}` },
        UpdateExpression: 'SET lastUsedAt = :t',
        ExpressionAttributeValues: { ':t': new Date().toISOString() },
      })
    )
    .catch((err) => console.error('Error updating lastUsedAt:', err));
}

/**
 * Validate API key from raw key string
 */
export async function validateApiKey(
  rawKey: string
): Promise<{ userId: string; apiKeyId: string } | null> {
  const keyHash = createHash('sha256').update(rawKey).digest('hex');
  const { QueryCommand } = await import('@aws-sdk/lib-dynamodb');
  const TABLE_NAME = getTableName();

  const result = await doc.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK = :sk',
      ExpressionAttributeValues: { ':pk': 'APIKEYS', ':sk': keyHash },
    })
  );

  if (!result.Items || result.Items.length === 0) return null;
  const item = result.Items[0];

  await updateApiKeyLastUsed(item.userId, item.id);
  return { userId: item.userId, apiKeyId: item.id };
}
