import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(ddbClient);

export interface ManagedAccountRecord {
  PK: string;
  SK: string;
  EntityType: 'ManagedAccount';
  awsAccountId: string;
  ownerEmail: string;
  repoName: string;
  currentMonthlySpendCents: number;
  reportedOverageCents: number;
  lastCostSync?: string;
  provisioningStatus?: 'provisioning' | 'complete' | 'failed';
  provisioningError?: string;
  repoUrl?: string;
}

export interface UserMetadata {
  PK: string;
  SK: 'METADATA';
  EntityType: 'UserMetadata';
  aiTokenBalanceCents: number;
  aiRefillThresholdCents: number;
  aiTopupAmountCents: number;
  coEvolutionOptIn: boolean;
  autoTopupEnabled: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeMutationSubscriptionItemId?: string;
}

export interface MutationRecord {
  PK: string;
  SK: string;
  EntityType: 'MutationEvent';
  mutationId: string;
  userId: string;
  repoName: string;
  mutationType: string;
  mutationStatus: 'SUCCESS' | 'FAILURE';
  createdAt: string;
}

export async function createManagedAccountRecord(data: {
  awsAccountId: string;
  ownerEmail: string;
  repoName: string;
}) {
  const { awsAccountId, ownerEmail, repoName } = data;
  const PK = `ACCOUNT#${awsAccountId}`;
  const SK = `METADATA`;

  await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMO_TABLE,
      Key: { PK, SK },
      UpdateExpression:
        'SET EntityType = :type, awsAccountId = :id, ownerEmail = :email, repoName = :repo, currentMonthlySpendCents = :spend, reportedOverageCents = :overage, createdAt = :now',
      ExpressionAttributeValues: {
        ':type': 'ManagedAccount',
        ':id': awsAccountId,
        ':email': ownerEmail,
        ':repo': repoName,
        ':spend': 0,
        ':overage': 0,
        ':now': new Date().toISOString(),
      },
    })
  );

  // Also tag the user as owning this account
  await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMO_TABLE,
      Key: { PK: `USER#${ownerEmail}`, SK: `ACCOUNT#${awsAccountId}` },
      UpdateExpression: 'SET EntityType = :type, repoName = :repo',
      ExpressionAttributeValues: {
        ':type': 'UserAccountLink',
        ':repo': repoName,
      },
    })
  );
}

export async function ensureUserMetadata(email: string) {
  const PK = `USER#${email}`;
  const SK = `METADATA`;

  const existing = await docClient.send(
    new GetCommand({
      TableName: process.env.DYNAMO_TABLE,
      Key: { PK, SK },
    })
  );

  if (!existing.Item) {
    await docClient.send(
      new UpdateCommand({
        TableName: process.env.DYNAMO_TABLE,
        Key: { PK, SK },
        UpdateExpression:
          'SET EntityType = :type, aiTokenBalanceCents = :balance, aiRefillThresholdCents = :threshold, aiTopupAmountCents = :topupAmount, coEvolutionOptIn = :coevo, autoTopupEnabled = :topup',
        ExpressionAttributeValues: {
          ':type': 'UserMetadata',
          ':balance': 500, // $5.00 welcome credit
          ':threshold': 100, // $1.00 refill threshold
          ':topupAmount': 1000, // $10.00 default top-up
          ':coevo': false,
          ':topup': true,
        },
      })
    );
  }
}

export async function getManagedAccountsForUser(email: string) {
  const response = await docClient.send(
    new QueryCommand({
      TableName: process.env.DYNAMO_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk_prefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${email}`,
        ':sk_prefix': 'ACCOUNT#',
      },
    })
  );

  const accountIds = (response.Items || []).map((item) =>
    item.SK.replace('ACCOUNT#', '')
  );

  const accounts: ManagedAccountRecord[] = [];
  for (const id of accountIds) {
    const accRes = await docClient.send(
      new GetCommand({
        TableName: process.env.DYNAMO_TABLE,
        Key: { PK: `ACCOUNT#${id}`, SK: 'METADATA' },
      })
    );
    if (accRes.Item) accounts.push(accRes.Item as ManagedAccountRecord);
  }

  return accounts;
}

export async function createMutationRecord(data: {
  userId: string;
  mutationId: string;
  repoName?: string;
  type: string;
  status: 'SUCCESS' | 'FAILURE';
}) {
  const { userId, mutationId, repoName, type, status } = data;
  const PK = `USER#${userId}`;
  const SK = `MUTATION#${mutationId}`;

  await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMO_TABLE,
      Key: { PK, SK },
      UpdateExpression:
        'SET EntityType = :type, mutationId = :id, repoName = :repo, mutationType = :mtype, mutationStatus = :status, createdAt = :now',
      ExpressionAttributeValues: {
        ':type': 'MutationEvent',
        ':id': mutationId,
        ':repo': repoName || 'unknown',
        ':mtype': type,
        ':status': status,
        ':now': new Date().toISOString(),
      },
    })
  );
}

export async function getRecentMutationsForUser(email: string, limit = 10) {
  const response = await docClient.send(
    new QueryCommand({
      TableName: process.env.DYNAMO_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk_prefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${email}`,
        ':sk_prefix': 'MUTATION#',
      },
      ScanIndexForward: false, // Descending order (recent first)
      Limit: limit,
    })
  );

  return (response.Items || []) as MutationRecord[];
}

export async function getUserMetadata(
  email: string
): Promise<UserMetadata | null> {
  const response = await docClient.send(
    new GetCommand({
      TableName: process.env.DYNAMO_TABLE,
      Key: { PK: `USER#${email}`, SK: 'METADATA' },
    })
  );
  return (response.Item as UserMetadata) || null;
}

export async function getUserStatus(email: string): Promise<string | null> {
  const response = await docClient.send(
    new QueryCommand({
      TableName: process.env.DYNAMO_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK = :sk',
      ExpressionAttributeValues: {
        ':pk': 'USER',
        ':sk': email,
      },
    })
  );

  return response.Items?.[0]?.status || null;
}

export async function updateProvisioningStatus(
  awsAccountId: string,
  status: 'provisioning' | 'complete' | 'failed',
  error?: string,
  repoUrl?: string
) {
  const updateExpr = [
    'SET provisioningStatus = :status',
    repoUrl ? ', repoUrl = :repoUrl' : '',
    error ? ', provisioningError = :error' : '',
  ]
    .filter(Boolean)
    .join('');

  const expressionValues: Record<string, any> = {
    ':status': status,
  };

  if (repoUrl) expressionValues[':repoUrl'] = repoUrl;
  if (error) expressionValues[':error'] = error;

  await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMO_TABLE,
      Key: { PK: `ACCOUNT#${awsAccountId}`, SK: 'METADATA' },
      UpdateExpression: updateExpr,
      ExpressionAttributeValues: expressionValues,
    })
  );
}

export async function getProvisioningStatus(email: string): Promise<{
  status: 'provisioning' | 'complete' | 'failed' | 'none';
  accounts: ManagedAccountRecord[];
}> {
  const accounts = await getManagedAccountsForUser(email);

  if (accounts.length === 0) {
    return { status: 'none', accounts: [] };
  }

  const hasProvisioning = accounts.some(
    (a) => a.provisioningStatus === 'provisioning'
  );
  const hasFailed = accounts.some((a) => a.provisioningStatus === 'failed');

  if (hasProvisioning) return { status: 'provisioning', accounts };
  if (hasFailed) return { status: 'failed', accounts };
  return { status: 'complete', accounts };
}

/**
 * Deduct credits from user's AI token balance.
 * Returns the new balance in cents.
 * If balance drops to 0 or below, the account is suspended.
 */
export async function deductCredits(
  email: string,
  costCents: number
): Promise<{ newBalance: number; suspended: boolean }> {
  const PK = `USER#${email}`;
  const SK = `METADATA`;

  const result = await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMO_TABLE,
      Key: { PK, SK },
      UpdateExpression: 'SET aiTokenBalanceCents = aiTokenBalanceCents - :cost',
      ExpressionAttributeValues: {
        ':cost': costCents,
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  const newBalance = result.Attributes?.aiTokenBalanceCents ?? 0;

  if (newBalance <= 0) {
    await suspendAccount(email);
    return { newBalance: 0, suspended: true };
  }

  return { newBalance, suspended: false };
}

/**
 * Suspend a user account — blocks mutation activity.
 */
export async function suspendAccount(email: string): Promise<void> {
  const PK = `USER#${email}`;
  const SK = `METADATA`;

  await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMO_TABLE,
      Key: { PK, SK },
      UpdateExpression: 'SET accountStatus = :status, suspendedAt = :now',
      ExpressionAttributeValues: {
        ':status': 'SUSPENDED',
        ':now': new Date().toISOString(),
      },
    })
  );
}

/**
 * Resume a suspended user account after recharge.
 */
export async function resumeAccount(email: string): Promise<void> {
  const PK = `USER#${email}`;
  const SK = `METADATA`;

  await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMO_TABLE,
      Key: { PK, SK },
      UpdateExpression:
        'SET accountStatus = :status, resumedAt = :now REMOVE suspendedAt',
      ExpressionAttributeValues: {
        ':status': 'ACTIVE',
        ':now': new Date().toISOString(),
      },
    })
  );
}

/**
 * Add credits to user's AI token balance.
 * If account was suspended, auto-resume it.
 */
export async function addCredits(
  email: string,
  amountCents: number
): Promise<{ newBalance: number; wasSuspended: boolean }> {
  const PK = `USER#${email}`;
  const SK = `METADATA`;

  // Check current status
  const current = await getUserMetadata(email);
  const wasSuspended = (current as any)?.accountStatus === 'SUSPENDED';

  const result = await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMO_TABLE,
      Key: { PK, SK },
      UpdateExpression:
        'SET aiTokenBalanceCents = if_not_exists(aiTokenBalanceCents, :zero) + :amount',
      ExpressionAttributeValues: {
        ':amount': amountCents,
        ':zero': 0,
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  const newBalance = result.Attributes?.aiTokenBalanceCents ?? 0;

  // Auto-resume if was suspended and now has credits
  if (wasSuspended && newBalance > 0) {
    await resumeAccount(email);
  }

  return { newBalance, wasSuspended };
}

export interface InnovationPatternRecord {
  PK: 'INNOVATION';
  SK: string; // PATTERN#<timestamp>#<repoName>
  EntityType: 'InnovationPattern';
  title: string;
  rationale: string;
  logic: string;
  category: 'performance' | 'security' | 'cost' | 'reliability';
  filesAffected: string[];
  sourceRepo: string;
  sourceOwner: string;
  status: 'PENDING' | 'PROMOTED' | 'REJECTED';
  createdAt: string;
}

export async function createInnovationPatternRecord(data: {
  pattern: any;
  sourceRepo: string;
  sourceOwner: string;
}) {
  const { pattern, sourceRepo, sourceOwner } = data;
  const timestamp = new Date().toISOString();
  const PK = 'INNOVATION';
  const SK = `PATTERN#${timestamp}#${sourceRepo}`;

  await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMO_TABLE,
      Key: { PK, SK },
      UpdateExpression:
        'SET EntityType = :type, title = :title, rationale = :rationale, logic = :logic, category = :category, filesAffected = :files, sourceRepo = :repo, sourceOwner = :owner, #status = :status, createdAt = :now',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':type': 'InnovationPattern',
        ':title': pattern.title,
        ':rationale': pattern.rationale,
        ':logic': pattern.logic,
        ':category': pattern.category,
        ':files': pattern.filesAffected,
        ':repo': sourceRepo,
        ':owner': sourceOwner,
        ':status': 'PENDING',
        ':now': timestamp,
      },
    })
  );
}

export async function getPendingInnovations() {
  const response = await docClient.send(
    new QueryCommand({
      TableName: process.env.DYNAMO_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk_prefix)',
      ExpressionAttributeValues: {
        ':pk': 'INNOVATION',
        ':sk_prefix': 'PATTERN#',
      },
      ScanIndexForward: false, // Recent first
    })
  );

  return (response.Items || []) as InnovationPatternRecord[];
}

export async function updateInnovationStatus(
  sk: string,
  status: 'PROMOTED' | 'REJECTED'
) {
  await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMO_TABLE,
      Key: { PK: 'INNOVATION', SK: sk },
      UpdateExpression: 'SET #status = :status, updatedAt = :now',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': status,
        ':now': new Date().toISOString(),
      },
    })
  );
}
