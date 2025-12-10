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

const resolve4 = promisify(dns.resolve4);

/**
 * Check if a TCP port is open on the given host
 */
async function checkPort(host: string, port: number, timeout = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    const onError = () => {
      socket.destroy();
      resolve(false);
    };
    
    socket.setTimeout(timeout);
    socket.once("error", onError);
    socket.once("timeout", onError);
    
    socket.connect(port, host, () => {
      socket.destroy();
      resolve(true);
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
  return new Promise((resolve) => {
    const client = isHttps ? https : http;
    const timeout = 10000; // 10 second timeout
    
    const req = client.request(
      url,
      {
        method: "HEAD",
        timeout,
        headers: {
          "User-Agent": "InfinitySoul-CyberScout/1.0",
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
        
        resolve({ reachable: true, headers: securityHeaders });
      }
    );
    
    req.on("error", () => {
      resolve({ reachable: false, headers: {} });
    });
    
    req.on("timeout", () => {
      req.destroy();
      resolve({ reachable: false, headers: {} });
    });
    
    req.end();
  });
}

/**
 * Scan common ports (shallow scan only)
 */
async function scanCommonPorts(host: string): Promise<number[]> {
  const commonPorts = [21, 22, 23, 25, 80, 443, 3389, 5432, 3306, 27017];
  const openPorts: number[] = [];
  
  // Check ports in parallel but with a reasonable limit
  const results = await Promise.all(
    commonPorts.map(async (port) => {
      const isOpen = await checkPort(host, port);
      return isOpen ? port : null;
    })
  );
  
  return results.filter((port): port is number => port !== null);
}

/**
 * Main Scout function: performs all technical checks
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
  
  // Step 1: DNS resolution
  try {
    const ips = await resolve4(cleanDomain);
    if (ips && ips.length > 0) {
      resolvedIp = ips[0];
      rawFindings.push(`Resolved ${cleanDomain} to ${resolvedIp}`);
    } else {
      rawFindings.push(`No A records found for ${cleanDomain}`);
    }
  } catch (error) {
    const err = error as Error;
    rawFindings.push(`DNS resolution failed: ${err.message}`);
  }
  
  // Step 2: HTTP reachability
  try {
    const httpResult = await checkHttpEndpoint(`http://${cleanDomain}`, false);
    httpReachable = httpResult.reachable;
    if (httpReachable) {
      rawFindings.push(`HTTP (port 80) is reachable`);
    } else {
      rawFindings.push(`HTTP (port 80) is not reachable`);
    }
  } catch (error) {
    const err = error as Error;
    rawFindings.push(`HTTP check error: ${err.message}`);
  }
  
  // Step 3: HTTPS reachability and security headers
  try {
    const httpsResult = await checkHttpEndpoint(`https://${cleanDomain}`, true);
    httpsReachable = httpsResult.reachable;
    if (httpsReachable) {
      rawFindings.push(`HTTPS (port 443) is reachable`);
      securityHeaders = httpsResult.headers;
      
      // Document which headers were found
      Object.entries(httpsResult.headers).forEach(([key, value]) => {
        if (value) {
          rawFindings.push(`Security header found: ${key}`);
        }
      });
    } else {
      rawFindings.push(`HTTPS (port 443) is not reachable`);
    }
  } catch (error) {
    const err = error as Error;
    rawFindings.push(`HTTPS check error: ${err.message}`);
  }
  
  // Step 4: Port scanning (only if we have an IP)
  if (resolvedIp) {
    try {
      openPorts = await scanCommonPorts(resolvedIp);
      if (openPorts.length > 0) {
        rawFindings.push(`Open ports detected: ${openPorts.join(", ")}`);
      } else {
        rawFindings.push(`No common ports found open (may be firewalled)`);
      }
    } catch (error) {
      const err = error as Error;
      rawFindings.push(`Port scanning error: ${err.message}`);
    }
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
