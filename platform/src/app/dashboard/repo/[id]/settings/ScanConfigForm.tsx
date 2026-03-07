'use client';

import { useState, useMemo } from 'react';
import {
  SettingsIcon,
  SaveIcon,
  RefreshCwIcon,
  InfoIcon,
  ShieldIcon,
  TargetIcon,
  ChartIcon,
} from '@/components/Icons';
import type { AIReadyConfig } from '@aiready/core';
import { ToolName } from '@aiready/core/client';

interface Props {
  repoId: string;
  initialSettings: AIReadyConfig | null;
  onSave: (settings: AIReadyConfig | null) => Promise<void>;
}

export function ScanConfigForm({ repoId, initialSettings, onSave }: Props) {
  const defaultSettings: AIReadyConfig = {
    scan: {
      tools: [
        ToolName.PatternDetect,
        ToolName.ContextAnalyzer,
        ToolName.NamingConsistency,
        ToolName.ChangeAmplification,
        ToolName.AiSignalClarity,
        ToolName.AgentGrounding,
        ToolName.TestabilityIndex,
        ToolName.DocDrift,
        ToolName.DependencyHealth,
      ],
      exclude: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    },
    tools: {
      [ToolName.PatternDetect]: { minSimilarity: 0.8, minLines: 5 },
      [ToolName.ContextAnalyzer]: { maxDepth: 5, minCohesion: 0.6 },
      [ToolName.AiSignalClarity]: {
        checkMagicLiterals: true,
        checkBooleanTraps: true,
        checkAmbiguousNames: true,
        checkUndocumentedExports: true,
        checkImplicitSideEffects: true,
        checkDeepCallbacks: true,
      },
      [ToolName.AgentGrounding]: { maxRecommendedDepth: 4 },
      [ToolName.DocDrift]: { staleMonths: 6 },
    },
  };

  const [settings, setSettings] = useState<AIReadyConfig>(() => {
    if (!initialSettings) return defaultSettings;

    // Map aliases to canonical names in initialSettings
    const aliasMap: Record<string, string> = {
      patterns: ToolName.PatternDetect,
      duplicates: ToolName.PatternDetect,
      context: ToolName.ContextAnalyzer,
      fragmentation: ToolName.ContextAnalyzer,
      consistency: ToolName.NamingConsistency,
      'ai-signal': ToolName.AiSignalClarity,
      grounding: ToolName.AgentGrounding,
      testability: ToolName.TestabilityIndex,
      'deps-health': ToolName.DependencyHealth,
      'change-amp': ToolName.ChangeAmplification,
    };

    const normalizedTools = (initialSettings.scan?.tools || []).map(
      (t) => aliasMap[t] || t
    );

    return {
      ...defaultSettings,
      ...initialSettings,
      scan: {
        ...defaultSettings.scan,
        ...initialSettings.scan,
        tools:
          normalizedTools.length > 0
            ? normalizedTools
            : defaultSettings.scan!.tools,
      },
      tools: {
        ...defaultSettings.tools,
        ...initialSettings.tools,
      },
    };
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleToggleTool = (tool: string) => {
    const tools = settings.scan?.tools || [];
    const newTools = tools.includes(tool)
      ? tools.filter((t) => t !== tool)
      : [...tools, tool];

    setSettings({
      ...settings,
      scan: { ...settings.scan, tools: newTools },
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset to smart defaults?')) {
      await onSave(null);
      window.location.reload();
    }
  };

  const allTools = [
    {
      id: ToolName.PatternDetect,
      name: 'Pattern Detection',
      description: 'Finds semantic duplicates and logic clones.',
    },
    {
      id: ToolName.ContextAnalyzer,
      name: 'Context Analyzer',
      description: 'Analyzes dependency fragmentation and context costs.',
    },
    {
      id: ToolName.NamingConsistency,
      name: 'Naming Consistency',
      description: 'Enforces standard naming conventions and clarity.',
    },
    {
      id: ToolName.ChangeAmplification,
      name: 'Change Amplification',
      description: 'Detects code that causes excessive downstream changes.',
    },
    {
      id: ToolName.AiSignalClarity,
      name: 'AI Signal Clarity',
      description: 'Measures how easy it is for AI to reason about the code.',
    },
    {
      id: ToolName.AgentGrounding,
      name: 'Agent Grounding',
      description: 'Verifies if business concepts are correctly implemented.',
    },
    {
      id: ToolName.TestabilityIndex,
      name: 'Testability Index',
      description: 'Evaluates how easy it is to write unit tests for the code.',
    },
    {
      id: ToolName.DocDrift,
      name: 'Document Drift',
      description: 'Checks if documentation matches actual implementation.',
    },
    {
      id: ToolName.DependencyHealth,
      name: 'Dependency Health',
      description: 'Analyzes external dependency risks and bloat.',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="glass-card rounded-3xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
              <SettingsIcon className="w-5 h-5 text-cyan-500" />
            </div>
            <h2 className="text-xl font-bold">Scan Scope</h2>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <RefreshCwIcon className="w-3.5 h-3.5" />
            Reset to Defaults
          </button>
        </div>

        <div className="space-y-4">
          <div className="group relative">
            <label className="block text-sm font-bold text-slate-400 mb-2 flex items-center gap-2">
              Excluded Patterns (Glob)
              <InfoIcon className="w-4 h-4 text-slate-600 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 z-10 shadow-2xl">
                Comma-separated glob patterns. Files matching these will be
                ignored during analysis to save context and focus on your core
                logic.
              </div>
            </label>
            <textarea
              value={settings.scan?.exclude?.join(', ') || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  scan: {
                    ...settings.scan,
                    exclude: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                })
              }
              placeholder="**/node_modules/**, **/dist/**"
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-colors min-h-[100px] font-mono text-sm"
            />
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <ShieldIcon className="w-5 h-5 text-purple-500" />
          </div>
          <h2 className="text-xl font-bold">Standard Uplifting Spokes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => handleToggleTool(tool.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                settings.scan?.tools?.includes(tool.id)
                  ? 'bg-cyan-500/5 border-cyan-500/30'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">{tool.name}</span>
                <div
                  className={`w-4 h-4 rounded-full border ${
                    settings.scan?.tools?.includes(tool.id)
                      ? 'bg-cyan-500 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                      : 'border-slate-700'
                  }`}
                />
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-tight">
                {tool.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <TargetIcon className="w-5 h-5 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold">Fine-Tuning Thresholds</h2>
        </div>

        <div className="space-y-12">
          {/* Pattern Detection */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
              Pattern Detection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    Min Similarity
                    <InfoIcon className="w-4 h-4 text-slate-600 cursor-help" />
                  </span>
                  <span className="text-amber-500">
                    {Math.round(
                      (settings.tools?.[ToolName.PatternDetect]
                        ?.minSimilarity || 0.8) * 100
                    )}
                    %
                  </span>
                </label>
                <input
                  type="range"
                  min="0.4"
                  max="1.0"
                  step="0.05"
                  value={
                    settings.tools?.[ToolName.PatternDetect]?.minSimilarity ||
                    0.8
                  }
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tools: {
                        ...settings.tools,
                        [ToolName.PatternDetect]: {
                          ...settings.tools?.[ToolName.PatternDetect],
                          minSimilarity: parseFloat(e.target.value),
                        },
                      },
                    })
                  }
                  className="w-full accent-amber-500"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    Min Lines
                    <InfoIcon className="w-4 h-4 text-slate-600 cursor-help" />
                  </span>
                  <span className="text-amber-500">
                    {settings.tools?.[ToolName.PatternDetect]?.minLines || 5}{' '}
                    lines
                  </span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="50"
                  step="1"
                  value={
                    settings.tools?.[ToolName.PatternDetect]?.minLines || 5
                  }
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tools: {
                        ...settings.tools,
                        [ToolName.PatternDetect]: {
                          ...settings.tools?.[ToolName.PatternDetect],
                          minLines: parseInt(e.target.value),
                        },
                      },
                    })
                  }
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Context Analyzer */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
              Context & Architecture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    Max Context Depth
                    <InfoIcon className="w-4 h-4 text-slate-600 cursor-help" />
                  </span>
                  <span className="text-amber-500">
                    {settings.tools?.[ToolName.ContextAnalyzer]?.maxDepth || 5}{' '}
                    layers
                  </span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={
                    settings.tools?.[ToolName.ContextAnalyzer]?.maxDepth || 5
                  }
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tools: {
                        ...settings.tools,
                        [ToolName.ContextAnalyzer]: {
                          ...settings.tools?.[ToolName.ContextAnalyzer],
                          maxDepth: parseInt(e.target.value),
                        },
                      },
                    })
                  }
                  className="w-full accent-amber-500"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    Min Cohesion Score
                    <InfoIcon className="w-4 h-4 text-slate-600 cursor-help" />
                  </span>
                  <span className="text-amber-500">
                    {Math.round(
                      (settings.tools?.[ToolName.ContextAnalyzer]
                        ?.minCohesion || 0.6) * 100
                    )}
                    %
                  </span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={
                    settings.tools?.[ToolName.ContextAnalyzer]?.minCohesion ||
                    0.6
                  }
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tools: {
                        ...settings.tools,
                        [ToolName.ContextAnalyzer]: {
                          ...settings.tools?.[ToolName.ContextAnalyzer],
                          minCohesion: parseFloat(e.target.value),
                        },
                      },
                    })
                  }
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>

          {/* AI Signal Clarity */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
              AI Signal Clarity
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { id: 'checkMagicLiterals', label: 'Magic Literals' },
                { id: 'checkBooleanTraps', label: 'Boolean Traps' },
                { id: 'checkAmbiguousNames', label: 'Ambiguous Names' },
                {
                  id: 'checkUndocumentedExports',
                  label: 'Undocumented Exports',
                },
                { id: 'checkImplicitSideEffects', label: 'Side Effects' },
                { id: 'checkDeepCallbacks', label: 'Deep Callbacks' },
              ].map((check) => (
                <div
                  key={check.id}
                  onClick={() => {
                    const current =
                      settings.tools?.[ToolName.AiSignalClarity]?.[
                        check.id as keyof any
                      ] !== false;
                    setSettings({
                      ...settings,
                      tools: {
                        ...settings.tools,
                        [ToolName.AiSignalClarity]: {
                          ...settings.tools?.[ToolName.AiSignalClarity],
                          [check.id]: !current,
                        },
                      },
                    });
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    settings.tools?.[ToolName.AiSignalClarity]?.[
                      check.id as keyof any
                    ] !== false
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-500'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase">
                    {check.label}
                  </span>
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      settings.tools?.[ToolName.AiSignalClarity]?.[
                        check.id as keyof any
                      ] !== false
                        ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                        : 'bg-slate-800'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Agent Grounding & Documentation */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
              Agent Grounding & Docs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    Max Recommended Depth
                    <InfoIcon className="w-4 h-4 text-slate-600 cursor-help" />
                  </span>
                  <span className="text-amber-500">
                    {settings.tools?.[ToolName.AgentGrounding]
                      ?.maxRecommendedDepth || 4}{' '}
                    levels
                  </span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={
                    settings.tools?.[ToolName.AgentGrounding]
                      ?.maxRecommendedDepth || 4
                  }
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tools: {
                        ...settings.tools,
                        [ToolName.AgentGrounding]: {
                          ...settings.tools?.[ToolName.AgentGrounding],
                          maxRecommendedDepth: parseInt(e.target.value),
                        },
                      },
                    })
                  }
                  className="w-full accent-amber-500"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    Doc Drift Stale Months
                    <InfoIcon className="w-4 h-4 text-slate-600 cursor-help" />
                  </span>
                  <span className="text-amber-500">
                    {settings.tools?.[ToolName.DocDrift]?.staleMonths || 6}{' '}
                    months
                  </span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="24"
                  step="1"
                  value={settings.tools?.[ToolName.DocDrift]?.staleMonths || 6}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tools: {
                        ...settings.tools,
                        [ToolName.DocDrift]: {
                          ...settings.tools?.[ToolName.DocDrift],
                          staleMonths: parseInt(e.target.value),
                        },
                      },
                    })
                  }
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pb-10">
        <div className="flex items-center gap-4 text-slate-500 text-xs">
          <ChartIcon className="w-4 h-4" />
          <p>
            These settings will be applied to the next scan of this repository.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all shadow-xl ${
            success
              ? 'bg-green-500 text-white shadow-green-500/20'
              : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-cyan-500/20 active:scale-95'
          } disabled:opacity-50`}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : success ? (
            <>
              <RefreshCwIcon className="w-5 h-5" />
              Settings Updated
            </>
          ) : (
            <>
              <SaveIcon className="w-5 h-5" />
              Save Strategy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
