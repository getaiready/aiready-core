import { describe, it, expect, vi, afterEach } from 'vitest';

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

  it('signs and publishes to SNS on unhealthy', async () => {
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

    const env = {
      SNS_TOPIC_ARN:
        'arn:aws:sns:ap-southeast-2:316759592139:aiready-health-alerts',
      PROJECT_NAME: 'TestApp',
      AWS_REGION: 'ap-southeast-2',
      AWS_ACCESS_KEY_ID: 'test-key',
      AWS_SECRET_ACCESS_KEY: 'test-secret',
    };

    await reportFailure(result, env);

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://sns.ap-southeast-2.amazonaws.com/',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('AWS4-HMAC-SHA256'),
        }),
      })
    );

    const body = fetchSpy.mock.calls[0][1]!.body as string;
    expect(body).toContain('Action=Publish');
    expect(body).toContain(
      'TopicArn=arn%3Aaws%3Asns%3Aap-southeast-2%3A316759592139%3Aaiready-health-alerts'
    );
    expect(body).toContain('Subject=TestApp+is+unhealthy');
  });

  it('does NOT call SNS for healthy results', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const { reportFailure } = await import('../monitoring/health-check');
    const result = {
      url: 'https://example.com',
      status: 'healthy' as const,
      statusCode: 200,
      timestamp: '2025-01-01T00:00:00.000Z',
    };

    await reportFailure(result, { SNS_TOPIC_ARN: 'arn:test' });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('handles fetch errors gracefully without throwing', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new Error('SNS endpoint down')
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
      reportFailure(result, {
        SNS_TOPIC_ARN: 'arn:test',
        AWS_ACCESS_KEY_ID: 'k',
        AWS_SECRET_ACCESS_KEY: 's',
      })
    ).resolves.not.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to publish to SNS:',
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
        SNS_TOPIC_ARN: 'arn:test',
      },
      {}
    );

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('✅'));
  });

  it('checks health and reports on unhealthy', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('Down', { status: 500 })) // health check attempt 1
      .mockResolvedValueOnce(new Response('Down', { status: 500 })) // health check attempt 2
      .mockResolvedValueOnce(new Response('Down', { status: 500 })) // health check attempt 3
      .mockResolvedValueOnce(new Response('OK', { status: 200 })); // SNS publish

    vi.spyOn(console, 'log').mockImplementation(() => {});

    const { default: handler } = await import('../monitoring/health-check');
    await handler.scheduled(
      {},
      {
        URL_TO_CHECK: 'https://example.com',
        PROJECT_NAME: 'TestApp',
        SNS_TOPIC_ARN: 'arn:test',
        AWS_ACCESS_KEY_ID: 'k',
        AWS_SECRET_ACCESS_KEY: 's',
      },
      {}
    );

    // Verify SNS publish was called (3 health checks + 1 SNS publish)
    const fetchCalls = vi.mocked(globalThis.fetch).mock.calls;
    expect(fetchCalls.length).toBe(4);
    expect(fetchCalls[3][0]).toBe('https://sns.ap-southeast-2.amazonaws.com/');
  });

  it('logs error and returns when URL_TO_CHECK is missing', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const { default: handler } = await import('../monitoring/health-check');
    await handler.scheduled(
      {},
      {
        PROJECT_NAME: 'TestApp',
        SNS_TOPIC_ARN: 'arn:test',
      },
      {}
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'URL_TO_CHECK not configured in environment'
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
