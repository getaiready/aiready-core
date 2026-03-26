'use client';

import { Clock, Hash, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Breadcrumbs from '../../../components/Breadcrumbs';
import JsonLd from '../../../components/JsonLd';
import SystemFlow from '../../../components/SystemFlow';

const DECOUPLE_NODES = [
  {
    id: 'tangle',
    data: { label: 'Tangled Logic (A-B-C-D)', type: 'agent' },
    position: { x: 0, y: 0 },
  },
  {
    id: 'cut',
    data: { label: 'The First Cut', type: 'bus' },
    position: { x: 200, y: 0 },
  },
  {
    id: 'clean-a',
    data: { label: 'Isolated Module A', type: 'event' },
    position: { x: 400, y: -50 },
  },
  {
    id: 'clean-b',
    data: { label: 'Isolated Module B', type: 'event' },
    position: { x: 400, y: 50 },
  },
];

const DECOUPLE_EDGES = [
  {
    id: 'e1',
    source: 'tangle',
    target: 'cut',
    label: 'Decouple',
    animated: true,
  },
  {
    id: 'e2',
    source: 'cut',
    target: 'clean-a',
    label: 'Export',
    animated: true,
  },
  {
    id: 'e3',
    source: 'cut',
    target: 'clean-b',
    label: 'Export',
    animated: true,
  },
];

export default function BlogPost() {
  const BLOG_JSON_LD = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'The Great Decoupling: Part 2 - The First Cut',
    description:
      'Moving from audit to action. How to safely decouple your first module for agentic discoverability.',
    datePublished: '2026-03-24',
    author: {
      '@type': 'Person',
      name: 'The Decoupling Architect',
    },
    image: '/blog-assets/the-great-decoupling-02-first-cut.png',
    url: 'https://clawmore.ai/blog/the-great-decoupling-02-first-cut',
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
                GREAT_DECOUPLING // PART_02
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[9px]">
                <Hash className="w-3 h-3" />
                <span>HASH: firstcut</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[9px]">
                <Clock className="w-3 h-3" />
                <span>07 MIN READ</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic leading-[1.1]">
              The First Cut: <br />
              <span className="text-cyber-purple">
                Flattening the Hierarchy
              </span>
            </h1>

            <p className="text-xl text-zinc-200 font-light leading-relaxed italic">
              Moving from audit to action. A surgical approach to decoupling
              your first technical debt cluster.
            </p>

            <div className="mt-12 relative aspect-[21/9] w-full overflow-hidden border border-white/10 rounded-sm group">
              <img
                src="/blog-assets/the-great-decoupling-02-first-cut.png"
                alt="The First Cut"
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
                  label: 'THE FIRST CUT',
                  href: '/blog/the-great-decoupling-02-first-cut',
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
                    The Rule of Three Jumps
                  </h2>
                  <p className="text-zinc-200 leading-relaxed text-lg">
                    In{' '}
                    <Link
                      href="/blog/the-great-decoupling-01-audit"
                      className="text-cyber-purple hover:underline"
                    >
                      Part 1
                    </Link>
                    , we identified our context clusters. Now, we apply the
                    Surgical Process. Our goal is to reduce the &quot;Rule of
                    Three Jumps.&quot; If an agent has to jump more than three
                    files deep to find the source of a logic branch, the
                    probability of failure increases by 40%.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4">
                    <span className="text-cyber-purple font-mono text-sm">
                      02
                    </span>
                    Isolating the Pure Utility
                  </h2>
                  <p className="text-zinc-200 leading-relaxed text-lg">
                    The &quot;First Cut&quot; should always be a pure utility
                    module. By extracting internal logic from a God File and
                    moving it to a standalone, documented utility, we give the
                    agent a **Deterministic Signal**.
                  </p>
                </section>

                <SystemFlow
                  nodes={DECOUPLE_NODES}
                  edges={DECOUPLE_EDGES}
                  height="350px"
                />

                <section>
                  <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4">
                    <span className="text-cyber-purple font-mono text-sm">
                      03
                    </span>
                    Zero-Shot Discoverability
                  </h2>
                  <p className="text-zinc-200 leading-relaxed text-lg">
                    We don't just move the code; we rename it. We use what we
                    call **GPS Naming**. instead of <code>utils.ts</code>, we
                    use
                    <code>payment-validation-v1.ts</code>. This allows the AI's
                    semantic search to find the correct file instantly, without
                    walking the import tree.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4">
                    <span className="text-cyber-purple font-mono text-sm">
                      04
                    </span>
                    What’s Next?
                  </h2>
                  <p className="text-zinc-200 leading-relaxed text-lg">
                    The hierarchy is flatter. The signals are clearer. In our
                    final entry, **The Agentic Protocol**, we&apos;ll show you
                    how to wrap these decoupled modules in an MCP interface to
                    give your agents direct, high-speed access to your core
                    business logic.
                  </p>
                </section>
              </div>

              {/* Series Navigation placeholder */}
              <div className="mt-24 pt-12 border-t border-white/5">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.4em] mb-8">
                  UP_NEXT_IN_THE_DECOUPLING
                </div>
                <Link
                  href="/blog/the-great-decoupling-03-protocol"
                  className="block group"
                >
                  <div className="glass-card p-8 flex items-center justify-between hover:border-cyber-purple/30 transition-all bg-white/[0.01]">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-sm bg-zinc-800 flex items-center justify-center text-zinc-500 border border-white/5 group-hover:border-cyber-purple/30 transition-colors">
                        <Zap className="w-6 h-6 group-hover:text-cyber-purple transition-colors" />
                      </div>
                      <div>
                        <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1 group-hover:text-cyber-purple transition-colors">
                          PART 03 // AGENTIC_PROTOCOL
                        </div>
                        <div className="text-2xl font-black italic group-hover:text-white transition-colors">
                          The Agentic Protocol: The Final Bridge
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
