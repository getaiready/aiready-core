'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import AgentPrompt from '../../components/AgentPrompt';
import { tools } from '../../components/docs/ToolData';
import DocsSidebar from '../../components/docs/DocsSidebar';
import GettingStarted from '../../components/docs/GettingStarted';
import DocsToolDetails from '../../components/docs/DocsToolDetails';
import DocsUnifiedCli from '../../components/docs/DocsUnifiedCli';
import {
  ScoringSection,
  MetricsSection,
} from '../../components/docs/DocsSections';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [selectedTool, setSelectedTool] = useState(tools[0]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Header />

      <div className="container mx-auto px-4 py-12 flex gap-8">
        <DocsSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        <main className="flex-1 max-w-4xl">
          <GettingStarted />

          {/* Use with AI Agent Section */}
          <section id="ai-agent" className="mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Use with AI Agent
              </span>
            </h2>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 mb-6">
              <p className="text-slate-700 mb-4">
                Prefer using AI agents like <strong>Cline</strong>,{' '}
                <strong>Cursor</strong>, or <strong>GitHub Copilot</strong>?
                Copy these ready-to-use prompts.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  🔍 Basic Scan
                </h3>
                <AgentPrompt variant="basic" />
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  📊 Detailed Analysis
                </h3>
                <AgentPrompt variant="detailed" />
              </div>
            </div>
          </section>

          {/* Tools Section */}
          <section id="tools" className="mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-8">Tools</h2>
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
                    selectedTool.id === tool.id
                      ? `bg-gradient-to-r ${tool.color} text-white shadow-lg`
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl">{tool.icon}</span>
                  <span className="font-semibold">{tool.name}</span>
                </button>
              ))}
            </div>
            <DocsToolDetails tool={selectedTool as any} />
          </section>

          <ScoringSection />
          <MetricsSection />
          <DocsUnifiedCli />

          <section id="contributing" className="mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-6">
              Contributing
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              AIReady is open source. We welcome contributions to our analysis
              tools and core methodology. Want to build a new metric for your
              team?
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/caopengau/aiready"
                className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
              >
                View on GitHub
              </a>
              <a
                href="https://github.com/caopengau/aiready/blob/main/packages/cli/docs/SPOKE_GUIDE.md"
                className="bg-white text-slate-900 border-2 border-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-lg"
              >
                Build New Metrics
              </a>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
