/**
 * Polling utilities with exponential backoff
 * Implements efficient asynchronous scan polling without overwhelming the server
 */

export interface PollOptions {
  initialDelayMs?: number;
  maxDelayMs?: number;
  maxAttempts?: number;
  backoffMultiplier?: number;
}

export interface PollResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  attempts: number;
}

const DEFAULT_OPTIONS: Required<PollOptions> = {
  initialDelayMs: 5000,      // Start with 5s
  maxDelayMs: 60000,          // Cap at 60s
  maxAttempts: 30,            // Max 30 attempts (~15 min)
  backoffMultiplier: 2,       // Double delay each attempt
};

/**
 * Poll with exponential backoff
 * Reduces server load by increasing wait time between attempts
 */
export async function pollWithBackoff<T>(
  checkFn: () => Promise<T | null>,
  isComplete: (data: T) => boolean,
  options: PollOptions = {}
): Promise<PollResult<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let delay = opts.initialDelayMs;
  let attempts = 0;

  while (attempts < opts.maxAttempts) {
    attempts++;
    
    try {
      const data = await checkFn();
      
      if (data && isComplete(data)) {
        return {
          success: true,
          data,
          attempts,
        };
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increase delay for next attempt
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelayMs);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        attempts,
      };
    }
  }

  return {
    success: false,
    error: `Polling timeout after ${attempts} attempts`,
    attempts,
  };
}

/**
 * Convenience wrapper for scan polling
 */
export async function pollScanResults(
  scanId: string,
  baseUrl: string = 'http://localhost:5000'
): Promise<PollResult<any>> {
  return pollWithBackoff(
    () =>
      fetch(`${baseUrl}/api/scans/${scanId}`)
        .then(r => r.json())
        .catch(() => null),
    (data) => data?.status === 'completed' || data?.status === 'failed',
    {
      initialDelayMs: 2000,
      maxDelayMs: 30000,
      maxAttempts: 60,
    }
  );
}

/**
 * Rate limit aware retry logic
 * Respects 429 Too Many Requests with Retry-After header
 */
export async function retryWithRateLimit<T>(
  fn: () => Promise<Response>,
  maxRetries: number = 3
): Promise<T> {
  let attempts = 0;

  while (attempts < maxRetries) {
    attempts++;
    const response = await fn();

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
      console.warn(`Rate limited. Waiting ${retryAfter}s before retry...`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      continue;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  throw new Error(`Failed after ${maxRetries} attempts`);
}
