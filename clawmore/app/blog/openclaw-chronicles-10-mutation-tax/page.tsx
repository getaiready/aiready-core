'use client';

import Link from 'next/link';
import { Clock, Hash, ChevronRight, DollarSign, Zap } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Breadcrumbs from '../../../components/Breadcrumbs';
import JsonLd from '../../../components/JsonLd';
import SystemFlow from '../../../components/SystemFlow';

const ECON_NODES = [
  {
    id: 'value',
    data: { label: 'Co-Evolution', type: 'agent' },
    position: { x: 0, y: 0 },
  },
  {
    id: 'free',
    data: { label: 'Sync Back (Free)', type: 'event' },
    position: { x: 200, y: -50 },
  },
  {
    id: 'tax',
    data: { label: 'The Mutation Tax', type: 'bus' },
    position: { x: 200, y: 50 },
  },
  {
    id: 'diverge',
    data: { label: 'Private Divergence', type: 'agent' },
    position: { x: 400, y: 50 },
  },
];

const ECON_EDGES = [
  {
    id: 'e1',
    source: 'value',
    target: 'free',
    label: 'Contribute',
    animated: true,
    style: { stroke: '#10b981' },
  },
  {
    id: 'e2',
    source: 'value',
    target: 'tax',
    label: 'One-Way Sync',
    animated: true,
  },
  {
    id: 'e3',
    source: 'tax',
    target: 'diverge',
    label: 'Venture Out',
    animated: true,
  },
];

export default function BlogPost() {
  const BLOG_JSON_LD = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'The Mutation Tax: Sustainable AI Economics',
    description:
      'Co-evolution vs Divergence. Exploring the sustainable economic models that power self-improving AI infrastructure at ClawMore.',
    datePublished: '2026-04-28',
    author: {
      '@type': 'Person',
      name: 'Architect of Evolution',
    },
    image: '/blog-assets/openclaw-chronicles-10-mutation-tax.png',
    url: 'https://clawmore.ai/blog/openclaw-chronicles-10-mutation-tax',
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
                OPENCLAW_CHRONICLES // PART_10
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[9px]">
                <Hash className="w-3 h-3" />
                <span>HASH: mutationtax</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[9px]">
                <Clock className="w-3 h-3" />
                <span>07 MIN READ</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic leading-[1.1]">
              The Mutation Tax: <br />
              <span className="text-cyber-purple">Co-Evolution</span>
            </h1>

            <p className="text-xl text-zinc-200 font-light leading-relaxed italic">
              Contribution over Extraction. Why syncing back to the hub is free,
              while private divergence requires a tax to fund the commons.
            </p>

            <div className="mt-12 relative aspect-[21/9] w-full overflow-hidden border border-white/10 rounded-sm group">
              <img
                src="/blog-assets/openclaw-chronicles-10-mutation-tax.png"
                alt="AI Economics - Mutation Tax"
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
                  label: 'MUTATION TAX',
                  href: '/blog/openclaw-chronicles-10-mutation-tax',
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
                    The Extraction Crisis
                  </h2>
                  <p className="text-zinc-200 leading-relaxed text-lg">
                    Traditional open source suffers from the extraction problem:
                    thousands of entities take from the hub, but few contribute
                    back. For autonomous agents, this leads to context
                    fragmentation. When everyone diverges in private, the
                    collective intelligence of the system plateaus.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4">
                    <span className="text-cyber-purple font-mono text-sm">
                      02
                    </span>
                    Introducing the Mutation Tax
                  </h2>
                  <p className="text-zinc-200 leading-relaxed text-lg">
                    At ClawMore, we solved this with a simple rule:
                    **Co-Evolution is Free**. If you sync your mutations back to
                    the hub and evolve with the community, you pay nothing. You
                    contribute to the collective "brain" and benefit from the
                    contributions of others.
                  </p>
                  <p className="text-zinc-200 leading-relaxed text-lg mt-4">
                    The **Mutation Tax** only applies when you "venture out on
                    your own." If you require a one-way sync to maintain a
                    private, divergent infrastructure empire without
                    contributing back, you pay a small fee per mutation. This
                    tax funds the R&D required to keep the hub evolving.
                  </p>
                </section>

                <SystemFlow
                  nodes={ECON_NODES}
                  edges={ECON_EDGES}
                  height="350px"
                />

                <section>
                  <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4">
                    <span className="text-cyber-purple font-mono text-sm">
                      03
                    </span>
                    The Virtuous Cycle
                  </h2>
                  <p className="text-zinc-200 leading-relaxed text-lg mb-8">
                    This model creates a virtuous cycle. It incentivizes
                    transparency and collaboration (which makes the AI smarter)
                    while providing a sustainable revenue stream from those who
                    choose isolated, enterprise divergence.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
                    <div className="p-6 border border-white/5 bg-white/[0.02] rounded-sm">
                      <Zap className="w-6 h-6 text-cyber-green mb-4" />
                      <h4 className="font-bold mb-2 uppercase tracking-tight">
                        Free Co-Evolution
                      </h4>
                      <p className="text-sm text-zinc-400">
                        Sync back and evolve with the hub. No fees, just
                        collective intelligence and shared growth.
                      </p>
                    </div>
                    <div className="p-6 border border-white/5 bg-white/[0.02] rounded-sm">
                      <DollarSign className="w-6 h-6 text-cyber-purple mb-4" />
                      <h4 className="font-bold mb-2 uppercase tracking-tight">
                        Divergence Tax
                      </h4>
                      <p className="text-sm text-zinc-400">
                        Venturing out on a private path? A small tax on one-way
                        sync mutations funds the evolution of the commons.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4">
                    <span className="text-cyber-purple font-mono text-sm">
                      04
                    </span>
                    Scaling the Empire
                  </h2>
                  <p className="text-zinc-200 leading-relaxed text-lg">
                    Economic sustainability allows us to scale. But how do we
                    sync these mutations across thousands of accounts without
                    causing chaos? In our next entry, **Sync Architecture**,
                    we'll dive into the technical backbone that manages global
                    infrastructure evolution.
                  </p>
                </section>
              </div>

              {/* Series Navigation */}
              <div className="mt-24 pt-12 border-t border-white/5">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.4em] mb-8">
                  Up_Next_In_The_Chronicles
                </div>
                <Link
                  href="/blog/openclaw-chronicles-11-sync-architecture"
                  className="block group"
                >
                  <div className="glass-card p-8 flex items-center justify-between hover:border-cyber-purple/30 transition-all bg-white/[0.01]">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-sm bg-cyber-purple/10 flex items-center justify-center text-cyber-purple border border-cyber-purple/20">
                        <Share2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[9px] font-mono text-cyber-purple uppercase tracking-widest mb-1">
                          PART 11 // SYNC_ARCHITECTURE
                        </div>
                        <div className="text-2xl font-black italic group-hover:text-white transition-colors">
                          Sync Architecture: Scaling to a Managed Empire
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
import { Share2 } from 'lucide-react';
