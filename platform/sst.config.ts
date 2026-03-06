/// <reference path="./.sst/platform/config.d.ts" />

// Suppress AWS SDK warning when both profile and static keys are set
// by prioritizing the profile (which is the project standard)
if (
  process.env.AWS_PROFILE &&
  (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SECRET_ACCESS_KEY)
) {
  delete process.env.AWS_ACCESS_KEY_ID;
  delete process.env.AWS_SECRET_ACCESS_KEY;
}

export default $config({
  app(input) {
    return {
      name: 'aiready-platform',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
    };
  },
  async run() {
    // S3 Bucket for analysis data
    const bucket = new sst.aws.Bucket('AnalysisBucket');

    // S3 Bucket for user submissions (feedback, waitlist)
    const submissions = new sst.aws.Bucket('SubmissionsBucket');

    // SES Domain Configuration
    // Note: SES domain verification must be done manually in AWS Console
    // or via a separate Pulumi Cloudflare provider setup
    // Local/Dev: noreply@dev.getaiready.dev (subdomain)
    // Production: noreply@getaiready.dev
    const isProd = $app.stage === 'prod' || $app.stage === 'production';
    const isLocal = $app.stage === 'local';
    const sesDomain = isProd ? 'getaiready.dev' : 'dev.getaiready.dev';

    // DynamoDB Table for all entities (Single Table Design)
    // TTL enabled for automatic cleanup of old analyses (Free tier: 7 days)
    const table = new sst.aws.Dynamo('MainTable', {
      fields: {
        PK: 'string',
        SK: 'string',
        GSI1PK: 'string',
        GSI1SK: 'string',
        GSI2PK: 'string',
        GSI2SK: 'string',
        GSI3PK: 'string',
        GSI3SK: 'string',
      },
      primaryIndex: { hashKey: 'PK', rangeKey: 'SK' },
      globalIndexes: {
        GSI1: { hashKey: 'GSI1PK', rangeKey: 'GSI1SK' },
        GSI2: { hashKey: 'GSI2PK', rangeKey: 'GSI2SK' },
        GSI3: { hashKey: 'GSI3PK', rangeKey: 'GSI3SK' },
      },
      ttl: 'ttl', // Enable TTL on the table (field doesn't need to be indexed)
    });

    // EventBridge Bus for platform events
    const bus = new sst.aws.Bus('PlatformBus');

    // Queue for background analysis requests
    const scanQueue = new sst.aws.Queue('ScanQueue', {
      visibilityTimeout: '15 minutes',
    });

    // Queue for processing uploaded analysis results
    const analysisQueue = new sst.aws.Queue('AnalysisQueue', {
      visibilityTimeout: '5 minutes',
    });

    // Subscribe AnalysisQueue to the Bus (REMOVED: will send to SQS directly for better reliability in SST Ion)
    /*
    bus.subscribe('AnalysisUploadedRule', analysisQueue.arn, {
      pattern: {
        detailType: ['AnalysisUploaded'],
      },
    });
    */

    // Next.js site configuration
    const siteConfig: sst.aws.NextjsArgs = {
      path: '.',
      dev: {
        command: 'pnpm run dev:next',
        autostart: true,
      },
      environment: {
        S3_BUCKET: bucket.name,
        SUBMISSIONS_BUCKET: submissions.name,
        DYNAMO_TABLE: table.name,
        // NextAuth v5 uses AUTH_URL and AUTH_SECRET
        // For SST dev mode, use localhost; for deployed stages use the actual URL
        AUTH_URL:
          process.env.AUTH_URL ||
          (isLocal
            ? 'http://localhost:8888'
            : isProd
              ? 'https://platform.getaiready.dev'
              : $app.stage === 'dev'
                ? 'https://dev.platform.getaiready.dev'
                : `https://${$app.stage}.platform.getaiready.dev`),
        NEXT_PUBLIC_APP_URL: isLocal
          ? 'http://localhost:8888'
          : isProd
            ? 'https://platform.getaiready.dev'
            : $app.stage === 'dev'
              ? 'https://dev.platform.getaiready.dev'
              : `https://${$app.stage}.platform.getaiready.dev`,
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
        AUTH_SECRET:
          process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '',
        AUTH_TRUST_HOST: 'true',
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
        STRIPE_PRICE_ID_PRO: process.env.STRIPE_PRICE_ID_PRO || '',
        STRIPE_PRICE_ID_TEAM: process.env.STRIPE_PRICE_ID_TEAM || '',
        STRIPE_PRICE_ID_ENTERPRISE:
          process.env.STRIPE_PRICE_ID_ENTERPRISE || '',
        SES_DOMAIN: sesDomain,
        SES_FROM_EMAIL: `noreply@${sesDomain}`,
        SES_TO_EMAIL: process.env.SES_TO_EMAIL || 'team@getaiready.dev',
      },
    };

    // Add custom domain configuration
    // DNS records are managed by SST via Cloudflare API
    if (isProd) {
      siteConfig.domain = {
        name: 'platform.getaiready.dev',
        dns: sst.cloudflare.dns({
          zone:
            process.env.CLOUDFLARE_ZONE_ID ||
            '50eb7dcadc84c58ab34583742db0b671',
        }),
      };
    } else if ($app.stage === 'dev') {
      siteConfig.domain = {
        name: 'dev.platform.getaiready.dev',
        dns: sst.cloudflare.dns({
          zone:
            process.env.CLOUDFLARE_ZONE_ID ||
            '50eb7dcadc84c58ab34583742db0b671',
        }),
      };
    }

    // Subscribe workers to queues
    scanQueue.subscribe({
      handler: 'src/worker/index.handler',
      timeout: '15 minutes',
      memory: '2048 MB',
      nodejs: {
        install: [
          'isomorphic-git',
          'http',
          '@aiready/cli',
          '@aiready/core',
          '@aiready/pattern-detect',
          '@aiready/context-analyzer',
          '@aiready/consistency',
          '@aiready/ai-signal-clarity',
          '@aiready/agent-grounding',
          '@aiready/testability',
          '@aiready/doc-drift',
          '@aiready/deps',
          '@aiready/change-amplification',
        ],
      },
      link: [table, bucket, scanQueue],
      environment: {
        S3_BUCKET: bucket.name,
        DYNAMO_TABLE: table.name,
      },
    });

    analysisQueue.subscribe({
      handler: 'src/functions/process-analysis.handler',
      timeout: '5 minutes',
      memory: '1024 MB',
      link: [table, bucket, analysisQueue],
      permissions: [
        {
          actions: ['ses:SendEmail', 'ses:SendRawEmail'],
          resources: ['*'],
        },
      ],
      environment: {
        S3_BUCKET: bucket.name,
        DYNAMO_TABLE: table.name,
      },
    });

    const site = new sst.aws.Nextjs('Dashboard', {
      ...siteConfig,
      link: [table, bucket, scanQueue, analysisQueue, submissions, bus],
      permissions: [
        {
          actions: ['ses:SendEmail', 'ses:SendRawEmail'],
          resources: ['*'],
        },
      ],
    });

    return {
      site: site.url,
      bucketName: bucket.name,
      tableName: table.name,
      scanQueueUrl: scanQueue.url,
      analysisQueueUrl: analysisQueue.url,
      busName: bus.name,
    };
  },
});
