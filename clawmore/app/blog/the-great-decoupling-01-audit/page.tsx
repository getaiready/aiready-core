'use client';

import { Clock, Hash, ChevronRight, Scissors } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Breadcrumbs from '../../../components/Breadcrumbs';
import JsonLd from '../../../components/JsonLd';
import SystemFlow from '../../../components/SystemFlow';

const AUDIT_NODES = [
  {
    id: 'monolith',
    data: { label: 'The Corporate Monolith', type: 'agent' },
    position: { x: 0, y: 0 },
  },
  {
    id: 'aiready',
    data: { label: 'AIReady Scan', type: 'bus' },
    position: { x: 200, y: 0 },
  },
  {
    id: 'fragments',
    data: { label: 'Context Fragments', type: 'event' },
    position: { x: 400, y: -50 },
  },
  {
    id: 'roadmap',
    data: { label: 'Decoupling Roadmap', type: 'event' },
    position: { x: 400, y: 50 },
  },
];

const AUDIT_EDGES = [
  {
    id: 'e1',
    source: 'monolith',
    target: 'aiready',
    label: 'Analyze',
    animated: true,
  },
  {
    id: 'e2',
    source: 'aiready',
    target: 'fragments',
    label: 'Detect',
    animated: true,
  },
  {
    id: 'e3',
    source: 'aiready',
    target: 'roadmap',
    label: 'Plan',
    animated: true,
  },
];

export default function BlogPost() {
  const BLOG_JSON_LD = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'The Great Decoupling: Part 1 - Auditing the Monolith',
    description:
      'How to audit a legacy repository for agentic readiness. Identifying the "Wall" before you hit it.',
    datePublished: '2026-03-22',
    author: {
      '@type': 'Person',
      name: 'The Decoupling Architect',
    },
    image: '/blog-assets/the-great-decoupling-01-audit.png',
    url: 'https://clawmore.ai/blog/the-great-decoupling-01-audit',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-cyber-purple/30 selection:text-cyber-purple font-sans">
      <JsonLd data={BLOG_JSON_LD} />
      <Navbar variant="post" />

      {/* Article Header */}
      <header className="py-24 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(188,0,255,0.05)_0%,_transparent_70%)] opacity-30" />

        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="text-cyber-purple font-mono text-[9px] uppercase tracking-[0.4em] font-black border border-cyber-purple/20 px-2 py-1 bg-cyber-purple/5">
                GREAT_DECOUPLING // PART_01
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[9px]">
                <Hash className="w-3 h-3" />
                <span>HASH: audit</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[9px]">
                <Clock className="w-3 h-3" />
                <span>09 MIN READ</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic leading-[1.1]">
              Auditing the <br />
              <span className="text-cyber-purple">Corporate Monolith</span>
            </h1>

            <p className="text-xl text-zinc-200 font-light leading-relaxed italic">
              Identifying the &quot;Agentic Wall&quot; before your agents hit
              it. A step-by-step guide to repository forensics.
            </p>

            <div className="mt-12 relative aspect-[21/9] w-full overflow-hidden border border-white/10 rounded-sm group">
              <img
                src="/blog-assets/the-great-decoupling-01-audit.png"
                alt="Auditing the Monolith"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Breadcrumbs
              items={[
                { label: 'BLOG', href: '/blog' },
                {
                  label: 'AUDITING THE MONOLITH',
                  href: '/blog/the-great-decoupling-01-audit',
                },
              ]}
            />
            <article className="prose prose-invert prose-zinc max-w-none">
              <div className="space-y-12">
                <section>
                  <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4">
                    <span className="text-cyber-purple font-mono text-sm">
                      01
                    </span>
                    The Forensic Mindset
                  </h2>
                  <p className="text-zinc-200 leading-relaxed text-lg">
                    Before you can fix an &quot;Agentic Readiness&quot; problem,
                    you have to measure it. Corporate monoliths aren't just big;
                    they are tangled. A human developer navigates this tangle
                    using years of institutional knowledge. An AI agent,
                    however, navigates it using **imports**.
                  </p>
                  <p className="text-zinc-200 leading-relaxed text-lg mt-6">
                    In this series, we're going to dismantle a hypothetical (but
                    painfully real) monolith. Starting with the most important
                    step: **The Audit**.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4">
                    <span className="text-cyber-purple font-mono text-sm">
                      02
                    </span>
                    Mapping the Fragmentation
                  </h2>
                  <p className="text-zinc-200 leading-relaxed text-lg">
                    We use the <code>@aiready/context-analyzer</code> to perform
                    what we call &quot;Repository Forensics.&quot; We are
                    looking for **Context Clusters**—groups of files that are
                    logically linked but physically scattered.
                  </p>
                </section>

                <SystemFlow
                  nodes={AUDIT_NODES}
                  edges={AUDIT_EDGES}
                  height="350px"
                />

                <section>
                  <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4">
                    <span className="text-cyber-purple font-mono text-sm">
                      03
                    </span>
                    The Scorecard: Signal vs. Noise
                  </h2>
                  <p className="text-zinc-200 leading-relaxed text-lg">
                    Running <code>aiready scan --score</code> gives us our
                    baseline. A score of 40/100 means your agent is spending 60%
                    of its token budget on noise. We look for:
                  </p>
                  <ul className="list-disc pl-6 mb-8 space-y-3 text-zinc-200 text-lg">
                    <li>
                      **Circular Dependencies**: The death loop for LLM
                      reasoning.
                    </li>
                    <li>
                      **God Files**: 2000+ line files that blow the context
                      window.
                    </li>
                    <li>
                      **Deep Chains**: If a change in `A` requires reading `B,
                      C, D, E, F`.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4">
                    <span className="text-cyber-purple font-mono text-sm">
                      04
                    </span>
                    What’s Next?
                  </h2>
                  <p className="text-zinc-200 leading-relaxed text-lg">
                    The audit is the map. In our next entry, **The First Cut**,
                    we'll take the scalpel to our first context cluster and show
                    you how to flatten an import hierarchy without breaking the
                    build.
                  </p>
                </section>
              </div>

              {/* Series Navigation placeholder */}
              <div className="mt-24 pt-12 border-t border-white/5">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.4em] mb-8">
                  UP_NEXT_IN_THE_DECOUPLING
                </div>
                <Link
                  href="/blog/the-great-decoupling-02-first-cut"
                  className="block group"
                >
                  <div className="glass-card p-8 flex items-center justify-between hover:border-cyber-purple/30 transition-all bg-white/[0.01]">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-sm bg-zinc-800 flex items-center justify-center text-zinc-500 border border-white/5 group-hover:border-cyber-purple/30 transition-colors">
                        <Scissors className="w-6 h-6 group-hover:text-cyber-purple transition-colors" />
                      </div>
                      <div>
                        <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1 group-hover:text-cyber-purple transition-colors">
                          PART 02 // THE_FIRST_CUT
                        </div>
                        <div className="text-2xl font-black italic group-hover:text-white transition-colors">
                          The First Cut: Flattening the Hierarchy
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-zinc-700 group-hover:text-cyber-purple group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </div>
            </article>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-20 bg-black">
        <div className="container mx-auto px-4 text-center text-zinc-700 text-[10px] font-mono uppercase tracking-[0.5em]">
          TERMINAL_LOCKED // 2026 PERPETUAL_EVOLUTION
        </div>
      </footer>
    </div>
  );
}
