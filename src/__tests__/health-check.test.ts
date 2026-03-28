import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('checkHealth', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns healthy for 2xx response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('', { status: 200 })
    );

    const { checkHealth } = await import('../monitoring/health-check');
    const result = await checkHealth('https://example.com');

    expect(result.url).toBe('https://example.com');
    expect(result.status).toBe('healthy');
    expect(result.statusCode).toBe(200);
    expect(result.timestamp).toBeDefined();
  });

  it('returns healthy for 3xx redirect response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('', { status: 301 })
    );

    const { checkHealth } = await import('../monitoring/health-check');
    const result = await checkHealth('https://example.com');

    expect(result.status).toBe('healthy');
    expect(result.statusCode).toBe(301);
  });

  it('returns unhealthy for 5xx response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Internal Server Error', { status: 500 })
    );

    const { checkHealth } = await import('../monitoring/health-check');
    const result = await checkHealth('https://example.com');

    expect(result.status).toBe('unhealthy');
    expect(result.statusCode).toBe(500);
  });

  it('returns unhealthy for 4xx response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Not Found', { status: 404 })
    );

    const { checkHealth } = await import('../monitoring/health-check');
    const result = await checkHealth('https://example.com');

    expect(result.status).toBe('unhealthy');
    expect(result.statusCode).toBe(404);
  });

  it('returns error on network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new Error('Network connection refused')
    );

    const { checkHealth } = await import('../monitoring/health-check');
    const result = await checkHealth('https://example.com');

    expect(result.status).toBe('error');
    expect(result.error).toBe('Network connection refused');
  });

  it('returns error on abort/timeout', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new DOMException('The operation was aborted.', 'AbortError')
    );

    const { checkHealth } = await import('../monitoring/health-check');
    const result = await checkHealth('https://example.com', 5000);

    expect(result.status).toBe('error');
    expect(result.error).toBe('The operation was aborted.');
  });

  it('handles non-Error thrown values', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue('string error');

    const { checkHealth } = await import('../monitoring/health-check');
    const result = await checkHealth('https://example.com');

    expect(result.status).toBe('error');
    expect(result.error).toBe('string error');
  });
});

describe('reportFailure', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('POSTs to alert endpoint with correct payload on unhealthy', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('OK', { status: 200 }));

    const { reportFailure } = await import('../monitoring/health-check');
    const result = {
      url: 'https://example.com',
      status: 'unhealthy' as const,
      statusCode: 503,
      timestamp: '2025-01-01T00:00:00.000Z',
    };

    await reportFailure(result, 'https://alert-api.example.com', 'TestApp');

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://alert-api.example.com/alert',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const body = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string);
    expect(body.site).toBe('TestApp');
    expect(body.status).toBe('unhealthy');
    expect(body.message).toBeDefined();
    expect(body.timestamp).toBe('2025-01-01T00:00:00.000Z');
  });

  it('POSTs error message when result has error field', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('OK', { status: 200 }));

    const { reportFailure } = await import('../monitoring/health-check');
    const result = {
      url: 'https://example.com',
      status: 'error' as const,
      error: 'Connection timeout',
      timestamp: '2025-01-01T00:00:00.000Z',
    };

    await reportFailure(result, 'https://alert-api.example.com', 'TestApp');

    const body = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string);
    expect(body.site).toBe('TestApp');
    expect(body.status).toBe('error');
    expect(body.message).toBe('Connection timeout');
  });

  it('does NOT call fetch for healthy results', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const { reportFailure } = await import('../monitoring/health-check');
    const result = {
      url: 'https://example.com',
      status: 'healthy' as const,
      statusCode: 200,
      timestamp: '2025-01-01T00:00:00.000Z',
    };

    await reportFailure(result, 'https://alert-api.example.com', 'TestApp');

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('handles fetch errors gracefully without throwing', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new Error('Alert endpoint down')
    );
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { reportFailure } = await import('../monitoring/health-check');
    const result = {
      url: 'https://example.com',
      status: 'unhealthy' as const,
      statusCode: 500,
      timestamp: '2025-01-01T00:00:00.000Z',
    };

    await expect(
      reportFailure(result, 'https://alert-api.example.com', 'TestApp')
    ).resolves.not.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to report failure:',
      expect.any(Error)
    );
  });
});

describe('scheduled handler', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('checks health and logs healthy status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('', { status: 200 })
    );
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const { default: handler } = await import('../monitoring/health-check');
    await handler.scheduled(
      {},
      {
        URL_TO_CHECK: 'https://example.com',
        PROJECT_NAME: 'TestApp',
        HEALTH_API_URL: 'https://alert-api.example.com',
      },
      {}
    );

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('✅'));
  });

  it('checks health and reports on unhealthy', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Down', { status: 500 })
    );
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const { default: handler } = await import('../monitoring/health-check');
    await handler.scheduled(
      {},
      {
        URL_TO_CHECK: 'https://example.com',
        PROJECT_NAME: 'TestApp',
        HEALTH_API_URL: 'https://alert-api.example.com',
      },
      {}
    );

    // Verify reportFailure was called (fetch called with /alert path)
    const fetchCalls = vi.mocked(globalThis.fetch).mock.calls;
    const alertCall = fetchCalls.find(
      (call) => call[0] === 'https://alert-api.example.com/alert'
    );
    expect(alertCall).toBeDefined();
  });

  it('logs error and returns when URL_TO_CHECK is missing', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const { default: handler } = await import('../monitoring/health-check');
    await handler.scheduled(
      {},
      {
        PROJECT_NAME: 'TestApp',
        HEALTH_API_URL: 'https://alert-api.example.com',
      },
      {}
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'URL_TO_CHECK not configured in environment'
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
