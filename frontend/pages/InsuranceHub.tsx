/**
 * Insurance Compliance Hub - Landing Page
 *
 * "Insurance That Doesn't Suck" - Compliance-first insurance for people who actually understand risk.
 *
 * This is the main entry point for the Insurance Hub website. It showcases:
 * - Value proposition (AI-powered compliance + insurance advisor)
 * - Risk assessment tool (5-min assessment)
 * - Insurance verticals (Life/Health, P&C, Cyber, Workers Comp, Umbrella/E&O)
 * - Lucy AI chat widget
 * - Trust indicators and compliance badges
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SoulButton, SoulCard, SoulNavigation } from '../components/soul';
import { LucyChatWidget } from '../components/insuranceHub/LucyChatWidget';
import { RiskAssessmentForm } from '../components/insuranceHub/RiskAssessmentForm';
import { InsuranceLineCard } from '../components/insuranceHub/InsuranceLineCard';
import { ComplianceScoreDisplay } from '../components/insuranceHub/ComplianceScoreDisplay';
import { TrustBadges } from '../components/insuranceHub/TrustBadges';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// Insurance line data
const INSURANCE_LINES = [
  {
    id: 'life-health',
    title: 'Life & Health',
    description: 'Protect your family and employees with comprehensive life and health coverage.',
    icon: '🏥',
    features: ['Term & Whole Life', 'Disability Insurance', 'Group Health'],
    leadMagnet: '5-Year Financial Planning Checklist',
  },
  {
    id: 'property-casualty',
    title: 'Property & Casualty',
    description: 'Shield your business assets from unexpected losses and liability claims.',
    icon: '🏢',
    features: ['Commercial Property', 'General Liability', 'Business Interruption'],
    leadMagnet: 'Property Inspection Checklist',
  },
  {
    id: 'cyber',
    title: 'Cyber Insurance',
    description: 'Protection against data breaches, ransomware, and digital threats.',
    icon: '🔐',
    features: ['Data Breach Response', 'Ransomware Coverage', 'WCAG Compliance'],
    leadMagnet: 'Free WCAG Compliance Audit',
    highlight: true,
  },
  {
    id: 'workers-comp',
    title: 'Workers Comp',
    description: 'Protect your employees and meet state requirements affordably.',
    icon: '👷',
    features: ['State Compliance', 'Mod Rate Optimization', 'Return-to-Work Programs'],
    leadMagnet: 'Payroll Compliance Calculator',
  },
  {
    id: 'umbrella-eo',
    title: 'Umbrella & E&O',
    description: 'Extra liability protection for when primary policies max out.',
    icon: '☂️',
    features: ['Excess Liability', 'Professional Liability', 'D&O Coverage'],
    leadMagnet: 'Risk Assessment for Service Businesses',
  },
];

// Stats for social proof
const STATS = [
  { value: '1000+', label: 'Compliance Audits Run' },
  { value: '98%', label: 'Client Retention' },
  { value: '$2.4M', label: 'Saved in Premiums' },
  { value: '4.9/5', label: 'Customer Rating' },
];

export default function InsuranceHubPage() {
  const [showAssessment, setShowAssessment] = useState(false);
  const [showLucy, setShowLucy] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <SoulNavigation
        items={[
          { label: 'Home', href: '#hero' },
          { label: 'Coverage', href: '#coverage' },
          { label: 'Compliance Audit', href: '#audit' },
          { label: 'About', href: '#about' },
          { label: 'Contact', href: '#contact' },
        ]}
        ctaLabel="Start Assessment"
        onCtaClick={() => setShowAssessment(true)}
      />

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-block px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
                AI-Powered Compliance + Insurance
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent"
            >
              Insurance That
              <br />
              Doesn't Suck
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8"
            >
              We audit your compliance risk with AI, then recommend the insurance that actually
              protects you. Most people are overinsured in the wrong areas and underinsured where it matters.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <SoulButton
                variant="primary"
                size="lg"
                onClick={() => setShowAssessment(true)}
              >
                Take the 5-Min Risk Assessment
              </SoulButton>
              <SoulButton
                variant="secondary"
                size="lg"
                onClick={() => setShowLucy(true)}
              >
                Chat with Lucy (AI Advisor)
              </SoulButton>
            </motion.div>

            <motion.p variants={fadeInUp} className="mt-4 text-sm text-slate-400">
              Free compliance audit included. No credit card required.
            </motion.p>
          </motion.div>
        </div>

        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6 border-y border-slate-700/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeInUp}>
              <SoulCard className="h-full p-6">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">Compliance Audit First</h3>
                <p className="text-slate-400">
                  Every quote starts with a free AI-powered compliance assessment. We identify
                  risks before recommending coverage.
                </p>
              </SoulCard>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <SoulCard className="h-full p-6">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2">Right-Sized Coverage</h3>
                <p className="text-slate-400">
                  Stop overpaying for coverage you don't need. We analyze your actual risk
                  profile and recommend only what protects you.
                </p>
              </SoulCard>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <SoulCard className="h-full p-6">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Transparency</h3>
                <p className="text-slate-400">
                  Lucy, our AI advisor, explains everything in plain English. No jargon,
                  no hidden gotchas, no sales pressure.
                </p>
              </SoulCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Coverage Lines */}
      <section id="coverage" className="py-20 px-6 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Coverage That Protects What Matters</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                From cyber threats to workplace safety, we cover all the bases.
                Click any line to learn more and get a personalized quote.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {INSURANCE_LINES.map((line) => (
                <motion.div key={line.id} variants={fadeInUp}>
                  <InsuranceLineCard
                    {...line}
                    onLearnMore={() => {/* Navigate to detail page */}}
                    onGetQuote={() => setShowAssessment(true)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Compliance Audit Section */}
      <section id="audit" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium mb-4">
                Free Compliance Audit
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                See Your Risk Before You Buy
              </h2>
              <p className="text-slate-400 mb-6">
                Our AI-powered audit scans your digital presence for:
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'WCAG 2.2 accessibility violations',
                  'Cyber security vulnerabilities',
                  'Regulatory compliance gaps',
                  'Litigation risk indicators',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-emerald-400">✓</span>
                    </span>
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
              <SoulButton variant="primary" onClick={() => setShowAssessment(true)}>
                Run Free Audit Now
              </SoulButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <ComplianceScoreDisplay
                score={847}
                grade="A"
                wcagScore={72}
                cyberScore={88}
                regulatoryScore={91}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-emerald-600/20 via-emerald-500/20 to-blue-600/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Stop Guessing About Insurance?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-slate-300 mb-8 text-lg">
              Take our 5-minute assessment and get a personalized coverage recommendation—plus
              a free compliance audit of your digital presence.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <SoulButton
                variant="primary"
                size="lg"
                onClick={() => setShowAssessment(true)}
              >
                Start Your Free Assessment
              </SoulButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-semibold mb-4">Trusted & Compliant</h2>
            <p className="text-slate-400">
              We practice what we preach. This website is 100% WCAG 2.2 AA compliant.
            </p>
          </motion.div>
          <TrustBadges />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-700/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Coverage</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Life & Health</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Property & Casualty</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cyber Insurance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Workers Comp</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Umbrella & E&O</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Insurance Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance Checklist</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Risk Calculator</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Accessibility</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Licenses</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-700/50 text-center text-sm text-slate-400">
            <p>
              © {new Date().getFullYear()} Insurance Compliance Hub. All rights reserved.
            </p>
            <p className="mt-2">
              Powered by Infinity Soul AI. This website is WCAG 2.2 AA compliant.
            </p>
          </div>
        </div>
      </footer>

      {/* Risk Assessment Modal */}
      {showAssessment && (
        <RiskAssessmentForm
          onClose={() => setShowAssessment(false)}
          onComplete={(result) => {
            console.log('Assessment completed:', result);
            setShowAssessment(false);
          }}
        />
      )}

      {/* Lucy Chat Widget */}
      <LucyChatWidget
        isOpen={showLucy}
        onToggle={() => setShowLucy(!showLucy)}
      />
    </div>
  );
}
