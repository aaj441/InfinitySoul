/**
 * Insurance Line Card
 *
 * Card component displaying information about a specific insurance line,
 * with features, lead magnet, and CTA buttons.
 */

import React from 'react';
import { motion } from 'framer-motion';

interface InsuranceLineCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  leadMagnet: string;
  highlight?: boolean;
  onLearnMore: () => void;
  onGetQuote: () => void;
}

export function InsuranceLineCard({
  title,
  description,
  icon,
  features,
  leadMagnet,
  highlight = false,
  onLearnMore,
  onGetQuote,
}: InsuranceLineCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`relative p-6 rounded-xl border transition-all h-full flex flex-col ${
        highlight
          ? 'bg-gradient-to-br from-emerald-900/50 to-slate-800 border-emerald-500/30'
          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
      }`}
    >
      {highlight && (
        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg rounded-tr-lg">
          Our Specialty
        </div>
      )}

      <div className="text-4xl mb-4">{icon}</div>

      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>

      <p className="text-sm text-slate-400 mb-4">{description}</p>

      <ul className="space-y-2 mb-6 flex-grow">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      {/* Lead Magnet */}
      <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-amber-400 text-sm">🎁</span>
          <span className="text-xs text-amber-400 font-medium">Free Resource</span>
        </div>
        <p className="text-sm text-slate-300">{leadMagnet}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onLearnMore}
          className="flex-1 text-sm px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          Learn More
        </button>
        <button
          onClick={onGetQuote}
          className={`flex-1 text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
            highlight
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : 'bg-slate-600 hover:bg-slate-500 text-white'
          }`}
        >
          Get Quote
        </button>
      </div>
    </motion.div>
  );
}
