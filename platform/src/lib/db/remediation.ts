import { PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { doc, getTableName } from './client';
import type { RemediationRequest } from './types';

/**
 * Single-Table Design for Remediations:
 * PK: REPO#repoId
 * SK: REMEDIATION#id
 *
 * GSI1PK: REMEDIATION#id
 * GSI1SK: #METADATA  (to find by ID globally)
 *
 * GSI2PK: REMEDIATION#repoId
 * GSI2SK: createdAt (to list by repo)
 *
 * GSI3PK: TEAM#teamId
 * GSI3SK: REMEDIATION#id (to list by team)
 */

export async function createRemediation(
  remediation: RemediationRequest
): Promise<RemediationRequest> {
  const TABLE_NAME = getTableName();
  const item = {
    PK: `REPO#${remediation.repoId}`,
    SK: `REMEDIATION#${remediation.id}`,
    GSI1PK: `REMEDIATION#${remediation.id}`,
    GSI1SK: '#METADATA',
    GSI2PK: `REMEDIATION#${remediation.repoId}`,
    GSI2SK: remediation.createdAt,
    ...(remediation.teamId && {
      GSI3PK: `TEAM#${remediation.teamId}`,
      GSI3SK: `REMEDIATION#${remediation.id}`,
    }),
    ...remediation,
  };
  await doc.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return remediation;
}

export async function createRemediations(
  repoId: string,
  requests: RemediationRequest[]
): Promise<void> {
  for (const req of requests) {
    await createRemediation({ ...req, repoId });
  }
}

export async function getRemediation(
  id: string
): Promise<RemediationRequest | null> {
  const TABLE_NAME = getTableName();
  const result = await doc.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: { ':pk': `REMEDIATION#${id}` },
    })
  );
  return (result.Items?.[0] as RemediationRequest) || null;
}

export async function listRemediations(
  repoId: string,
  limit = 20
): Promise<RemediationRequest[]> {
  const TABLE_NAME = getTableName();
  const result = await doc.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :pk',
      ExpressionAttributeValues: { ':pk': `REMEDIATION#${repoId}` },
      ScanIndexForward: false,
      Limit: limit,
    })
  );
  return (result.Items || []) as RemediationRequest[];
}

export async function listTeamRemediations(
  teamId: string,
  limit = 20
): Promise<RemediationRequest[]> {
  const TABLE_NAME = getTableName();
  const result = await doc.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI3',
      KeyConditionExpression: 'GSI3PK = :pk AND begins_with(GSI3SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': `TEAM#${teamId}`,
        ':prefix': 'REMEDIATION#',
      },
      ScanIndexForward: false,
      Limit: limit,
    })
  );
  return (result.Items || []) as RemediationRequest[];
}

export async function updateRemediation(
  id: string,
  updates: Partial<RemediationRequest>
): Promise<void> {
  const TABLE_NAME = getTableName();
  const remediation = await getRemediation(id);
  if (!remediation) return;

  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'id' || key === 'repoId') continue;
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
      Key: { PK: `REPO#${remediation.repoId}`, SK: `REMEDIATION#${id}` },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    })
  );
}
