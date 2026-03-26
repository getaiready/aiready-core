import { Metadata } from 'next';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
  title: 'Blog | ClawMore - Agentic Insights & Infrastructure Evolution',
  description:
    'Deep dives into autonomous agentic systems, infrastructure evolution, and the future of agentic AWS operations at ClawMore.',
  openGraph: {
    title: 'ClawMore Blog - Agentic Insights & Infrastructure Evolution',
    description:
      'Deep dives into autonomous agentic systems, infrastructure evolution, and the future of agentic AWS operations.',
    url: 'https://clawmore.ai/blog',
    images: [
      {
        url: '/og-blog.png',
        width: 1200,
        height: 630,
        alt: 'ClawMore Blog - Agentic Insights',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClawMore Blog - Agentic Insights & Infrastructure Evolution',
    description:
      'Deep dives into autonomous agentic systems, infrastructure evolution, and the future of agentic AWS operations.',
    creator: '@clawmore',
    images: ['/og-blog.png'],
  },
  alternates: {
    canonical: 'https://clawmore.ai/blog',
  },
};

export default function BlogPage() {
  const apiUrl = process.env.LEAD_API_URL || '';
  return <BlogClient apiUrl={apiUrl} />;
}
