import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { doc, getTableName } from './client';
import type { Analysis } from './types';
import { updateRepositoryScore } from './repositories';

export async function createAnalysis(analysis: Analysis): Promise<Analysis> {
  const TABLE_NAME = getTableName();
  const item = {
    PK: `ANALYSIS#${analysis.repoId}`,
    SK: analysis.timestamp,
    GSI2PK: `ANALYSIS#${analysis.repoId}`,
    GSI2SK: analysis.timestamp,
    ...analysis,
    createdAt: analysis.createdAt || new Date().toISOString(),
  };

  await doc.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  await updateRepositoryScore(analysis.repoId, analysis.aiScore);
  return analysis;
}

export async function listRepositoryAnalyses(
  repoId: string,
  limit = 20
): Promise<Analysis[]> {
  const TABLE_NAME = getTableName();
  const result = await doc.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': `ANALYSIS#${repoId}` },
      ScanIndexForward: false,
      Limit: limit,
    })
  );
  return (result.Items || []) as Analysis[];
}

export async function getLatestAnalysis(
  repoId: string
): Promise<Analysis | null> {
  const TABLE_NAME = getTableName();
  const result = await doc.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': `ANALYSIS#${repoId}` },
      ScanIndexForward: false,
      Limit: 1,
    })
  );
  return result.Items?.[0] as Analysis | null;
}
