/**
 * WCAG AI Platform - TypeScript SDK Example
 * 
 * Type-safe SDK wrapper for the WCAG AI Platform API.
 */

import axios, { AxiosInstance } from 'axios';

interface ScanRequest {
  url: string;
  wcagLevel?: 'A' | 'AA' | 'AAA';
  viewport?: { width: number; height: number };
  timeout?: number;
  industry?: string;
}

interface ScanResponse {
  scanId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  url: string;
  wcagLevel: string;
  estimatedCompletionTime: number;
}

interface ScanResult {
  scanId: string;
  url: string;
  status: string;
  complianceScore: number;
  violations: {
    critical: number;
    priority: number;
    minor: number;
  };
}

interface BatchScanRequest {
  urls: string[];
  wcagLevel?: 'A' | 'AA' | 'AAA';
  viewport?: { width: number; height: number };
  timeout?: number;
  industry?: string;
}

interface BatchScanResponse {
  batchId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  totalUrls: number;
  scanIds: string[];
  estimatedCompletionTime: number;
}

export class WCAGAIClient {
  private client: AxiosInstance;

  constructor(baseUrl: string = 'http://localhost:5000') {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async scan(request: ScanRequest): Promise<ScanResponse> {
    const response = await this.client.post<ScanResponse>('/api/scan', {
      url: request.url,
      wcagLevel: request.wcagLevel || 'AA',
      viewport: request.viewport,
      timeout: request.timeout || 300000,
      industry: request.industry,
    });
    return response.data;
  }

  async batchScan(request: BatchScanRequest): Promise<BatchScanResponse> {
    const response = await this.client.post<BatchScanResponse>('/api/scan/batch', {
      urls: request.urls,
      wcagLevel: request.wcagLevel || 'AA',
      viewport: request.viewport,
      timeout: request.timeout || 300000,
      industry: request.industry,
    });
    return response.data;
  }

  async getScanResults(scanId: string): Promise<ScanResult> {
    const response = await this.client.get<ScanResult>(`/api/scans/${scanId}`);
    return response.data;
  }

  async getBatchStatus(batchId: string): Promise<BatchScanResponse> {
    const response = await this.client.get<BatchScanResponse>(
      `/api/scan/batch/${batchId}`
    );
    return response.data;
  }

  async pollScan(
    scanId: string,
    maxWaitSeconds: number = 300
  ): Promise<ScanResult> {
    const startTime = Date.now();
    let delay = 5000; // Start with 5s

    while (Date.now() - startTime < maxWaitSeconds * 1000) {
      try {
        const result = await this.getScanResults(scanId);

        if (
          result.status === 'completed' ||
          result.status === 'failed'
        ) {
          return result;
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, 60000); // Exponential backoff, max 60s
      } catch (error) {
        console.error(`Polling error: ${error}`);
        throw error;
      }
    }

    throw new Error(`Scan ${scanId} did not complete within ${maxWaitSeconds}s`);
  }
}

// Usage example
async function main() {
  const client = new WCAGAIClient();

  try {
    // Single scan
    console.log('Starting scan...');
    const scan = await client.scan({
      url: 'https://example.com',
      wcagLevel: 'AA',
    });
    console.log(`Scan created: ${scan.scanId}`);

    const result = await client.pollScan(scan.scanId);
    console.log(`✅ Compliance: ${result.complianceScore}%`);
    console.log(`Violations: ${JSON.stringify(result.violations)}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

export default WCAGAIClient;
