'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function AnimatedStats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const stats = [
    {
      value: '15+',
      label: 'Frontier Models',
      color: 'from-blue-600 to-cyan-500',
    },
    {
      value: '92%',
      label: 'ROI Accuracy',
      color: 'from-purple-600 to-pink-500',
    },
    {
      value: '45%',
      label: 'Context Savings',
      color: 'from-orange-600 to-red-500',
    },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 1, y: 0 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, staggerChildren: 0.2 }}
      className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
    >
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 1, scale: 1 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: idx * 0.2, duration: 0.5 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl from-blue-500/50 to-purple-500/50 rounded-2xl" />
          <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-2xl">
            <motion.div
              initial={{ scale: 1 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{
                delay: idx * 0.2 + 0.3,
                type: 'spring',
                stiffness: 100,
              }}
              className={`text-5xl md:text-6xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-3`}
            >
              {stat.value}
            </motion.div>
            <div className="text-slate-600 font-medium">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
