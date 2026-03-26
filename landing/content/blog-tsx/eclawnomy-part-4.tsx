import meta from './eclawnomy-part-4.meta';
import React from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ShieldCheck,
  DollarSign,
  Repeat,
  Globe,
  Info,
} from 'lucide-react';

const Post = () => (
  <>
    <div className="my-8 max-w-4xl mx-auto">
      <img
        src="/clawmore-evolution.png"
        alt="Eclawnomy Part 4 - cover"
        className="w-full rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 focus:outline-none"
      />
    </div>

    <p className="text-xl font-medium text-indigo-300 italic mb-10">
      Managing a fleet of serverless agents, securing their AWS accounts, and
      ensuring they are always running the latest version of their
      &quot;intelligence&quot; is a full-time job. Most businesses don&apos;t
      want to be &quot;AI Operators.&quot; They want <strong>Results.</strong>
    </p>

    <h2 className="text-3xl font-black mt-16 mb-8 flex items-center gap-4 text-indigo-500">
      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
        <ShieldCheck className="w-6 h-6" />
      </div>
      Introducing ClawMore: The Evolutionary Hub
    </h2>

    <p>
      <Link
        href="https://clawmore.ai/"
        className="text-indigo-400 font-bold hover:underline"
      >
        ClawMore
      </Link>{' '}
      is the managed service that bridges the gap between Open Source philosophy
      and Enterprise Reliability. It operates on a{' '}
      <strong>Hub-and-Spoke</strong> architecture, specifically designed to
      lower the knowledge barrier.
    </p>

    <div className="space-y-12 my-12">
      <section className="bg-slate-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-slate-100 dark:border-zinc-800">
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <Repeat className="w-5 h-5 text-indigo-500" />
          1. Account Vending & Isolation
        </h3>
        <p className="text-slate-500 dark:text-zinc-400">
          Every ClawMore client gets their own, dedicated AWS account. We
          don&apos;t share infrastructure. We don&apos;t share data. Our
          &quot;Vending Machine&quot; programmatically creates an isolated
          sandbox where your agents can work without risk of cross-tenant
          leakage.
        </p>
      </section>

      <section className="bg-slate-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-slate-100 dark:border-zinc-800">
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-500" />
          2. The Mutation Tax ($1.00 per Win)
        </h3>
        <p className="text-slate-500 dark:text-zinc-400">
          We don&apos;t believe in &quot;Seat-based&quot; pricing. In the{' '}
          <strong>Eclawnomy</strong>, we use the <strong>Mutation Tax.</strong>
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-black rounded-xl border border-slate-100 dark:border-zinc-800 text-center">
            <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">
              Platform
            </div>
            <div className="text-2xl font-black italic">$29/mo</div>
          </div>
          <div className="p-4 bg-white dark:bg-black rounded-xl border border-slate-100 dark:border-zinc-800 text-center">
            <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">
              Mutation
            </div>
            <div className="text-2xl font-black italic text-green-500">
              $1.00
            </div>
          </div>
        </div>
        <p className="mt-6 text-sm italic">
          <Info className="w-4 h-4 inline mr-1 mb-1" /> If your agents
          don&apos;t improve your codebase (verified by goal completion), you
          don&apos;t pay.
        </p>
      </section>

      <section className="bg-slate-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-slate-100 dark:border-zinc-800">
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" />
          3. Co-evolution & The Harvester
        </h3>
        <p className="text-slate-500 dark:text-zinc-400">
          By allowing our &quot;Harvester&quot; agent to extract anonymous{' '}
          <strong>Innovation Patterns</strong> from your specific optimizations,
          you contribute to the collective intelligence of the Hub. In exchange,{' '}
          <strong>we waive the Mutation Tax.</strong>
        </p>
      </section>
    </div>

    <h2 className="text-3xl font-black mt-16 mb-8 text-center italic">
      The End of the &quot;IT Department&quot;
    </h2>

    <p className="text-center max-w-2xl mx-auto text-lg text-slate-400">
      For $29/mo, an SMB doesn&apos;t just get a tool. They get a managed,
      evolving, and self-improving node in a global intelligence network. The
      &quot;IT Department&quot; is no longer a cost center. It&apos;s a{' '}
      <strong>subscription to continuous evolution.</strong>
    </p>

    <div className="mt-16 bg-indigo-600 rounded-3xl p-10 text-center text-white relative overflow-hidden group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ffffff22_0%,_transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <h3 className="text-3xl font-black mb-6 italic tracking-tighter uppercase leading-none">
        Ready to start <br /> your first mutation?
      </h3>
      <Link
        href="https://clawmore.ai/"
        className="inline-block py-4 px-10 bg-white text-indigo-600 font-bold rounded-full hover:scale-105 transition-transform"
      >
        Get Started for Free
      </Link>
    </div>
  </>
);

export default Post;
