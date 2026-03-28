import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { reportMeteredUsage } from '../lib/billing';
import { createMutationRecord } from '../lib/db';
import { Harvester } from '../lib/evolution/harvester';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: any) => {
  const { userId, mutationId, repoName, type, status, owner } = event.detail;

  if (!userId) {
    console.error('Missing userId in mutation event');
    return;
  }

  try {
    // 1. Record the mutation in DynamoDB for the dashboard
    await createMutationRecord({
      userId,
      mutationId,
      repoName,
      type: type || 'Infrastructure Mutation',
      status: status || 'SUCCESS',
    });

    // 2. Fetch User Metadata for tax and harvesting
    const userRes = await docClient.send(
      new GetCommand({
        TableName: process.env.DYNAMO_TABLE,
        Key: { PK: `USER#${userId}`, SK: 'METADATA' },
      })
    );

    const userMetadata = userRes.Item;
    if (!userMetadata) return;

    const {
      stripeMutationSubscriptionItemId: subscriptionItemId,
      coEvolutionOptIn,
      email: userEmail,
    } = userMetadata;

    // 3. Trigger Innovation Harvesting if opted in
    if (coEvolutionOptIn && owner && repoName) {
      const githubToken = process.env.GITHUB_SERVICE_TOKEN;
      if (githubToken) {
        const harvester = new Harvester(githubToken);
        await harvester
          .harvestInnovation(owner, repoName, userEmail)
          .catch((err) =>
            console.error('[Harvester] Failed to harvest innovation:', err)
          );
      }
    }

    // 4. Report Tax if NOT opted into co-evolution
    if (!coEvolutionOptIn && subscriptionItemId) {
      await reportMeteredUsage(subscriptionItemId, 1);
      console.log(
        `Mutation tax reported for mutation ${mutationId} (User: ${userId})`
      );
    } else if (coEvolutionOptIn) {
      console.log(`User ${userId} opted into co-evolution. Tax waived.`);
    }
  } catch (error) {
    console.error('Error in mutation handler:', error);
    throw error;
  }
};
