'use client';

import { motion } from 'framer-motion';
import ParallaxSection from './ParallaxSection';
import AnimatedStats from './AnimatedStats';

export function Benefits() {
  const items = [
    {
      icon: '🧠',
      title: 'Stop AI Hallucinations',
      desc: 'Improve AI signal clarity to prevent models from generating incorrect or risky code.',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      icon: '💰',
      title: 'Predictive ROI',
      desc: 'Quantify exactly how much technical debt is costing your team in AI efficiency.',
      color: 'from-purple-600 to-pink-600',
    },
    {
      icon: '🛰️',
      title: 'Agentic Navigation',
      desc: 'Ensure your codebase is structured so autonomous agents can work independently.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: '🔥',
      title: 'Cut Context Waste',
      desc: 'Stop burning tokens on redundant context. Optimize your repo for the 1M+ token era.',
      color: 'from-red-500 to-pink-600',
    },
  ];

  return (
    <section className="py-20 bg-white relative">
      <div className="container mx-auto px-4 relative">
        <ParallaxSection offset={10}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                Why{' '}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  AIReady
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Practical benefits that compound across your team and workflows.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="relative bg-white border-2 border-slate-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all"
                >
                  <div
                    className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center text-2xl shadow-lg bg-gradient-to-r ${item.color}`}
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Stats row at the bottom */}
            <div className="mt-12">
              <AnimatedStats />
            </div>
          </div>
        </ParallaxSection>
      </div>
    </section>
  );
}
