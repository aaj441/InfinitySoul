/**
 * Ethical Use Policy for InfinitySoul
 * ===================================
 *
 * Enforces ethical constraints on data usage and risk operations.
 * Ensures compliance with student data ethics in higher education.
 * Implements fail-safe defaults: disallowed by default, explicit whitelist for allowed uses.
 *
 * References:
 * - EDUCAUSE: Setting the Table - Responsible Use of Student Data (2018)
 * - York University: Principles for Ethical Use of Student Data
 * - Ithaka S+R: Applications of Student Data in Higher Education
 *
 * @module ethics/EthicalUsePolicy
 */

import { Logger, createLogger } from '../logger';
import { EthicsViolationError } from '../errors';

/**
 * Ethical use case definitions
 */
export enum AllowedUseCase {
  // Core operations
  RISK_DISTRIBUTION_INITIALIZATION = 'risk_distribution_initialization',
  RISK_INGESTION = 'risk_ingestion',
  RISK_ASSESSMENT = 'risk_assessment',
  RISK_DISTRIBUTION = 'risk_distribution',

  // Data operations
  DATA_COLLATERAL_REGISTRATION = 'data_collateral_registration',
  DATA_PLEDGING = 'data_pledging',

  // System operations
  SYSTEM_REPORTING = 'system_reporting',
  MONITORING = 'monitoring',
}

/**
 * Disallowed use cases (fail-safe list)
 */
const DISALLOWED_USES = {
  // Student data should NOT be used for punitive pricing
  PUNITIVE_PRICING: 'punitive_pricing',
  // Student data should NOT be used for disciplinary decisions
  DISCIPLINARY_DECISIONS: 'disciplinary_decisions',
  // Student data should NOT be used as demographic proxies for discrimination
  DEMOGRAPHIC_PROXIES: 'demographic_proxies',
  // Student data should NOT be used for unauthorized marketing
  UNAUTHORIZED_MARKETING: 'unauthorized_marketing',
  // Student data should NOT be sold without explicit consent
  UNAUTHORIZED_SALE: 'unauthorized_sale',
};

/**
 * Context-based restrictions
 */
interface ContextRestrictions {
  [key: string]: string[]; // context -> list of disallowed purposes
}

const CONTEXT_RESTRICTIONS: ContextRestrictions = {
  // Sensitive categories have stricter rules
  'behavioral_data': [DISALLOWED_USES.PUNITIVE_PRICING, DISALLOWED_USES.DISCIPLINARY_DECISIONS],
  'psychological_profile': [DISALLOWED_USES.DISCIPLINARY_DECISIONS],
  'financial_data': [DISALLOWED_USES.DEMOGRAPHIC_PROXIES],
  'demographic_data': [DISALLOWED_USES.DEMOGRAPHIC_PROXIES, DISALLOWED_USES.PUNITIVE_PRICING],
};

/**
 * Ethical Use Policy Checker
 * Implements principle: fail-safe defaults (deny by default, explicit whitelist)
 */
export class EthicalUsePolicy {
  private logger: Logger;
  private allowedCases: Set<AllowedUseCase>;
  private contextRestrictions: ContextRestrictions;

  constructor(logger?: Logger) {
    this.logger = logger || createLogger('EthicalUsePolicy');
    this.allowedCases = new Set(Object.values(AllowedUseCase));
    this.contextRestrictions = CONTEXT_RESTRICTIONS;
  }

  /**
   * Check if a use case is ethically permitted
   * Returns true only if use is explicitly allowed
   * Fails safe: returns false for any unrecognized use
   *
   * @param purpose - The intended purpose of data usage
   * @param context - Additional context (data type, category, user, etc.)
   * @param correlationId - For tracing
   * @returns true if use is permitted, false otherwise
   * @throws EthicsViolationError if use is explicitly disallowed
   */
  checkUseCase(options: {
    purpose: string;
    context?: string;
    correlationId?: string;
  }): boolean {
    const { purpose, context, correlationId } = options;

    this.logger.info('Ethics check requested', {
      purpose,
      context,
      correlationId,
    });

    // Check for explicit disallowed uses
    if (this.isExplicitlyDisallowed(purpose)) {
      this.logger.warn('Ethics violation: explicitly disallowed use', {
        purpose,
        context,
        correlationId,
      });
      throw new EthicsViolationError(
        `Use case "${purpose}" is explicitly prohibited`,
        correlationId,
        { purpose, context }
      );
    }

    // Check context-based restrictions
    if (context && this.contextRestrictions[context]) {
      const restrictions = this.contextRestrictions[context];
      if (restrictions.includes(purpose)) {
        this.logger.warn('Ethics violation: context-restricted use', {
          purpose,
          context,
          correlationId,
        });
        throw new EthicsViolationError(
          `Use case "${purpose}" not permitted for context "${context}"`,
          correlationId,
          { purpose, context }
        );
      }
    }

    // Fail-safe: check if purpose is in allowed list
    const isAllowed = this.allowedCases.has(purpose as AllowedUseCase);

    if (isAllowed) {
      this.logger.info('Ethics check passed', {
        purpose,
        context,
        correlationId,
      });
    } else {
      this.logger.warn('Ethics check failed: unrecognized use case', {
        purpose,
        context,
        correlationId,
      });
    }

    return isAllowed;
  }

  /**
   * Check if a use is explicitly disallowed (beyond allowed list)
   */
  private isExplicitlyDisallowed(purpose: string): boolean {
    return Object.values(DISALLOWED_USES).includes(purpose);
  }

  /**
   * Get allowed use cases for documentation/API
   */
  getAllowedUseCases(): string[] {
    return Array.from(this.allowedCases);
  }

  /**
   * Get disallowed use cases for documentation/API
   */
  getDisallowedUseCases(): string[] {
    return Object.values(DISALLOWED_USES);
  }

  /**
   * Get context restrictions
   */
  getContextRestrictions(): ContextRestrictions {
    return { ...this.contextRestrictions };
  }

  /**
   * Audit log for compliance
   */
  getAuditLog(): string {
    return `
Ethical Use Policy Audit
=======================
Generated: ${new Date().toISOString()}

ALLOWED USE CASES (Whitelist):
${this.getAllowedUseCases().map(u => `  - ${u}`).join('\n')}

DISALLOWED USE CASES (Blacklist):
${this.getDisallowedUseCases().map(u => `  - ${u}`).join('\n')}

CONTEXT-BASED RESTRICTIONS:
${Object.entries(this.contextRestrictions)
  .map(([ctx, restrictions]) => `  ${ctx}:\n${restrictions.map(r => `    - ${r}`).join('\n')}`)
  .join('\n')}

ETHICAL PRINCIPLES:
  1. Fail-safe defaults: Disallow by default, explicit whitelist for allowed uses
  2. No punitive pricing based on behavioral/student data
  3. No disciplinary decisions based solely on data analytics
  4. No demographic proxies for discrimination
  5. No unauthorized sale or sharing of student data
  6. Transparency: Explicit purpose declaration for all data uses
  7. Accountability: Audit trails for all data access and use
`;
  }
}

/**
 * Global ethics policy instance
 */
export const globalEthicsPolicy = new EthicalUsePolicy();

/**
 * Create a policy checker with custom logger
 */
export const createEthicsPolicy = (logger?: Logger): EthicalUsePolicy => {
  return new EthicalUsePolicy(logger);
};
