/**
 * CFAA (Computer Fraud and Abuse Act) Compliance Validator
 * 
 * Critical safeguard to prevent federal felony charges for unauthorized computer access.
 * 
 * Legal Risk: CFAA violations can result in:
 * - Federal felony charges
 * - Fines up to $250,000+
 * - Imprisonment up to 10 years
 * - Civil liability
 * 
 * Van Buren v. United States (2021) established that "exceeding authorized access"
 * means accessing information one is not entitled to access, not just misusing
 * authorized access.
 */

export interface CFAAComplianceResult {
  authorized: boolean;
  issues: CFAAIssue[];
  severity: 'critical' | 'high' | 'medium' | 'low' | 'pass';
  canProceedWithScan: boolean;
  recommendations: string[];
}

export interface CFAAIssue {
  type: 'robots-txt' | 'authentication' | 'rate-limit' | 'terms-of-service' | 'private-content' | 'paywall';
  severity: 'critical' | 'high' | 'medium';
  description: string;
  evidence?: string;
}

/**
 * Check robots.txt compliance
 * Respecting robots.txt is a key indicator of authorized access
 */
export async function checkRobotsTxt(domain: string): Promise<{
  allowed: boolean;
  issues: CFAAIssue[];
  robotsTxt?: string;
}> {
  const issues: CFAAIssue[] = [];
  
  try {
    const response = await fetch(`https://${domain}/robots.txt`);
    
    if (!response.ok) {
      // No robots.txt = generally allowed, but note it
      return { allowed: true, issues: [], robotsTxt: undefined };
    }
    
    const robotsTxt = await response.text();
    
    // Parse robots.txt for our user agent
    const lines = robotsTxt.split('\n');
    let inOurSection = false;
    let disallowed: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      
      // Check if this section applies to us
      if (trimmed.startsWith('user-agent:')) {
        const agent = trimmed.substring('user-agent:'.length).trim();
        inOurSection = agent === '*' || agent.includes('infinitysol');
      }
      
      // Collect disallowed paths
      if (inOurSection && trimmed.startsWith('disallow:')) {
        const path = trimmed.substring('disallow:'.length).trim();
        disallowed.push(path);
      }
    }
    
    // Check if root path is disallowed
    if (disallowed.includes('/')) {
      issues.push({
        type: 'robots-txt',
        severity: 'critical',
        description: 'robots.txt disallows all scanning. Site owner has explicitly forbidden automated access.',
        evidence: 'Disallow: /',
      });
      return { allowed: false, issues, robotsTxt };
    }
    
    // Check for common restricted paths
    const restrictedPaths = ['/admin', '/api', '/private', '/internal'];
    const blockedRestricted = disallowed.filter(path => 
      restrictedPaths.some(restricted => path.includes(restricted))
    );
    
    if (blockedRestricted.length > 0) {
      issues.push({
        type: 'robots-txt',
        severity: 'medium',
        description: `robots.txt blocks access to: ${blockedRestricted.join(', ')}. These paths should not be scanned.`,
        evidence: blockedRestricted.join(', '),
      });
    }
    
    return { allowed: issues.filter(i => i.severity === 'critical').length === 0, issues, robotsTxt };
    
  } catch (error) {
    // Network error = cannot verify compliance
    issues.push({
      type: 'robots-txt',
      severity: 'medium',
      description: 'Could not fetch robots.txt. Proceed with caution.',
      evidence: String(error),
    });
    return { allowed: true, issues }; // Assume allowed if robots.txt doesn't exist
  }
}

/**
 * Check for authentication/authorization requirements
 * Scanning password-protected content is a CFAA violation
 */
export async function checkAuthenticationRequired(domain: string): Promise<{
  authRequired: boolean;
  issues: CFAAIssue[];
}> {
  const issues: CFAAIssue[] = [];
  
  try {
    const response = await fetch(`https://${domain}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'InfinitySol-Scanner/1.0 (Accessibility Compliance Scanner)',
      },
    });
    
    // Check for authentication challenges
    if (response.status === 401) {
      issues.push({
        type: 'authentication',
        severity: 'critical',
        description: 'Site requires authentication (HTTP 401). Cannot scan without authorization.',
        evidence: 'HTTP 401 Unauthorized',
      });
      return { authRequired: true, issues };
    }
    
    if (response.status === 403) {
      issues.push({
        type: 'authentication',
        severity: 'critical',
        description: 'Access forbidden (HTTP 403). Site owner has explicitly denied access.',
        evidence: 'HTTP 403 Forbidden',
      });
      return { authRequired: true, issues };
    }
    
    // Check for login forms or paywall indicators
    const html = await response.text();
    const hasLoginForm = /<form[^>]*(?:login|signin|auth)/i.test(html);
    const hasPaywall = /paywall|subscribe|premium|member-only/i.test(html);
    
    if (hasLoginForm || hasPaywall) {
      issues.push({
        type: 'private-content',
        severity: 'high',
        description: hasPaywall 
          ? 'Paywall detected. Ensure scanning only public content, not premium/member-only areas.'
          : 'Login form detected. Ensure not scanning authenticated areas.',
        evidence: hasPaywall ? 'Paywall keywords found' : 'Login form present',
      });
    }
    
    return { authRequired: false, issues };
    
  } catch (error) {
    issues.push({
      type: 'authentication',
      severity: 'medium',
      description: 'Could not determine authentication requirements. Proceed with caution.',
      evidence: String(error),
    });
    return { authRequired: false, issues };
  }
}

/**
 * Check for rate limiting compliance
 * Aggressive scanning can be considered a CFAA violation if it bypasses rate limits
 */
export function createRateLimitedScanner(): {
  canScan: () => boolean;
  recordScan: () => void;
  getStats: () => { requestsInWindow: number; maxRequests: number };
} {
  const MAX_REQUESTS_PER_SECOND = 1; // Conservative: 1 request per second
  const WINDOW_MS = 1000;
  const requestTimestamps: number[] = [];
  
  return {
    canScan: (): boolean => {
      const now = Date.now();
      // Remove timestamps outside the window
      const recentRequests = requestTimestamps.filter(ts => now - ts < WINDOW_MS);
      return recentRequests.length < MAX_REQUESTS_PER_SECOND;
    },
    
    recordScan: (): void => {
      requestTimestamps.push(Date.now());
      // Keep only last 100 requests
      if (requestTimestamps.length > 100) {
        requestTimestamps.shift();
      }
    },
    
    getStats: () => {
      const now = Date.now();
      const recentRequests = requestTimestamps.filter(ts => now - ts < WINDOW_MS);
      return {
        requestsInWindow: recentRequests.length,
        maxRequests: MAX_REQUESTS_PER_SECOND,
      };
    },
  };
}

/**
 * Comprehensive CFAA compliance check before scanning
 * This must be run before any automated scanning
 */
export async function validateCFAACompliance(domain: string): Promise<CFAAComplianceResult> {
  const issues: CFAAIssue[] = [];
  const recommendations: string[] = [];
  
  // Check 1: robots.txt
  const robotsCheck = await checkRobotsTxt(domain);
  issues.push(...robotsCheck.issues);
  
  if (!robotsCheck.allowed) {
    recommendations.push('Do not scan this domain. robots.txt explicitly forbids access.');
    return {
      authorized: false,
      issues,
      severity: 'critical',
      canProceedWithScan: false,
      recommendations,
    };
  }
  
  // Check 2: Authentication requirements
  const authCheck = await checkAuthenticationRequired(domain);
  issues.push(...authCheck.issues);
  
  if (authCheck.authRequired) {
    recommendations.push('Do not scan this domain without explicit authorization from the site owner.');
    recommendations.push('Scanning password-protected content is a federal crime under CFAA.');
    return {
      authorized: false,
      issues,
      severity: 'critical',
      canProceedWithScan: false,
      recommendations,
    };
  }
  
  // Determine severity
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const highIssues = issues.filter(i => i.severity === 'high');
  
  let severity: 'critical' | 'high' | 'medium' | 'low' | 'pass' = 'pass';
  if (criticalIssues.length > 0) {
    severity = 'critical';
  } else if (highIssues.length > 0) {
    severity = 'high';
  } else if (issues.length > 0) {
    severity = 'medium';
  }
  
  // Add general recommendations
  if (severity === 'pass') {
    recommendations.push('CFAA compliance check passed. Safe to proceed with scanning.');
    recommendations.push('Maintain rate limiting: Maximum 1 request per second.');
    recommendations.push('Use transparent User-Agent: InfinitySol-Scanner/1.0');
    recommendations.push('Do not bypass security measures or authentication.');
  } else if (severity === 'high') {
    recommendations.push('HIGH risk issues detected. Review carefully before proceeding.');
    recommendations.push('Ensure scanning only public, non-authenticated content.');
    recommendations.push('Consider seeking explicit permission from site owner.');
  }
  
  const canProceed = severity !== 'critical';
  
  return {
    authorized: canProceed,
    issues,
    severity,
    canProceedWithScan: canProceed,
    recommendations,
  };
}

/**
 * Safe scanner configuration that ensures CFAA compliance
 */
export const CFAA_COMPLIANT_SCANNER_CONFIG = {
  userAgent: 'InfinitySol-Scanner/1.0 (Accessibility Compliance Scanner; +https://infinitysol.com/scanner)',
  maxRequestsPerSecond: 1,
  respectRobotsTxt: true,
  timeout: 30000, // 30 seconds
  followRedirects: true,
  maxRedirects: 5,
  
  // Headers that indicate we're a legitimate scanner, not a hacker
  headers: {
    'User-Agent': 'InfinitySol-Scanner/1.0 (Accessibility Compliance Scanner; +https://infinitysol.com/scanner)',
    'Accept': 'text/html,application/xhtml+xml,application/xml',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'DNT': '1', // Do Not Track
  },
  
  // What NOT to do (CFAA violations)
  prohibited: [
    'Do NOT spoof headers to impersonate users',
    'Do NOT bypass login screens or authentication',
    'Do NOT circumvent paywalls',
    'Do NOT ignore robots.txt directives',
    'Do NOT make aggressive requests that could be considered DDoS',
    'Do NOT access non-public API endpoints',
    'Do NOT attempt to bypass WAF (Web Application Firewall)',
  ],
};

export default {
  validateCFAACompliance,
  checkRobotsTxt,
  checkAuthenticationRequired,
  createRateLimitedScanner,
  CFAA_COMPLIANT_SCANNER_CONFIG,
};
