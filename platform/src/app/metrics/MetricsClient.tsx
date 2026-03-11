'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Script from 'next/script';
import { ChartIcon } from '@/components/Icons';
import PlatformShell from '@/components/PlatformShell';
import { Team, TeamMember } from '@/lib/db';
import { LANDING_BASE_URL, PLATFORM_BASE_URL } from '@/lib/seo-schema';
import { metrics } from './constants';
import { MetricCard } from './components/MetricCard';

interface Props {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  teams?: (TeamMember & { team: Team })[];
  overallScore?: number | null;
}

export default function MetricsClient({
  user,
  teams = [],
  overallScore,
}: Props) {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  const techArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'AI Readiness Methodology: The 9 Core Metrics',
    description:
      'Technical breakdown of how AIReady measures codebase AI-readiness across 9 key dimensions.',
    author: {
      '@type': 'Organization',
      name: 'AIReady',
      url: LANDING_BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'AIReady',
    },
    url: `${PLATFORM_BASE_URL}/metrics`,
  };

  return (
    <>
      <Script
        id="tech-article-schema-metrics"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleSchema) }}
      />
      <div className="py-20 px-4 relative">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="orb orb-blue w-96 h-96 -top-48 -left-48 opacity-20" />
          <div className="orb orb-purple w-96 h-96 bottom-0 right-0 opacity-20" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-cyan-900/30 text-cyan-300 text-sm font-medium rounded-full border border-cyan-500/30"
            >
              <ChartIcon className="w-4 h-4" />
              <span>AI Readiness Methodology</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-white mb-6"
            >
              Deep Dive: The{' '}
              <span className="gradient-text-animated">9 Metrics</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-400 max-w-3xl mx-auto"
            >
              Technical methodology, scoring thresholds, and refactoring
              playbooks for AI-first engineering.
            </motion.p>
          </div>

          <div className="space-y-6">
            {metrics.map((metric, index) => (
              <MetricCard
                key={metric.id}
                metric={metric}
                index={index}
                isExpanded={expandedMetric === metric.id}
                onToggle={() =>
                  setExpandedMetric(
                    expandedMetric === metric.id ? null : metric.id
                  )
                }
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-20 space-y-12"
          >
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-3xl p-10 md:p-16 text-center shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] -z-10 group-hover:bg-cyan-500/20 transition-all duration-700" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] -z-10 group-hover:bg-purple-500/20 transition-all duration-700" />

              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                Build New Metrics with Us
              </h2>
              <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
                Need to measure data engineering standards, pipeline quality, or
                security? Our Hub-and-Spoke architecture allows you to plug in
                your own tools.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a
                  href="https://github.com/caopengau/aiready/blob/main/packages/cli/docs/SPOKE_GUIDE.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary px-10 py-4 text-lg"
                >
                  Build New Metrics →
                </a>
                <a
                  href="https://github.com/caopengau/aiready"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-all font-medium flex items-center gap-2"
                >
                  View Repo on GitHub
                </a>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="text-slate-500 hover:text-white inline-flex items-center justify-center gap-2 transition-all"
            >
              <span>←</span> Back to Dashboard
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}
