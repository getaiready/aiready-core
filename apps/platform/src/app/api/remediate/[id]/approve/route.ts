import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRemediation, updateRemediation } from '@/lib/db/remediation';
import { getRepository } from '@/lib/db/repositories';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { Resource } from 'sst';

const sqs = new SQSClient({
  region: process.env.AWS_REGION || 'ap-southeast-2',
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const remediation = await getRemediation(id);
    if (!remediation) {
      return NextResponse.json(
        { error: 'Remediation not found' },
        { status: 404 }
      );
    }

    // Fetch repo to verify ownership and get repo URL for the worker
    const repo = await getRepository(remediation.repoId);
    if (!repo) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (remediation.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Update status to 'approved' and trigger agent execution
    await updateRemediation(id, {
      status: 'approved',
      agentStatus: 'Human approved. Starting refactor agent...',
    });

    console.log(
      `[ApprovalAPI] Enqueueing remediation ${id} after human approval`
    );

    // 2. Send SQS message to trigger the remediation worker
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: (Resource as any).RemediationQueue.url,
        MessageBody: JSON.stringify({
          remediationId: id,
          repoId: remediation.repoId,
          userId: session.user.id,
          accessToken: (session.user as any).accessToken,
          type: 'swarm',
        }),
        MessageGroupId: remediation.repoId,
        MessageDeduplicationId: `${id}-approve-${Date.now()}`,
      })
    );

    return NextResponse.json({
      success: true,
      message: 'Remediation approved and started',
    });
  } catch (error) {
    console.error('[ApprovalAPI] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
