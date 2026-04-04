import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRemediation, updateRemediation } from '@/lib/db/remediation';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { Resource } from 'sst';

const sqs = new SQSClient({
  region: process.env.AWS_REGION || 'ap-southeast-2',
});

/**
 * Expert Review Endpoint
 * POST /api/remediation/[id]/review
 *
 * On approve: triggers real PR creation via the remediation worker.
 * On request-changes: re-enqueues with expert feedback so the agent revises.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: remediationId } = await params;
    const { comment, decision } = (await req.json()) as {
      comment: string;
      decision: 'approve' | 'request-changes';
    };

    if (!decision) {
      return NextResponse.json(
        { error: 'Decision is required' },
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

    const accessToken = (session.user as any).accessToken;

    if (decision === 'approve') {
      // Expert approved — trigger the remediation worker to create a real PR
      await updateRemediation(remediationId, {
        status: 'approved',
        agentStatus: 'Expert approved. Starting refactor agent...',
        reviewFeedback: {
          userId: session.user.id,
          comment,
          decision,
          timestamp: new Date().toISOString(),
        },
      });

      console.log(
        `[ReviewAPI] Expert approved ${remediationId}, enqueueing PR creation`
      );

      await sqs.send(
        new SendMessageCommand({
          QueueUrl: (Resource as any).RemediationQueue.url,
          MessageBody: JSON.stringify({
            remediationId,
            repoId: remediation.repoId,
            userId: session.user.id,
            accessToken,
            type: 'swarm',
          }),
          MessageGroupId: remediation.repoId,
          MessageDeduplicationId: `${remediationId}-review-${decision}-${Date.now()}`,
        })
      );

      return NextResponse.json({ success: true, status: 'approved' });
    }

    // Expert requested changes — re-enqueue with feedback for agent iteration
    await updateRemediation(remediationId, {
      status: 'in-progress',
      agentStatus: `Expert requested changes: "${comment.substring(0, 50)}..."`,
      reviewFeedback: {
        userId: session.user.id,
        comment,
        decision,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(
      `[ReviewAPI] Expert requested changes on ${remediationId}, enqueueing revision`
    );

    await sqs.send(
      new SendMessageCommand({
        QueueUrl: (Resource as any).RemediationQueue.url,
        MessageBody: JSON.stringify({
          remediationId,
          repoId: remediation.repoId,
          userId: session.user.id,
          accessToken,
          type: 'swarm',
          expertFeedback: comment,
          previousDiff: remediation.suggestedDiff,
        }),
        MessageGroupId: remediation.repoId,
        MessageDeduplicationId: `${remediationId}-review-changes-${Date.now()}`,
      })
    );

    return NextResponse.json({ success: true, status: 'in-progress' });
  } catch (error) {
    console.error('[ReviewAPI] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
