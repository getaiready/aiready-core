import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

export async function POST(req: NextRequest) {
  const body = await req.json();

  // 1. Authentication
  // In ClawMore, we use the user's session or a specialized API key
  const userId = req.headers.get('X-ClawMore-User-Id');

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Balance Check
    const userRes = await docClient.send(
      new GetCommand({
        TableName: process.env.DYNAMO_TABLE,
        Key: { PK: `USER#${userId}`, SK: 'METADATA' },
      })
    );

    const balanceCents = userRes.Item?.aiTokenBalanceCents ?? 0;

    if (balanceCents <= 0) {
      return NextResponse.json(
        { error: 'Payment Required: AI Fuel Empty' },
        { status: 402 }
      );
    }

    // 3. Forward to OpenRouter
    const openRouterResponse = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://clawmore.ai',
          'X-Title': 'ClawMore Managed AI',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await openRouterResponse.json();

    if (!openRouterResponse.ok) {
      return NextResponse.json(data, { status: openRouterResponse.status });
    }

    // 4. Token Metering
    const usage = data.usage;
    if (usage) {
      const tokensUsed = usage.total_tokens || 0;
      const costInCents = Math.max(1, Math.ceil(tokensUsed * 0.001)); // Heuristic: $0.01/1k tokens

      await docClient.send(
        new UpdateCommand({
          TableName: process.env.DYNAMO_TABLE,
          Key: { PK: `USER#${userId}`, SK: 'METADATA' },
          UpdateExpression:
            'SET aiTokenBalanceCents = aiTokenBalanceCents - :cost',
          ExpressionAttributeValues: { ':cost': costInCents },
        })
      );

      console.log(
        `User ${userId} used ${tokensUsed} tokens. Balance decremented by ${costInCents} cents.`
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('AI Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
