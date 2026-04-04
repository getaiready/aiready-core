import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRemediation, updateRemediation } from '@/lib/db/remediation';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { Resource } from 'sst';

const sqs = new SQSClient({
  region: process.env.AWS_REGION || 'ap-southeast-2',
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { remediationId, type } = await req.json();
    if (!remediationId) {
      return NextResponse.json(
        { error: 'Missing remediationId' },
        { status: 400 }
      );
    }

    const remediation = await getRemediation(remediationId);
    if (!remediation) {
      return NextResponse.json(
        { error: 'Remediation not found' },
        { status: 404 }
      );
    }

    // Verify ownership (or team membership in the future)
    if (remediation.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const isSwarm = type === 'swarm';
    console.log(
      `[RemediateAPI] Enqueueing ${isSwarm ? 'Swarm' : 'Standard'} Remediation for ${remediationId}`
    );

    // Update status to pending/in-progress to reflect it's been triggered
    await updateRemediation(remediationId, {
      status: 'in-progress',
      agentStatus: 'Remediation request queued...',
    });

    // Send message to Remediation SQS Queue
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: (Resource as any).RemediationQueue.url,
        MessageBody: JSON.stringify({
          remediationId,
          repoId: remediation.repoId,
          userId: session.user.id,
          accessToken: (session.user as any).accessToken, // Ensure accessToken is passed if available
          type: isSwarm ? 'swarm' : 'standard',
        }),
        MessageGroupId: remediation.repoId,
        MessageDeduplicationId: `${remediationId}-trigger-${Date.now()}`,
      })
    );

    return NextResponse.json({
      success: true,
      message: 'Remediation agent task enqueued',
      remediationId,
    });
  } catch (error) {
    console.error('[RemediateAPI] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to trigger remediation',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
