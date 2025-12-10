/**
 * Scout: Basic technical data collection
 * See: docs/STREET_CYBER_SCAN.md
 * 
 * Responsibility: Collect raw technical data about a domain
 * Does NOT: analyze, format, or persist data
 */

import { ScoutResult } from "./types";
import * as dns from "dns";
import { promisify } from "util";
import * as http from "http";
import * as https from "https";
import * as net from "net";

const dnsResolve4 = promisify(dns.resolve4);

/**
 * Run basic security checks on a domain
 * - DNS resolution
 * - HTTP/HTTPS reachability
 * - Security headers collection
 * - Basic port scan
 */
export async function runScout(domain: string): Promise<ScoutResult> {
  console.log(`[Scout] Starting scan for ${domain}`);
  
  const result: ScoutResult = {
    domain,
    httpReachable: false,
    httpsReachable: false,
    securityHeaders: {},
    openPorts: [],
    rawFindings: [],
    scannedAt: new Date(),
  };

  // DNS Resolution
  try {
    const addresses = await dnsResolve4(domain);
    if (addresses && addresses.length > 0) {
      result.resolvedIp = addresses[0];
      result.rawFindings.push(`DNS resolved to ${addresses[0]}`);
      console.log(`[Scout] DNS resolved: ${addresses[0]}`);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.rawFindings.push(`DNS resolution failed: ${errorMsg}`);
    console.error(`[Scout] DNS resolution failed:`, errorMsg);
  }

  // HTTP Reachability
  try {
    const httpReachable = await checkHttpReachability(domain, 'http');
    result.httpReachable = httpReachable;
    result.rawFindings.push(`HTTP reachable: ${httpReachable}`);
    console.log(`[Scout] HTTP reachable: ${httpReachable}`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.rawFindings.push(`HTTP check failed: ${errorMsg}`);
    console.error(`[Scout] HTTP check failed:`, errorMsg);
  }

  // HTTPS Reachability and Headers
  try {
    const httpsResult = await checkHttpsAndHeaders(domain);
    result.httpsReachable = httpsResult.reachable;
    result.securityHeaders = httpsResult.headers;
    result.rawFindings.push(`HTTPS reachable: ${httpsResult.reachable}`);
    console.log(`[Scout] HTTPS reachable: ${httpsResult.reachable}`);
    console.log(`[Scout] Collected ${Object.keys(httpsResult.headers).length} security headers`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.rawFindings.push(`HTTPS check failed: ${errorMsg}`);
    console.error(`[Scout] HTTPS check failed:`, errorMsg);
  }

  // Basic port scan (common ports only, non-intrusive)
  if (result.resolvedIp) {
    const commonPorts = [80, 443, 22, 21, 25, 3389, 3306, 5432, 27017];
    result.openPorts = await scanCommonPorts(result.resolvedIp, commonPorts);
    result.rawFindings.push(`Open ports found: ${result.openPorts.join(', ') || 'none'}`);
    console.log(`[Scout] Open ports: ${result.openPorts.join(', ') || 'none'}`);
  }

  console.log(`[Scout] Scan complete for ${domain}`);
  return result;
}

/**
 * Check if HTTP endpoint is reachable
 */
async function checkHttpReachability(domain: string, protocol: 'http' | 'https'): Promise<boolean> {
  return new Promise((resolve) => {
    const client = protocol === 'http' ? http : https;
    const options = {
      hostname: domain,
      port: protocol === 'http' ? 80 : 443,
      path: '/',
      method: 'HEAD',
      timeout: 5000,
      rejectUnauthorized: false, // Don't fail on self-signed certs
    };

    const req = client.request(options, (res) => {
      resolve(res.statusCode !== undefined && res.statusCode < 500);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

/**
 * Check HTTPS reachability and collect security headers
 */
async function checkHttpsAndHeaders(domain: string): Promise<{ reachable: boolean; headers: Record<string, string | undefined> }> {
  return new Promise((resolve) => {
    const options = {
      hostname: domain,
      port: 443,
      path: '/',
      method: 'HEAD',
      timeout: 5000,
      rejectUnauthorized: false, // Don't fail on self-signed certs
    };

    const req = https.request(options, (res) => {
      const securityHeaders: Record<string, string | undefined> = {
        'strict-transport-security': Array.isArray(res.headers['strict-transport-security']) 
          ? res.headers['strict-transport-security'][0] 
          : res.headers['strict-transport-security'],
        'x-frame-options': Array.isArray(res.headers['x-frame-options'])
          ? res.headers['x-frame-options'][0]
          : res.headers['x-frame-options'],
        'x-content-type-options': Array.isArray(res.headers['x-content-type-options'])
          ? res.headers['x-content-type-options'][0]
          : res.headers['x-content-type-options'],
        'x-xss-protection': Array.isArray(res.headers['x-xss-protection'])
          ? res.headers['x-xss-protection'][0]
          : res.headers['x-xss-protection'],
        'content-security-policy': Array.isArray(res.headers['content-security-policy'])
          ? res.headers['content-security-policy'][0]
          : res.headers['content-security-policy'],
        'referrer-policy': Array.isArray(res.headers['referrer-policy'])
          ? res.headers['referrer-policy'][0]
          : res.headers['referrer-policy'],
        'permissions-policy': Array.isArray(res.headers['permissions-policy'])
          ? res.headers['permissions-policy'][0]
          : res.headers['permissions-policy'],
      };

      resolve({
        reachable: res.statusCode !== undefined && res.statusCode < 500,
        headers: securityHeaders,
      });
    });

    req.on('error', () => {
      resolve({ reachable: false, headers: {} });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ reachable: false, headers: {} });
    });

    req.end();
  });
}

/**
 * Scan common ports (non-intrusive, quick check)
 */
async function scanCommonPorts(ip: string, ports: number[]): Promise<number[]> {
  const openPorts: number[] = [];
  const timeout = 2000; // 2 second timeout per port

  const checkPort = (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      
      socket.setTimeout(timeout);
      
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });

      socket.on('error', () => {
        resolve(false);
      });

      socket.connect(port, ip);
    });
  };

  // Check ports in parallel but limit concurrency
  const chunkSize = 3;
  for (let i = 0; i < ports.length; i += chunkSize) {
    const chunk = ports.slice(i, i + chunkSize);
    const results = await Promise.all(
      chunk.map(async (port) => ({
        port,
        open: await checkPort(port),
      }))
    );
    
    results.forEach(({ port, open }) => {
      if (open) openPorts.push(port);
    });
  }

  return openPorts;
}
