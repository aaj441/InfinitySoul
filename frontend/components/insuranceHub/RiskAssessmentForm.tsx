/**
 * Risk Assessment Form
 *
 * Multi-step form for collecting business information and running
 * a comprehensive insurance risk assessment.
 *
 * Steps:
 * 1. Basic Info (email, company, industry)
 * 2. Business Details (employees, revenue, operations)
 * 3. Current Coverage (existing policies)
 * 4. Website Audit (optional compliance scan)
 * 5. Results (personalized recommendations)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RiskAssessmentFormProps {
  onClose: () => void;
  onComplete: (result: unknown) => void;
}

type Step = 'basic' | 'business' | 'coverage' | 'audit' | 'results';

interface FormData {
  email: string;
  companyName: string;
  contactName: string;
  industry: string;
  employeeCount: string;
  annualRevenue: string;
  websiteUrl: string;
  operations: {
    hasRemoteWorkers: boolean;
    handlesCustomerData: boolean;
    acceptsCreditCards: boolean;
    hasContractors: boolean;
    operatesVehicles: boolean;
    ownsProperty: boolean;
  };
  currentCoverage: {
    generalLiability: boolean;
    cyber: boolean;
    workersComp: boolean;
    property: boolean;
    umbrella: boolean;
    eo: boolean;
  };
  runAudit: boolean;
}

const INDUSTRIES = [
  { value: 'technology', label: 'Technology / Software' },
  { value: 'construction', label: 'Construction' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'retail', label: 'Retail / E-commerce' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'hospitality', label: 'Hospitality / Restaurant' },
  { value: 'transportation', label: 'Transportation / Logistics' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'financial_services', label: 'Financial Services' },
  { value: 'education', label: 'Education' },
  { value: 'nonprofit', label: 'Nonprofit' },
  { value: 'other', label: 'Other' },
];

const EMPLOYEE_RANGES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

const REVENUE_RANGES = [
  { value: '<500K', label: 'Under $500K' },
  { value: '500K-2M', label: '$500K - $2M' },
  { value: '2M-10M', label: '$2M - $10M' },
  { value: '10M-50M', label: '$10M - $50M' },
  { value: '50M+', label: 'Over $50M' },
];

export function RiskAssessmentForm({ onClose, onComplete }: RiskAssessmentFormProps) {
  const [step, setStep] = useState<Step>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    companyName: '',
    contactName: '',
    industry: '',
    employeeCount: '',
    annualRevenue: '',
    websiteUrl: '',
    operations: {
      hasRemoteWorkers: false,
      handlesCustomerData: false,
      acceptsCreditCards: false,
      hasContractors: false,
      operatesVehicles: false,
      ownsProperty: false,
    },
    currentCoverage: {
      generalLiability: false,
      cyber: false,
      workersComp: false,
      property: false,
      umbrella: false,
      eo: false,
    },
    runAudit: true,
  });

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const updateOperations = (key: keyof FormData['operations'], value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      operations: { ...prev.operations, [key]: value },
    }));
  };

  const updateCoverage = (key: keyof FormData['currentCoverage'], value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      currentCoverage: { ...prev.currentCoverage, [key]: value },
    }));
  };

  const handleNext = () => {
    const steps: Step[] = ['basic', 'business', 'coverage', 'audit', 'results'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: Step[] = ['basic', 'business', 'coverage', 'audit', 'results'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setStep('results');
  };

  const getStepNumber = () => {
    const steps: Step[] = ['basic', 'business', 'coverage', 'audit', 'results'];
    return steps.indexOf(step) + 1;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Risk Assessment</h2>
            <p className="text-sm text-slate-400">Step {getStepNumber()} of 5</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-700">
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${(getStepNumber() / 5) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            {step === 'basic' && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">Let's get started</h3>
                  <p className="text-sm text-slate-400">Tell us a bit about yourself and your business.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => updateFormData({ contactName: e.target.value })}
                      className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Work Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                      className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="john@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => updateFormData({ companyName: e.target.value })}
                      className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Acme Inc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Industry
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => updateFormData({ industry: e.target.value })}
                      className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select your industry</option>
                      {INDUSTRIES.map((industry) => (
                        <option key={industry.value} value={industry.value}>
                          {industry.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'business' && (
              <motion.div
                key="business"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">Business Details</h3>
                  <p className="text-sm text-slate-400">Help us understand your business operations.</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Number of Employees
                      </label>
                      <select
                        value={formData.employeeCount}
                        onChange={(e) => updateFormData({ employeeCount: e.target.value })}
                        className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select range</option>
                        {EMPLOYEE_RANGES.map((range) => (
                          <option key={range.value} value={range.value}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Annual Revenue
                      </label>
                      <select
                        value={formData.annualRevenue}
                        onChange={(e) => updateFormData({ annualRevenue: e.target.value })}
                        className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select range</option>
                        {REVENUE_RANGES.map((range) => (
                          <option key={range.value} value={range.value}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Your Operations (select all that apply)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'hasRemoteWorkers', label: 'Remote workers' },
                        { key: 'handlesCustomerData', label: 'Handle customer data' },
                        { key: 'acceptsCreditCards', label: 'Accept credit cards' },
                        { key: 'hasContractors', label: 'Use contractors' },
                        { key: 'operatesVehicles', label: 'Operate vehicles' },
                        { key: 'ownsProperty', label: 'Own property' },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.operations[item.key as keyof FormData['operations']]}
                            onChange={(e) =>
                              updateOperations(item.key as keyof FormData['operations'], e.target.checked)
                            }
                            className="w-4 h-4 rounded border-slate-500 text-emerald-500 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-slate-300">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'coverage' && (
              <motion.div
                key="coverage"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">Current Coverage</h3>
                  <p className="text-sm text-slate-400">What insurance do you already have?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Select your current policies
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'generalLiability', label: 'General Liability', desc: 'Third-party claims' },
                      { key: 'cyber', label: 'Cyber Insurance', desc: 'Data breaches, ransomware' },
                      { key: 'workersComp', label: 'Workers Compensation', desc: 'Employee injuries' },
                      { key: 'property', label: 'Property Insurance', desc: 'Buildings, equipment' },
                      { key: 'umbrella', label: 'Umbrella / Excess', desc: 'Additional liability' },
                      { key: 'eo', label: 'Errors & Omissions', desc: 'Professional liability' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={formData.currentCoverage[item.key as keyof FormData['currentCoverage']]}
                            onChange={(e) =>
                              updateCoverage(item.key as keyof FormData['currentCoverage'], e.target.checked)
                            }
                            className="w-5 h-5 rounded border-slate-500 text-emerald-500 focus:ring-emerald-500"
                          />
                          <div>
                            <div className="text-sm font-medium text-white">{item.label}</div>
                            <div className="text-xs text-slate-400">{item.desc}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'audit' && (
              <motion.div
                key="audit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">Free Compliance Audit</h3>
                  <p className="text-sm text-slate-400">Get a free scan of your digital compliance.</p>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🎁</div>
                    <div>
                      <div className="font-medium text-emerald-400 mb-1">Included Free</div>
                      <p className="text-sm text-slate-300">
                        We'll scan your website for WCAG accessibility violations, security vulnerabilities,
                        and regulatory compliance gaps. This information helps us provide better recommendations
                        AND it's valuable even if you don't buy anything from us.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Website URL (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => updateFormData({ websiteUrl: e.target.value })}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://yourcompany.com"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your website URL to include a compliance audit in your assessment.
                  </p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.runAudit}
                    onChange={(e) => updateFormData({ runAudit: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-500 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-300">
                    Yes, include the free compliance audit
                  </span>
                </label>
              </motion.div>
            )}

            {step === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Assessment Complete!</h3>
                  <p className="text-slate-400">
                    We've analyzed your risk profile and prepared personalized recommendations.
                  </p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-6">
                  <div className="text-center mb-6">
                    <div className="text-sm text-slate-400 mb-1">Your Infinity8 Score</div>
                    <div className="text-5xl font-bold text-emerald-400">847</div>
                    <div className="text-lg text-white mt-1">Grade: A</div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-white">Top Recommendations:</h4>
                    <div className="space-y-2">
                      {[
                        { priority: 'High', text: 'Add Cyber Insurance ($3-5K/year)' },
                        { priority: 'Medium', text: 'Review Workers Comp class codes' },
                        { priority: 'Low', text: 'Consider umbrella coverage' },
                      ].map((rec, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-slate-600/50 rounded-lg"
                        >
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              rec.priority === 'High'
                                ? 'bg-red-500/20 text-red-400'
                                : rec.priority === 'Medium'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            {rec.priority}
                          </span>
                          <span className="text-sm text-slate-300">{rec.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-slate-300 mb-3">
                    A detailed report has been sent to <strong>{formData.email}</strong>
                  </p>
                  <button
                    onClick={() => onComplete(formData)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Get My Personalized Quotes
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step !== 'results' && (
          <div className="p-6 border-t border-slate-700 flex justify-between">
            {step !== 'basic' ? (
              <button
                onClick={handleBack}
                className="text-slate-400 hover:text-white transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step === 'audit' ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  'Get Results'
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Continue
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
