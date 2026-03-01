/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'aiready-landing',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
    };
  },
  async run() {
    // Storage for report submissions
    const submissions = new sst.aws.Bucket('Submissions', {
      public: false,
    });

    // SES Email Domain Identity with DKIM
    // If the SES domain identity already exists (e.g. created previously), skip creating it
    const domainName = 'getaiready.dev';
    let emailDomain: any = undefined;
    try {
      const cp = await import('child_process');
      const cmd = `aws sesv2 get-email-identity --email-identity ${domainName} --output json`;
      try {
        const out = cp.execSync(cmd, { encoding: 'utf8', env: process.env });
        if (out) {
          console.log(
            `SES identity for ${domainName} already exists; skipping creation.`
          );
          emailDomain = { sender: domainName };
        }
      } catch (e: any) {
        // If aws cli returns non-zero, assume identity not found and create via SST
        const output = [
          e.stdout ? String(e.stdout) : '',
          e.stderr ? String(e.stderr) : '',
          String(e),
        ].join('\n');

        if (
          output.includes('NotFoundException') ||
          output.includes('not exist') ||
          output.includes('not found')
        ) {
          console.log(
            `SES identity for ${domainName} not found; creating via SST.`
          );
          emailDomain = new sst.aws.Email('NotificationEmail', {
            sender: domainName,
            dns: sst.cloudflare.dns({
              zone: '50eb7dcadc84c58ab34583742db0b671',
            }),
          });
        } else {
          // Unknown error - rethrow so deploy fails visibly
          console.error(`Unexpected error checking SES identity: ${output}`);
          throw e;
        }
      }
    } catch (err) {
      // If child_process import or aws CLI check fails, rethrow to make the failure visible
      throw err;
    }

    // API Gateway HTTP API for public form submissions
    const api = new sst.aws.ApiGatewayV2('RequestApi', {
      cors: true,
    });

    api.route('POST /', {
      handler: 'api/request-report.handler',
      link: [submissions],
      environment: {
        SUBMISSIONS_BUCKET: submissions.name,
        SES_TO_EMAIL: process.env.SES_TO_EMAIL || '',
      },
      permissions: [
        {
          actions: ['ses:SendEmail', 'ses:SendRawEmail'],
          resources: ['*'],
        },
      ],
    });

    // Deploy as static site - animations and charts work perfectly in client-side mode
    const site = new sst.aws.StaticSite('AireadyLanding', {
      path: './',
      build: {
        command: 'pnpm build',
        output: 'out',
      },
      environment: {
        NEXT_PUBLIC_REQUEST_URL: api.url,
      },
      domain: {
        name: 'getaiready.dev',
        dns: sst.cloudflare.dns({
          zone: '50eb7dcadc84c58ab34583742db0b671',
        }),
      },
      invalidation: {
        paths: ['/*'],
        wait: true,
      },
    });

    // VS Code Marketplace publisher verification
    sst.cloudflare.dns({
      zone: '50eb7dcadc84c58ab34583742db0b671',
    }).createRecord('VSCodeMarketplaceVerification', {
      type: 'TXT',
      name: '_visual-studio-marketplace-pengcao',
      value: 'e5370864-bedf-4b65-9ef4-a99596a60d7d',
    }, {});

    return {
      site: site.url,
      apiUrl: api.url,
      submissionsBucket: submissions.name,
      emailDomain: emailDomain?.sender ?? domainName,
    };
  },
});
