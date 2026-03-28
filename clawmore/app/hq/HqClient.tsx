'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import {
  Shield,
  Users,
  Zap,
  TrendingUp,
  Activity,
  Server,
  Globe,
  ArrowUpRight,
  Database,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface HqProps {
  stats: {
    totalAccounts: number;
    activeMutations: number;
    totalRevenueCents: number;
    computeOverageCents: number;
    systemHealth: number;
  };
}

export default function HqClient({ stats }: HqProps) {
  const [isVending, setIsVending] = useState(false);
  const [vendingStatus, setVendingStatus] = useState<string | null>(null);

  const handleVendNode = async () => {
    setIsVending(true);
    setVendingStatus('Initiating Provisioning Loop...');

    try {
      const response = await fetch('/api/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: 'caopengau+testclient@gmail.com',
          userName: 'Test Client Corp',
          repoName: `serverlessclaw-instance-${Date.now().toString(36)}`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setVendingStatus(
          `SUCCESS: Node vended! Account: ${result.data.accountId}`
        );
      } else {
        setVendingStatus(`ERROR: ${result.error}`);
      }
    } catch (error: any) {
      setVendingStatus(`CRITICAL_FAILURE: ${error.message}`);
    } finally {
      setIsVending(false);
      setTimeout(() => setVendingStatus(null), 10000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyber-blue/30 selection:text-cyber-blue font-sans pb-20">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        {/* Status Toast - Fixed to top right */}
        {vendingStatus && (
          <div className="fixed top-24 right-8 z-50 bg-zinc-900 border border-cyber-blue/40 p-4 rounded-2xl shadow-[0_0_30px_rgba(0,224,255,0.2)] max-w-sm animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center gap-3">
              {isVending ? (
                <Loader2 className="w-4 h-4 text-cyber-blue animate-spin" />
              ) : (
                <Zap className="w-4 h-4 text-amber-500" />
              )}
              <p className="text-[10px] font-mono uppercase tracking-tighter">
                {vendingStatus}
              </p>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue text-[10px] font-bold uppercase tracking-widest">
              <Shield className="w-3 h-3" />
              Platform Headquarters
            </div>
            <h1 className="text-5xl font-black tracking-tighter italic">
              CLAW<span className="text-cyber-blue">HQ</span>
            </h1>
            <p className="text-zinc-500 font-medium max-w-xl">
              Global orchestrator for the managed serverless empire. Monitoring
              multi-tenant evolution loops and profit margins.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 p-4 rounded-3xl backdrop-blur-xl">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-zinc-500 font-mono uppercase">
                System Pulse
              </span>
              <span className="text-xl font-bold text-emerald-500">
                {stats.systemHealth}%
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Global KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              label: 'Managed Accounts',
              value: stats.totalAccounts,
              icon: Users,
              color: 'text-blue-500',
              bg: 'bg-blue-500/10',
            },
            {
              label: 'Successful Mutations',
              value: stats.activeMutations,
              icon: Zap,
              color: 'text-amber-500',
              bg: 'bg-amber-500/10',
            },
            {
              label: 'Total Revenue',
              value: `$${(stats.totalRevenueCents / 100).toLocaleString()}`,
              icon: TrendingUp,
              color: 'text-emerald-500',
              bg: 'bg-emerald-500/10',
            },
            {
              label: 'Compute Margins',
              value: '20%',
              icon: Server,
              color: 'text-purple-500',
              bg: 'bg-purple-500/10',
            },
          ].map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-all group"
            >
              <div
                className={`w-12 h-12 ${kpi.bg} ${kpi.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <kpi.icon className="w-6 h-6" />
              </div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">
                {kpi.label}
              </p>
              <h3 className="text-3xl font-black italic tracking-tighter">
                {kpi.value}
              </h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Fleet Monitoring */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <h2 className="text-lg font-bold flex items-center gap-2 italic">
                  <Globe className="w-5 h-5 text-cyber-blue" />
                  Active Tenant Fleet
                </h2>
                <button className="text-[10px] text-cyber-blue font-bold uppercase tracking-widest hover:underline">
                  View All Nodes
                </button>
              </div>
              <div className="divide-y divide-zinc-800">
                {[
                  {
                    name: 'Acme Corp',
                    id: 'acc_88x2',
                    region: 'us-east-1',
                    mutations: 42,
                    health: 'Optimized',
                  },
                  {
                    name: 'Global Tech',
                    id: 'acc_44v1',
                    region: 'ap-southeast-2',
                    mutations: 12,
                    health: 'Refactoring',
                  },
                  {
                    name: 'Stellar Labs',
                    id: 'acc_99z3',
                    region: 'eu-central-1',
                    mutations: 89,
                    health: 'Stable',
                  },
                ].map((tenant, i) => (
                  <div
                    key={i}
                    className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-zinc-400">
                        {tenant.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold group-hover:text-cyber-blue transition-colors">
                          {tenant.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono italic uppercase">
                          {tenant.id} • {tenant.region}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-tighter">
                          Mutations
                        </p>
                        <p className="text-xs font-bold text-zinc-300">
                          {tenant.mutations}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            tenant.health === 'Optimized'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : tenant.health === 'Refactoring'
                                ? 'bg-blue-500/10 text-blue-500'
                                : 'bg-zinc-500/10 text-zinc-500'
                          }`}
                        >
                          {tenant.health}
                        </span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-blue/5 rounded-full blur-3xl -mr-32 -mt-32" />
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 italic">
                <Shield className="w-5 h-5 text-cyber-blue" />
                Governance Logs
              </h2>
              <div className="space-y-4 font-mono text-[11px]">
                <p className="text-emerald-500/80">
                  <span className="text-zinc-600">[01:12:44]</span> SUCCESS: SCP
                  Attached to acc_88x2 (DenyExpensiveResources)
                </p>
                <p className="text-amber-500/80">
                  <span className="text-zinc-600">[00:45:12]</span> WARN:
                  Account acc_44v1 reached 80% compute inclusion
                </p>
                <p className="text-cyber-blue/80">
                  <span className="text-zinc-600">[23:30:05]</span> INFO:
                  Managed bootstrap initiated for Stellar Labs
                </p>
                <p className="text-zinc-500/80">
                  <span className="text-zinc-600">[22:15:10]</span> TRACE:
                  Syncing upstream agents to 12 endpoints
                </p>
              </div>
            </div>
          </div>

          {/* Profit & Growth Panel */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-gradient-to-br from-cyber-blue/20 to-purple-600/20 border border-cyber-blue/30 rounded-3xl p-8 backdrop-blur-md">
              <h3 className="text-sm font-bold uppercase tracking-widest text-cyber-blue mb-6 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Profit Distribution
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-400">
                      Mutation Tax ($1.00/ea)
                    </span>
                    <span className="font-bold text-white">$156.00</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyber-blue w-[65%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-400">
                      Compute Overages (20%)
                    </span>
                    <span className="font-bold text-white">$84.00</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[35%]" />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-[10px] text-zinc-500 font-mono uppercase mb-1">
                  Estimated MRR
                </p>
                <p className="text-3xl font-black italic tracking-tighter text-white">
                  $420.00
                </p>
              </div>
            </div>

            {/* Innovation Curation Panel */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <h3 className="text-sm font-bold mb-4 italic flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Innovation Curation
              </h3>
              <div className="space-y-3">
                <button className="w-full p-4 bg-zinc-800 hover:bg-amber-500/10 border border-zinc-700 hover:border-amber-500/30 rounded-2xl flex items-center justify-between transition-all group">
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] font-black uppercase text-white">
                      Pending Patterns
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">
                      Wait-list for promotion
                    </span>
                  </div>
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-500 rounded-lg text-[10px] font-black">
                    3 New
                  </span>
                </button>
                <p className="text-[9px] text-zinc-600 font-mono text-center uppercase tracking-widest pt-2">
                  Promotion triggers global sync
                </p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <h3 className="text-sm font-bold mb-4 italic">
                Platform Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleVendNode}
                  disabled={isVending}
                  className="p-4 bg-zinc-800 hover:bg-cyber-blue/10 border border-zinc-700 hover:border-cyber-blue/30 rounded-2xl flex flex-col items-center gap-2 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVending ? (
                    <Loader2 className="w-5 h-5 text-cyber-blue animate-spin" />
                  ) : (
                    <Users className="w-5 h-5 text-zinc-500 group-hover:text-cyber-blue" />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400 group-hover:text-white">
                    {isVending ? 'Vending...' : 'Vend Node'}
                  </span>
                </button>
                <button className="p-4 bg-zinc-800 hover:bg-emerald-500/10 border border-zinc-700 hover:border-emerald-500/30 rounded-2xl flex flex-col items-center gap-2 transition-all group">
                  <Shield className="w-5 h-5 text-zinc-500 group-hover:text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400 group-hover:text-white">
                    Sync SCPs
                  </span>
                </button>
                <button className="p-4 bg-zinc-800 hover:bg-amber-500/10 border border-zinc-700 hover:border-amber-500/30 rounded-2xl flex flex-col items-center gap-2 transition-all group">
                  <Zap className="w-5 h-5 text-zinc-500 group-hover:text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400 group-hover:text-white">
                    Push Agents
                  </span>
                </button>
                <button className="p-4 bg-zinc-800 hover:bg-purple-500/10 border border-zinc-700 hover:border-purple-500/30 rounded-2xl flex flex-col items-center gap-2 transition-all group">
                  <TrendingUp className="w-5 h-5 text-zinc-500 group-hover:text-purple-500" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400 group-hover:text-white">
                    Tax Audit
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
