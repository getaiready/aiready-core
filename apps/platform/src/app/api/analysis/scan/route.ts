import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRepository, setRepositoryScanning } from '@/lib/db';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { Resource } from 'sst';

const sqs = new SQSClient({
  region: process.env.AWS_REGION || 'ap-southeast-2',
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokenMasked = session.user.accessToken
      ? `${session.user.accessToken.slice(0, 4)}...${session.user.accessToken.slice(-4)}`
      : 'none';
    console.log(
      `[ScanAPI] Triggering scan for user ${userId}. AccessToken: ${tokenMasked}`
    );

    const { repoId } = await request.json();
    if (!repoId) {
      return NextResponse.json(
        { error: 'Repository ID is required' },
        { status: 400 }
      );
    }

    // Verify repository exists and belongs to user
    const repo = await getRepository(repoId);
    if (!repo) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    if (repo.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Set status to scanning
    await setRepositoryScanning(repoId, true);

    // Send message to SQS
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: (Resource as any).ScanQueue.url,
        MessageBody: JSON.stringify({
          repoId,
          userId,
          repoUrl: repo.url,
          accessToken: session.user.accessToken,
        }),
        MessageGroupId: repoId,
        MessageDeduplicationId: `${repoId}-${Date.now()}`,
      })
    );

    return NextResponse.json({
      message: 'Scan triggered successfully',
      repoId,
    });
  } catch (error) {
    console.error('Error triggering scan:', error);
    return NextResponse.json(
      {
        error: 'Failed to trigger scan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
