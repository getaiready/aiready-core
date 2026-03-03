'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import ParallaxSection from './ParallaxSection';
import AgentPrompt from './AgentPrompt';

export function CTA() {
  const [showAgent, setShowAgent] = useState(false);
  return (
    <section className="container mx-auto px-4 py-20">
      <ParallaxSection offset={10}>
        <motion.div
          id="get-started"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto relative scroll-mt-32 md:scroll-mt-40 lg:scroll-mt-48"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-3xl blur-2xl opacity-20 animate-pulse" />

          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-3xl p-1 shadow-2xl">
            <div className="bg-slate-900 rounded-[22px] p-12 text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-black text-white mb-4"
              >
                See Why AI Struggles with Your Code
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="text-slate-300 mb-6 text-xl"
              >
                Find AI confusion points in 5 minutes. Local. Safe. Free
                forever.
                <br />
                <span className="text-blue-300 text-base">
                  Need help? Request a personalized audit or consulting session.
                </span>
              </motion.p>

              {/* Toggle buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                viewport={{ once: true }}
                className="flex justify-center gap-2 mb-6"
              >
                <button
                  onClick={() => setShowAgent(false)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    !showAgent
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  💻 CLI Command
                </button>
                <button
                  onClick={() => setShowAgent(true)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    showAgent
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  🤖 AI Agent Prompt
                </button>
                <a
                  href="https://marketplace.visualstudio.com/items?itemName=pengcao.aiready"
                  target="_blank"
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-all bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30"
                >
                  🧩 VS Code Extension
                </a>
              </motion.div>

              {/* CLI Command */}
              {!showAgent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-800 rounded-2xl p-6 text-left mb-6 border border-slate-700"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <code className="text-green-400 font-mono text-lg">
                    npx @aiready/cli scan
                  </code>
                </motion.div>
              )}

              {/* Agent Prompt */}
              {showAgent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                >
                  <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                    <AgentPrompt variant="basic" />
                  </div>
                </motion.div>
              )}

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                className="text-sm text-slate-400"
              >
                <span className="text-green-400 font-bold">✓</span> Free forever
                ·<span className="text-green-400 font-bold"> ✓</span> Open
                source ·<span className="text-green-400 font-bold"> ✓</span> No
                credit card required
              </motion.p>
            </div>
          </div>
        </motion.div>
      </ParallaxSection>
    </section>
  );
}
