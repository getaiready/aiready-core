import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { getRepository, getLatestAnalysis } from '@/lib/db';
import { getAnalysis, normalizeReport } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repoId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repoId } = await params;

    const repo = await getRepository(repoId);
    if (!repo) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    // Auth check: User must own the repo.
    // TODO: Implement proper team membership check
    if (repo.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to repo' },
        { status: 403 }
      );
    }

    const latestAnalysisRecord = await getLatestAnalysis(repoId);
    if (!latestAnalysisRecord || !latestAnalysisRecord.rawKey) {
      return NextResponse.json(
        {
          error: 'No analysis found for this repository',
          repo,
        },
        { status: 404 }
      );
    }

    const fullAnalysis = await getAnalysis(latestAnalysisRecord.rawKey);
    if (!fullAnalysis) {
      return NextResponse.json(
        {
          error: 'Analysis details not found in storage',
          repo,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      repo,
      analysis: fullAnalysis,
      timestamp: latestAnalysisRecord.timestamp,
    });
  } catch (error) {
    console.error('Error fetching latest analysis:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
