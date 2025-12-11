import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger';

export interface BatchScanRequest {
  urls: string[];
  wcagLevel?: 'A' | 'AA' | 'AAA';
  viewport?: { width: number; height: number };
  timeout?: number;
  industry?: string;
}

export interface BatchScanResponse {
  batchId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  totalUrls: number;
  scanIds: string[];
  createdAt: string;
  estimatedCompletionTime: number;
}

interface BatchJob {
  batchId: string;
  urls: string[];
  config: Omit<BatchScanRequest, 'urls'>;
  scanIds: string[];
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

const activeBatches = new Map<string, BatchJob>();

export const batchScanner = {
  async createBatchScan(request: BatchScanRequest): Promise<BatchScanResponse> {
    const batchId = `batch_${uuidv4()}`;
    
    // Validate URLs
    if (!request.urls || request.urls.length === 0) {
      throw new Error('At least one URL is required');
    }
    
    if (request.urls.length > 100) {
      throw new Error('Maximum 100 URLs per batch');
    }
    
    // Generate scan IDs for each URL
    const scanIds = request.urls.map(() => `scan_${uuidv4()}`);
    
    const batch: BatchJob = {
      batchId,
      urls: request.urls,
      config: {
        wcagLevel: request.wcagLevel || 'AA',
        viewport: request.viewport,
        timeout: request.timeout || 300000,
        industry: request.industry,
      },
      scanIds,
      status: 'queued',
      createdAt: new Date(),
    };
    
    activeBatches.set(batchId, batch);
    
    // Queue for background processing
    setImmediate(() => processBatch(batchId));
    
    logger.info(`Batch scan created: ${batchId} with ${request.urls.length} URLs`);
    
    return {
      batchId,
      status: batch.status,
      totalUrls: request.urls.length,
      scanIds,
      createdAt: batch.createdAt.toISOString(),
      estimatedCompletionTime: request.urls.length * 30, // ~30s per URL
    };
  },

  async getBatchStatus(batchId: string): Promise<BatchScanResponse | null> {
    const batch = activeBatches.get(batchId);
    if (!batch) return null;
    
    return {
      batchId: batch.batchId,
      status: batch.status,
      totalUrls: batch.urls.length,
      scanIds: batch.scanIds,
      createdAt: batch.createdAt.toISOString(),
      estimatedCompletionTime: 0,
    };
  },

  async listBatches(): Promise<BatchScanResponse[]> {
    return Array.from(activeBatches.values()).map(batch => ({
      batchId: batch.batchId,
      status: batch.status,
      totalUrls: batch.urls.length,
      scanIds: batch.scanIds,
      createdAt: batch.createdAt.toISOString(),
      estimatedCompletionTime: 0,
    }));
  },
};

async function processBatch(batchId: string): Promise<void> {
  const batch = activeBatches.get(batchId);
  if (!batch) return;
  
  batch.status = 'processing';
  
  try {
    // Process URLs sequentially with exponential backoff
    for (const [index, url] of batch.urls.entries()) {
      const scanId = batch.scanIds[index];
      logger.info(`Processing batch ${batchId}: ${index + 1}/${batch.urls.length} - ${url}`);
      
      // Simulate processing (in production, would call wcagScanner service)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    batch.status = 'completed';
    batch.completedAt = new Date();
    logger.info(`Batch scan completed: ${batchId}`);
  } catch (error) {
    batch.status = 'failed';
    batch.completedAt = new Date();
    logger.error(`Batch scan failed: ${batchId}`, error as Error);
  }
}
