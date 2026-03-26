import { Metadata } from 'next';
import { headers } from 'next/headers';
import ClawMoreClient from './ClawMoreClient';
import { getDictionary } from '../lib/get-dictionary';

export const metadata: Metadata = {
  title: 'ClawMore | Autonomous Infrastructure Evolution',
  description:
    "ClawMore: The world's first autonomous agentic system for AWS. Real-time infrastructure synthesis and self-healing.",
  openGraph: {
    title: 'ClawMore | Autonomous Infrastructure Evolution',
    description:
      "The world's first autonomous agentic system for AWS. Real-time infrastructure synthesis and self-healing.",
    url: 'https://clawmore.ai',
    siteName: 'ClawMore',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-home.png',
        width: 1200,
        height: 630,
        alt: 'ClawMore - Autonomous Infrastructure Evolution',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClawMore | Autonomous Infrastructure Evolution',
    description:
      "The world's first autonomous agentic system for AWS. Real-time infrastructure synthesis and self-healing.",
    creator: '@clawmore',
    images: ['/og-home.png'],
  },
  alternates: {
    canonical: 'https://clawmore.ai',
  },
};

export default async function ClawMorePage() {
  const headerList = await headers();
  const locale = headerList.get('X-NEXT-LOCALE') || 'en';
  const dictionary = await getDictionary(locale);
  // Use environment variable which SST correctly injects at runtime
  const apiUrl = process.env.LEAD_API_URL || '';

  return <ClawMoreClient apiUrl={apiUrl} dict={dictionary} />;
}
