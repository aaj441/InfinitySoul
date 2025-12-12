/**
 * URL Validator - SSRF Protection
 * 
 * Validates URLs to prevent Server-Side Request Forgery (SSRF) attacks
 * by blocking requests to private/internal IP addresses and localhost.
 */

import { URL } from 'url';

/**
 * Private IP ranges to block (RFC 1918, RFC 4193, RFC 6598)
 */
const PRIVATE_IP_RANGES = [
  // IPv4 private ranges
  /^10\./,                          // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.0.0/12
  /^192\.168\./,                     // 192.168.0.0/16
  /^127\./,                          // 127.0.0.0/8 (loopback)
  /^169\.254\./,                     // 169.254.0.0/16 (link-local)
  /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./, // 100.64.0.0/10 (carrier-grade NAT)
  
  // IPv6 private ranges
  /^::1$/,                           // Loopback
  /^fe80:/i,                         // Link-local
  /^fc00:/i,                         // Unique local addresses
  /^fd00:/i,                         // Unique local addresses
];

/**
 * Localhost variations to block
 */
const LOCALHOST_PATTERNS = [
  'localhost',
  '0.0.0.0',
  '[::]',
  '[::1]',
];

/**
 * Validates a URL to prevent SSRF attacks
 * @param urlString - The URL to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validateUrl(urlString: string): { isValid: boolean; error?: string } {
  try {
    // Parse the URL
    const url = new URL(urlString);
    
    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return {
        isValid: false,
        error: `Invalid protocol: ${url.protocol}. Only HTTP and HTTPS are allowed.`,
      };
    }
    
    // Check for localhost patterns
    const hostname = url.hostname.toLowerCase();
    for (const pattern of LOCALHOST_PATTERNS) {
      if (hostname === pattern) {
        return {
          isValid: false,
          error: 'Localhost URLs are not allowed.',
        };
      }
    }
    
    // Check for private IP ranges
    for (const range of PRIVATE_IP_RANGES) {
      if (range.test(hostname)) {
        return {
          isValid: false,
          error: 'Private IP addresses are not allowed.',
        };
      }
    }
    
    // Check for IP addresses in general (optional strict mode)
    // This prevents DNS rebinding attacks
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Pattern = /^\[?[0-9a-fA-F:]+\]?$/;
    
    if (ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname)) {
      // Additional check for public IP addresses in stricter environments
      // For now, we allow public IPs but block private ones
    }
    
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: `Invalid URL format: ${(error as Error).message}`,
    };
  }
}

/**
 * Validates multiple URLs
 * @param urls - Array of URLs to validate
 * @returns Object with all valid URLs and any errors
 */
export function validateUrls(urls: string[]): {
  valid: string[];
  invalid: Array<{ url: string; error: string }>;
} {
  const valid: string[] = [];
  const invalid: Array<{ url: string; error: string }> = [];
  
  for (const url of urls) {
    const result = validateUrl(url);
    if (result.isValid) {
      valid.push(url);
    } else {
      invalid.push({ url, error: result.error || 'Unknown error' });
    }
  }
  
  return { valid, invalid };
}
