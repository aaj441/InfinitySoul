/**
 * Scout: Technical reconnaissance for STREET_CYBER_SCAN
 * See: docs/STREET_CYBER_SCAN.md
 *
 * Performs non-intrusive security checks:
 * - DNS resolution
 * - HTTP/HTTPS reachability
 * - Security header inspection
 * - Shallow port scanning
 */

import { ScoutResult } from "./types";
import * as dns from "dns";
import { promisify } from "util";
import * as http from "http";
import * as https from "https";
import * as net from "net";
import { CyberScanConfig } from "../../config/cyber";
import { scanCache, CacheKeys } from "./cache";
import { DnsResolutionError, HttpCheckError, PortScanError } from "./errors";

const resolve4 = promisify(dns.resolve4);

/**
 * Check if a TCP port is open on the given host
 */
async function checkPort(host: string, port: number, timeout?: number): Promise<boolean> {
  const actualTimeout = timeout || CyberScanConfig.timeouts.portScan;
  
  // Check cache first
  const cacheKey = CacheKeys.portScan(host, port);
  const cached = scanCache.get<boolean>(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    const onError = () => {
      socket.destroy();
      resolve(false);
    };
    
    socket.setTimeout(actualTimeout);
    socket.once("error", onError);
    socket.once("timeout", onError);
    
    socket.connect(port, host, () => {
      socket.destroy();
      const isOpen = true;
      // Cache the result
      scanCache.set(cacheKey, isOpen, CyberScanConfig.cache.dnsTTL);
      resolve(isOpen);
    });
  });
}

/**
 * Check HTTP/HTTPS reachability and collect security headers
 */
async function checkHttpEndpoint(
  url: string,
  isHttps: boolean
): Promise<{ reachable: boolean; headers: Record<string, string | undefined> }> {
  // Check cache first
  const cacheKey = isHttps ? CacheKeys.httpsCheck(url) : CacheKeys.httpCheck(url);
  const cached = scanCache.get<{ reachable: boolean; headers: Record<string, string | undefined> }>(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  return new Promise((resolve) => {
    const client = isHttps ? https : http;
    const timeout = isHttps ? CyberScanConfig.timeouts.https : CyberScanConfig.timeouts.http;
    
    const req = client.request(
      url,
      {
        method: "HEAD",
        timeout,
        headers: {
          "User-Agent": CyberScanConfig.userAgent,
        },
      },
      (res) => {
        const securityHeaders: Record<string, string | undefined> = {
          "strict-transport-security": res.headers["strict-transport-security"] as string | undefined,
          "x-frame-options": res.headers["x-frame-options"] as string | undefined,
          "x-content-type-options": res.headers["x-content-type-options"] as string | undefined,
          "content-security-policy": res.headers["content-security-policy"] as string | undefined,
          "x-xss-protection": res.headers["x-xss-protection"] as string | undefined,
        };
        
        const result = { reachable: true, headers: securityHeaders };
        // Cache the result
        scanCache.set(cacheKey, result, CyberScanConfig.cache.certTTL);
        resolve(result);
      }
    );
    
    req.on("error", () => {
      const result = { reachable: false, headers: {} };
      // Cache negative results too (with shorter TTL)
      scanCache.set(cacheKey, result, CyberScanConfig.cache.dnsTTL / 24);
      resolve(result);
    });
    
    req.on("timeout", () => {
      req.destroy();
      const result = { reachable: false, headers: {} };
      scanCache.set(cacheKey, result, CyberScanConfig.cache.dnsTTL / 24);
      resolve(result);
    });
    
    req.end();
  });
}

/**
 * Scan common ports (shallow scan only)
 */
async function scanCommonPorts(host: string): Promise<number[]> {
  const commonPorts = CyberScanConfig.portScanning.commonPorts;
  
  // Use Promise.allSettled for parallel scanning with error tolerance
  const results = await Promise.allSettled(
    commonPorts.map(async (port) => {
      try {
        const isOpen = await checkPort(host, port);
        return isOpen ? port : null;
      } catch (error) {
        // Log error but don't fail entire scan
        console.warn(`Port check failed for ${host}:${port}`, error);
        return null;
      }
    })
  );
  
  return results
    .filter((result): result is PromiseFulfilledResult<number | null> => 
      result.status === "fulfilled" && result.value !== null
    )
    .map((result) => result.value as number);
}

/**
 * Main Scout function: performs all technical checks
 * Uses Promise.allSettled for parallel execution with error tolerance
 */
export async function runScout(domain: string): Promise<ScoutResult> {
  const scannedAt = new Date();
  const rawFindings: string[] = [];
  let resolvedIp: string | undefined;
  let httpReachable = false;
  let httpsReachable = false;
  let securityHeaders: Record<string, string | undefined> = {};
  let openPorts: number[] = [];
  
  // Clean domain (remove protocol if present)
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  
  // Step 1: DNS resolution (with caching)
  const cacheKey = CacheKeys.dns(cleanDomain);
  const cachedIp = scanCache.get<string>(cacheKey);
  
  if (cachedIp) {
    resolvedIp = cachedIp;
    rawFindings.push(`Resolved ${cleanDomain} to ${resolvedIp} (cached)`);
  } else {
    try {
      const ips = await resolve4(cleanDomain);
      if (ips && ips.length > 0) {
        resolvedIp = ips[0];
        // Cache DNS result
        scanCache.set(cacheKey, resolvedIp, CyberScanConfig.cache.dnsTTL);
        rawFindings.push(`Resolved ${cleanDomain} to ${resolvedIp}`);
      } else {
        rawFindings.push(`No A records found for ${cleanDomain}`);
      }
    } catch (error) {
      const err = error as Error;
      rawFindings.push(`DNS resolution failed: ${err.message}`);
      // Don't throw - continue with other checks
    }
  }
  
  // Steps 2-4: Run HTTP, HTTPS, and port scanning in parallel
  const [httpResult, httpsResult, portScanResult] = await Promise.allSettled([
    // HTTP check
    (async () => {
      try {
        const result = await checkHttpEndpoint(`http://${cleanDomain}`, false);
        httpReachable = result.reachable;
        if (httpReachable) {
          rawFindings.push(`HTTP (port 80) is reachable`);
        } else {
          rawFindings.push(`HTTP (port 80) is not reachable`);
        }
        return result;
      } catch (error) {
        const err = error as Error;
        rawFindings.push(`HTTP check error: ${err.message}`);
        return { reachable: false, headers: {} };
      }
    })(),
    
    // HTTPS check
    (async () => {
      try {
        const result = await checkHttpEndpoint(`https://${cleanDomain}`, true);
        httpsReachable = result.reachable;
        if (httpsReachable) {
          rawFindings.push(`HTTPS (port 443) is reachable`);
          securityHeaders = result.headers;
          
          // Document which headers were found
          Object.entries(result.headers).forEach(([key, value]) => {
            if (value) {
              rawFindings.push(`Security header found: ${key}`);
            }
          });
        } else {
          rawFindings.push(`HTTPS (port 443) is not reachable`);
        }
        return result;
      } catch (error) {
        const err = error as Error;
        rawFindings.push(`HTTPS check error: ${err.message}`);
        return { reachable: false, headers: {} };
      }
    })(),
    
    // Port scanning (only if we have an IP)
    (async () => {
      if (!resolvedIp) {
        rawFindings.push(`Skipping port scan: no IP resolved`);
        return [];
      }
      
      try {
        const ports = await scanCommonPorts(resolvedIp);
        if (ports.length > 0) {
          rawFindings.push(`Open ports detected: ${ports.join(", ")}`);
        } else {
          rawFindings.push(`No common ports found open (may be firewalled)`);
        }
        return ports;
      } catch (error) {
        const err = error as Error;
        rawFindings.push(`Port scanning error: ${err.message}`);
        return [];
      }
    })(),
  ]);
  
  // Extract results from Promise.allSettled
  if (httpsResult.status === "fulfilled" && httpsResult.value) {
    httpsReachable = httpsResult.value.reachable;
    securityHeaders = httpsResult.value.headers;
  }
  
  if (portScanResult.status === "fulfilled") {
    openPorts = portScanResult.value;
  }
  
  return {
    domain: cleanDomain,
    resolvedIp,
    httpReachable,
    httpsReachable,
    securityHeaders,
    openPorts,
    rawFindings,
    scannedAt,
  };
}
