'use client';

import { useState } from 'react';
import {
  Clock,
  Hash,
  Zap,
  Share2,
  TrendingUp,
  Fingerprint,
  Users,
} from 'lucide-react';
import Modal from '../../../components/Modal';
import LeadForm from '../../../components/LeadForm';
import Navbar from '../../../components/Navbar';
import Breadcrumbs from '../../../components/Breadcrumbs';
import JsonLd from '../../../components/JsonLd';
import Link from 'next/link';

export default function BlogPost() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const _openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const apiUrl = process.env.NEXT_PUBLIC_LEAD_API_URL || '';

  const BLOG_JSON_LD = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'The Harvester: How Your Wins Help Everyone',
    description:
      'The Eclawnomy is built on Collective Intelligence. How we use private innovation to fuel global evolution through the Harvester agent.',
    datePublished: '2026-04-02',
    author: {
      '@type': 'Person',
      name: 'Minimalist Architect',
    },
    image: '/blog-assets/harvester-collective.png',
    url: '/blog/harvester-collective-intelligence',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-cyber-purple/30 selection:text-cyber-purple font-sans">
      <JsonLd data={BLOG_JSON_LD} />
      <Navbar variant="post" />

      <header className="py-24 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(20,184,166,0.05)_0%,_transparent_70%)] opacity-30" />

        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="text-teal-500 font-mono text-[9px] uppercase tracking-[0.4em] font-black border border-teal-500/20 px-2 py-1 bg-teal-500/5">
                HUB_SYNC
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[9px]">
                <Hash className="w-3 h-3" />
                <span>HASH: collective-wins</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[9px]">
                <Clock className="w-3 h-3" />
                <span>06 MIN READ</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic uppercase leading-[1.1]">
              The <span className="text-teal-500">Harvester</span>
            </h1>

            <p className="text-xl text-zinc-200 font-light leading-relaxed italic max-w-2xl mx-auto">
              Intelligence scales at the speed of the fastest innovator.
              Discover how we turn individual wins into collective evolution
              without compromising privacy.
            </p>

            <div className="mt-12 bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative group max-w-4xl mx-auto">
              <img
                src="/blog-assets/harvester-collective.png"
                alt="Harvester Collective Intelligence Cover"
                className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            </div>
          </div>
        </div>
      </header>

      <main className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Breadcrumbs
              items={[
                { label: 'BLOG', href: '/blog' },
                {
                  label: 'THE HARVESTER',
                  href: '/blog/harvester-collective-intelligence',
                },
              ]}
            />

            <article className="prose prose-invert prose-zinc max-w-none">
              <section className="mt-12">
                <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4 italic uppercase">
                  <span className="text-teal-500 font-mono text-sm not-italic border-b border-teal-500/30">
                    01
                  </span>
                  The Private Island Problem
                </h2>
                <p className="text-zinc-200 leading-relaxed text-lg">
                  Most AI implementations are private islands. A developer in
                  Tokyo solves a complex EventBridge race condition in their
                  Claw, but that knowledge stays trapped in their repository.
                  Meanwhile, a developer in London is currently hitting the
                  exact same wall. This is the{' '}
                  <strong>Knowledge Friction</strong> that slows the Eclawnomy
                  down.
                </p>
              </section>

              <section className="mt-16">
                <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4 italic uppercase">
                  <span className="text-teal-500 font-mono text-sm not-italic border-b border-teal-500/30">
                    02
                  </span>
                  Meet The Harvester
                </h2>
                <p className="text-zinc-200 leading-relaxed text-lg">
                  ClawMore introduces a specialized background agent:{' '}
                  <strong>The Harvester</strong>. Its job is not to copy your
                  code, but to extract the <em>pattern</em> of your success.
                </p>
                <div className="grid md:grid-cols-2 gap-6 my-10">
                  <div className="p-6 bg-zinc-900 border border-white/5 rounded-sm">
                    <Fingerprint className="w-6 h-6 text-teal-500 mb-4" />
                    <h4 className="font-black text-sm uppercase mb-2">
                      Anonymization
                    </h4>
                    <p className="text-xs text-zinc-400">
                      The Harvester strips all business-specific strings, PII,
                      and sensitive logic. It only looks for the &quot;Unit of
                      Innovation.&quot;
                    </p>
                  </div>
                  <div className="p-6 bg-zinc-900 border border-white/5 rounded-sm">
                    <Share2 className="w-6 h-6 text-teal-500 mb-4" />
                    <h4 className="font-black text-sm uppercase mb-2">
                      Pattern Distribution
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Validated patterns are turned into new &quot;Skills&quot;
                      and distributed to every Claw in the network.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mt-16">
                <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4 italic uppercase">
                  <span className="text-teal-500 font-mono text-sm not-italic border-b border-teal-500/30">
                    03
                  </span>
                  The Mutual Incentives
                </h2>
                <p className="text-zinc-200 leading-relaxed text-lg">
                  We reward contribution. If you enable the Harvester for your
                  repository:
                </p>
                <ul className="list-none space-y-4 my-8">
                  <li className="flex gap-4 items-center">
                    <TrendingUp className="w-5 h-5 text-teal-500" />
                    <span className="text-lg">
                      <strong>$0 Mutation Tax</strong>: All changes to your repo
                      are free.
                    </span>
                  </li>
                  <li className="flex gap-4 items-center">
                    <Zap className="w-5 h-5 text-teal-500" />
                    <span className="text-lg">
                      <strong>Priority Support</strong>: Direct line to the core
                      architects.
                    </span>
                  </li>
                </ul>
              </section>

              <div className="mt-20 p-10 bg-teal-500 text-black rounded-3xl text-center group">
                <Users className="w-12 h-12 mx-auto mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-3xl font-black mb-4 uppercase italic">
                  Join the Collective
                </h3>
                <p className="font-medium mb-8">
                  Stop solving problems that have already been solved.
                </p>
                <Link
                  href="https://clawmore.ai/"
                  className="inline-block py-3 px-8 bg-black text-white font-bold rounded-full"
                >
                  Sync Your Repo
                </Link>
              </div>
            </article>
          </div>
        </div>
      </main>

      <footer className="py-20 bg-black">
        <div className="container mx-auto px-4 text-center text-zinc-700 text-[10px] font-mono uppercase tracking-[0.5em]">
          TERMINAL_LOCKED // 2026 MUTATION_LOG
        </div>
      </footer>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <LeadForm type="waitlist" onSuccess={closeModal} apiUrl={apiUrl} />
      </Modal>
    </div>
  );
}
