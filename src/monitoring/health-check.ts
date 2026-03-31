/**
 * AIReady Shared Health Check Worker Logic
 * This file is shared across multiple projects.
 * Configuration is driven by Environment Variables in wrangler.toml
 */

import { signAndFetch, type AwsCredentials } from './aws-signer';

export interface HealthCheckResult {
  url: string;
  status: 'healthy' | 'unhealthy' | 'error';
  statusCode?: number;
  responseTime?: number;
  timestamp: string;
  error?: string;
}

const DEFAULT_TIMEOUT = 30000;

export async function checkHealth(
  url: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const isHealthy = response.status >= 200 && response.status < 400;

    return {
      url,
      status: isHealthy ? 'healthy' : 'unhealthy',
      statusCode: response.status,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      url,
      status: 'error',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export interface MonitorEnv {
  URL_TO_CHECK?: string;
  PROJECT_NAME?: string;
  SNS_TOPIC_ARN?: string;
  AWS_REGION?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  TIMEOUT?: string;
}

export async function reportFailure(
  result: HealthCheckResult,
  env: MonitorEnv
) {
  if (result.status === 'healthy') return;

  const topicArn = env.SNS_TOPIC_ARN;
  if (!topicArn) {
    console.error('SNS_TOPIC_ARN not configured');
    return;
  }

  const projectName = env.PROJECT_NAME || 'Unknown';
  const region = env.AWS_REGION || 'ap-southeast-2';

  const subject = `${projectName} is ${result.status}`;
  const message = [
    `Site: ${projectName}`,
    `URL: ${result.url}`,
    `Status: ${result.status}`,
    result.error ? `Error: ${result.error}` : `HTTP ${result.statusCode}`,
    `Timestamp: ${result.timestamp}`,
  ].join('\n');

  const body = new URLSearchParams({
    Action: 'Publish',
    Version: '2010-03-31',
    TopicArn: topicArn,
    Subject: subject,
    Message: message,
  }).toString();

  const credentials: AwsCredentials = {
    accessKeyId: env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
    region,
  };

  try {
    const snsUrl = `https://sns.${region}.amazonaws.com/`;
    const response = await signAndFetch(snsUrl, body, credentials);

    if (!response.ok) {
      const text = await response.text();
      console.error(`SNS publish failed (${response.status}): ${text}`);
    }
  } catch (e) {
    console.error('Failed to publish to SNS:', e);
  }
}

interface WorkerHandler {
  scheduled(event: any, env: any, ctx: any): Promise<void>;
  fetch(request: Request, env: any): Promise<Response>;
}

const handler: WorkerHandler = {
  async scheduled(_event: any, env: MonitorEnv) {
    const url = env.URL_TO_CHECK;
    const projectName = env.PROJECT_NAME || 'Unknown Project';

    if (!url) {
      console.error('URL_TO_CHECK not configured in environment');
      return;
    }

    const result = await checkHealth(
      url,
      env.TIMEOUT ? parseInt(env.TIMEOUT, 10) : undefined
    );
    console.log(
      `${result.status === 'healthy' ? '✅' : '❌'} [${projectName}] ${result.url}: ${result.status}`
    );

    if (result.status !== 'healthy') {
      await reportFailure(result, env);
    }
  },

  async fetch(_request: Request, env: MonitorEnv) {
    const url = env.URL_TO_CHECK;
    if (!url)
      return new Response('URL_TO_CHECK not configured', { status: 500 });

    const result = await checkHealth(
      url,
      env.TIMEOUT ? parseInt(env.TIMEOUT, 10) : undefined
    );
    return new Response(JSON.stringify(result, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};

export default handler;
