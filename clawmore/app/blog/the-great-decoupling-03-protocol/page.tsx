'use client';

import { Clock, Hash, ChevronRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Breadcrumbs from '../../../components/Breadcrumbs';
import JsonLd from '../../../components/JsonLd';
import SystemFlow from '../../../components/SystemFlow';

const PROTOCOL_NODES = [
  {
    id: 'decoupled-logic',
    data: { label: 'Decoupled Logic', type: 'agent' },
    position: { x: 0, y: 0 },
  },
  {
    id: 'mcp-wrapper',
    data: { label: 'MCP Wrapper', type: 'bus' },
    position: { x: 200, y: 0 },
  },
  {
    id: 'agentic-access',
    data: { label: 'High-Speed Agentic Access', type: 'event' },
    position: { x: 450, y: 0 },
  },
];

const PROTOCOL_EDGES = [
  {
    id: 'e1',
    source: 'decoupled-logic',
    target: 'mcp-wrapper',
    label: 'Wrap',
    animated: true,
  },
  {
    id: 'e2',
    source: 'mcp-wrapper',
    target: 'agentic-access',
    label: 'Expose',
    animated: true,
  },
];

export default function BlogPost() {
  const BLOG_JSON_LD = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'The Great Decoupling: Part 3 - The Agentic Protocol',
    description:
      'The final bridge. How to wrap your decoupled modules in a universal protocol for maximum agentic leverage.',
    datePublished: '2026-03-26',
    author: {
      '@type': 'Person',
      name: 'The Decoupling Architect',
    },
    image: '/blog-assets/the-great-decoupling-03-protocol.png',
    url: 'https://clawmore.ai/blog/the-great-decoupling-03-protocol',
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
                GREAT_DECOUPLING // PART_03
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[9px]">
                <Hash className="w-3 h-3" />
                <span>HASH: protocol</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[9px]">
                <Clock className="w-3 h-3" />
                <span>08 MIN READ</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic leading-[1.1]">
              The Agentic Protocol: <br />
              <span className="text-cyber-purple">The Final Bridge</span>
            </h1>

            <p className="text-xl text-zinc-200 font-light leading-relaxed italic">
              Code is no longer just for humans. It&apos;s a capability and
              high-speed API for your autonomous workforce.
            </p>

            <div className="mt-12 relative aspect-[21/9] w-full overflow-hidden border border-white/10 rounded-sm group font-mono flex items-center justify-center bg-zinc-900/50">
              <div className="text-zinc-600 uppercase tracking-[0.5em] text-[10px]">
                [ VISUAL_ASSET_READY ]
              </div>
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
                  label: 'THE AGENTIC PROTOCOL',
                  href: '/blog/the-great-decoupling-03-protocol',
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
                    Beyond the Function Call
                  </h2>
                  <p className="text-zinc-200 leading-relaxed text-lg">
                    In{' '}
                    <Link
                      href="/blog/the-great-decoupling-02-first-cut"
                      className="text-cyber-purple hover:underline"
                    >
                      Part 2
                    </Link>
                    , we extracted our core logic. But giving an AI agent 100
                    standalone files is just as confusing as giving it one
                    10,000-line God File. The agent needs to know <em>how</em>{' '}
                    to use the tools without expensive, error-prone prompt
                    injection.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4">
                    <span className="text-cyber-purple font-mono text-sm">
                      02
                    </span>
                    The MCP Inversion
                  </h2>
                  <p className="text-zinc-200 leading-relaxed text-lg">
                    We wrap our decoupled modules in the **Model Context
                    Protocol (MCP)**. This creates a standard bridge. The agent
                    doesn't &quot;read&quot; the code to guess what it does; it
                    queries the MCP server to understand the capabilities,
                    limits, and schemas of each module.
                  </p>
                </section>

                <SystemFlow
                  nodes={PROTOCOL_NODES}
                  edges={PROTOCOL_EDGES}
                  height="350px"
                />

                <section>
                  <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4">
                    <span className="text-cyber-purple font-mono text-sm">
                      03
                    </span>
                    Agentic Governance
                  </h2>
                  <p className="text-zinc-200 leading-relaxed text-lg">
                    By using **ClawMore** to host these MCP servers, we gain
                    governance. We can see exactly which agent called which
                    tool, what data it passed, and how much compute it consumed.
                    Decoupling isn't just about code organization; it's about
                    **Security** and **Auditability**.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4">
                    <span className="text-cyber-purple font-mono text-sm">
                      04
                    </span>
                    The Future is Protocol-First
                  </h2>
                  <p className="text-zinc-200 leading-relaxed text-lg">
                    The &quot;Great Decoupling&quot; is complete. Your monolith
                    is now a fleet of high-performance micro-capabilities. Your
                    agents are no longer guessing; they are orchestrating. This
                    is the new standard of engineering in the age of Universal
                    Intelligence.
                  </p>
                </section>
              </div>

              {/* Series Navigation placeholder */}
              <div className="mt-24 pt-12 border-t border-white/5">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.4em] mb-8">
                  COMPLETED_SERIES // THE_GREAT_DECOUPLING
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/blog/the-great-decoupling-01-audit"
                    className="glass-card p-6 block hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="text-[8px] font-mono text-zinc-500 mb-2">
                      PART 01
                    </div>
                    <div className="font-bold underline italic text-sm">
                      Auditing the Monolith
                    </div>
                  </Link>
                  <Link
                    href="/blog/the-great-decoupling-02-first-cut"
                    className="glass-card p-6 block hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="text-[8px] font-mono text-zinc-500 mb-2">
                      PART 02
                    </div>
                    <div className="font-bold underline italic text-sm">
                      The First Cut
                    </div>
                  </Link>
                </div>

                <div className="mt-16 pt-12 border-t border-white/5">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.4em] mb-8">
                    NEXT_SERIES // THE_OPENCLAW_CHRONICLES
                  </div>
                  <Link
                    href="/blog/openclaw-chronicles-01-origin-story"
                    className="block group"
                  >
                    <div className="glass-card p-8 flex items-center justify-between hover:border-cyber-purple/30 transition-all bg-white/[0.01]">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-sm bg-cyber-purple/10 flex items-center justify-center text-cyber-purple border border-cyber-purple/20">
                          <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-[9px] font-mono text-cyber-purple uppercase tracking-widest mb-1">
                            NEW SERIES // CHRONICLES
                          </div>
                          <div className="text-2xl font-black italic group-hover:text-white transition-colors">
                            The Origin Story: From Clawdbot to 250k Stars
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-zinc-700 group-hover:text-cyber-purple group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </div>
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
