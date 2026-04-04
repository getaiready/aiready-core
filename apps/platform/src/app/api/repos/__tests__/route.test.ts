import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { getGitHubRepoInfo, MAX_REPO_SIZE_KB } from '@/lib/github';
import { createRepository, listUserRepositories } from '@/lib/db';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  createRepository: vi.fn(),
  listUserRepositories: vi.fn(),
  listTeamRepositories: vi.fn(),
  getRepository: vi.fn(),
  deleteRepository: vi.fn(),
  getLatestAnalysis: vi.fn(),
}));

vi.mock('@/lib/github', () => ({
  getGitHubRepoInfo: vi.fn(),
  MAX_REPO_SIZE_KB: 512000,
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Repos API - POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if unauthorized', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as any).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/repos', {
      method: 'POST',
      body: JSON.stringify({
        name: 'test',
        url: 'https://github.com/owner/repo',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 if repository is too large', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as any).mockResolvedValue({
      user: { id: 'user-1', accessToken: 'token' },
    });

    (getGitHubRepoInfo as any).mockResolvedValue({
      size: MAX_REPO_SIZE_KB + 100,
      default_branch: 'main',
    });

    const req = new NextRequest('http://localhost/api/repos', {
      method: 'POST',
      body: JSON.stringify({
        name: 'large-repo',
        url: 'https://github.com/owner/large',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Repository is too large');
  });

  it('should create repository if valid and within limits', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as any).mockResolvedValue({
      user: { id: 'user-1', accessToken: 'token' },
    });

    (getGitHubRepoInfo as any).mockResolvedValue({
      size: 1000,
      default_branch: 'develop',
    });

    (listUserRepositories as any).mockResolvedValue([]);
    (createRepository as any).mockImplementation((repo: any) => repo);

    const req = new NextRequest('http://localhost/api/repos', {
      method: 'POST',
      body: JSON.stringify({
        name: 'valid-repo',
        url: 'https://github.com/owner/valid',
        description: 'Test repo',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.repo.name).toBe('valid-repo');
    expect(data.repo.defaultBranch).toBe('develop');
    expect(createRepository).toHaveBeenCalled();
  });
});
