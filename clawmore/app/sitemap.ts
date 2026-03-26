import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://clawmore.ai';

  const blogPosts = [
    { slug: 'openclaw-chronicles-12-future', date: '2026-05-02' },
    { slug: 'openclaw-chronicles-11-sync-architecture', date: '2026-04-30' },
    { slug: 'openclaw-chronicles-10-mutation-tax', date: '2026-04-28' },
    { slug: 'openclaw-chronicles-09-eaas', date: '2026-04-25' },
    { slug: 'openclaw-chronicles-08-security', date: '2026-04-22' },
    { slug: 'openclaw-chronicles-07-persistence', date: '2026-04-18' },
    { slug: 'openclaw-chronicles-06-self-improvement', date: '2026-04-15' },
    { slug: 'openclaw-chronicles-05-heartbeat', date: '2026-04-12' },
    { slug: 'openclaw-chronicles-04-agentskills', date: '2026-04-08' },
    { slug: 'openclaw-chronicles-03-neural-spine', date: '2026-04-05' },
    { slug: 'openclaw-chronicles-02-local-first', date: '2026-04-02' },
    { slug: 'openclaw-chronicles-01-origin-story', date: '2026-03-29' },
    { slug: 'the-reflector-self-critique', date: '2026-03-28' },
    { slug: 'surviving-void-ephemeral-persistence', date: '2026-03-26' },
    { slug: 'sst-ion-coder-loop', date: '2026-03-24' },
    { slug: 'cdk-monorepo-mastery', date: '2026-03-22' },
    { slug: 'omni-channel-ai-gateway', date: '2026-03-21' },
    { slug: 'bridge-pattern-ephemeral-persistent', date: '2026-03-20' },
    { slug: 'ironclad-autonomy-safety-vpc', date: '2026-03-18' },
    { slug: 'eventbridge-the-neural-spine', date: '2026-03-14' },
    { slug: 'death-of-the-transient-agent', date: '2026-03-13' },
    { slug: 'one-dollar-ai-agent', date: '2026-03-12' },
  ];

  const routes = ['', '/blog', '/pricing', '/evolution'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...routes, ...blogRoutes];
}
