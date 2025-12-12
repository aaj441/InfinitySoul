/**
 * Trust Badges
 *
 * Displays compliance badges, certifications, and trust indicators
 * to build credibility with visitors.
 */

import React from 'react';
import { motion } from 'framer-motion';

export function TrustBadges() {
  const badges = [
    {
      id: 'wcag',
      title: 'WCAG 2.2 AA',
      subtitle: 'Compliant',
      icon: '♿',
      color: 'emerald',
    },
    {
      id: 'ssl',
      title: 'SSL Secured',
      subtitle: '256-bit encryption',
      icon: '🔒',
      color: 'blue',
    },
    {
      id: 'privacy',
      title: 'Privacy First',
      subtitle: 'GDPR & CCPA Ready',
      icon: '🛡️',
      color: 'purple',
    },
    {
      id: 'licensed',
      title: 'Licensed',
      subtitle: 'All 50 States',
      icon: '📜',
      color: 'amber',
    },
  ];

  const partners = [
    { name: 'Major Carrier 1', logo: 'MC1' },
    { name: 'Major Carrier 2', logo: 'MC2' },
    { name: 'Major Carrier 3', logo: 'MC3' },
    { name: 'Major Carrier 4', logo: 'MC4' },
    { name: 'Major Carrier 5', logo: 'MC5' },
  ];

  return (
    <div className="space-y-12">
      {/* Compliance Badges */}
      <div className="flex flex-wrap justify-center gap-6">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3"
          >
            <span className="text-2xl">{badge.icon}</span>
            <div>
              <div className="text-sm font-medium text-white">{badge.title}</div>
              <div className="text-xs text-slate-400">{badge.subtitle}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Partner Carriers */}
      <div>
        <p className="text-center text-sm text-slate-500 mb-6">
          Partnered with leading insurance carriers
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.5 }}
              whileHover={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="w-24 h-12 flex items-center justify-center rounded bg-slate-800/50 border border-slate-700/50"
            >
              <span className="text-slate-400 font-medium text-sm">{partner.logo}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Security Statement */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 text-xs text-slate-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Your data is encrypted and secure. We never share your information without permission.
        </div>
      </motion.div>
    </div>
  );
}
