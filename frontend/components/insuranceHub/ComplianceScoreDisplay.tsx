/**
 * Compliance Score Display
 *
 * Visual display of the Infinity8 compliance score with breakdown
 * by category (WCAG, Cyber, Regulatory).
 */

import React from 'react';
import { motion } from 'framer-motion';

interface ComplianceScoreDisplayProps {
  score: number;
  grade: string;
  wcagScore: number;
  cyberScore: number;
  regulatoryScore: number;
}

export function ComplianceScoreDisplay({
  score,
  grade,
  wcagScore,
  cyberScore,
  regulatoryScore,
}: ComplianceScoreDisplayProps) {
  const getGradeColor = (g: string) => {
    if (g === 'A+' || g === 'A') return 'text-emerald-400';
    if (g === 'B') return 'text-blue-400';
    if (g === 'C') return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'bg-emerald-500';
    if (s >= 60) return 'bg-blue-500';
    if (s >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
      {/* Main Score */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="relative inline-block"
        >
          {/* Circular progress background */}
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-700"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className="text-emerald-500"
              initial={{ strokeDasharray: '0 283' }}
              animate={{ strokeDasharray: `${(score / 1000) * 283} 283` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>

          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-4xl font-bold text-white">{score}</div>
              <div className="text-sm text-slate-400">/ 1000</div>
              <div className={`text-2xl font-bold mt-1 ${getGradeColor(grade)}`}>
                Grade: {grade}
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="mt-4">
          <h4 className="text-lg font-medium text-white">Infinity8 Score</h4>
          <p className="text-sm text-slate-400">Your digital compliance rating</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        <h5 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
          Score Breakdown
        </h5>

        {[
          { label: 'WCAG Accessibility', score: wcagScore, icon: '♿' },
          { label: 'Cyber Readiness', score: cyberScore, icon: '🔒' },
          { label: 'Regulatory Compliance', score: regulatoryScore, icon: '📋' },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm text-slate-300">{item.label}</span>
              </div>
              <span className="text-sm font-medium text-white">{item.score}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getScoreColor(item.score)} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${item.score}%` }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
      >
        <div className="flex items-start gap-3">
          <span className="text-emerald-400 text-lg">💡</span>
          <div>
            <div className="text-sm font-medium text-emerald-400 mb-1">
              Strong Compliance Posture
            </div>
            <p className="text-xs text-slate-400">
              Your score qualifies you for preferred insurance rates. We found a few
              optimization opportunities that could improve your position further.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
