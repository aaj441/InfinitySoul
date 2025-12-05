import { randomUUID } from 'crypto';
import { storage } from '../storage';
import { logger } from '../logger';

export interface ABTest {
  id: string;
  cadenceId: string;
  touchNumber: number;
  variant: 'control' | 'variant_a' | 'variant_b';
  subject: string;
  body: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
  replyCount: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  createdAt: Date;
}

export class ABTestingEngine {
  private tests: Map<string, ABTest> = new Map();

  async createTest(cadenceId: string, touchNumber: number, variants: {
    control: { subject: string; body: string };
    variant_a: { subject: string; body: string };
    variant_b: { subject: string; body: string };
  }): Promise<ABTest[]> {
    const tests: ABTest[] = [];

    for (const [key, value] of Object.entries(variants)) {
      const test: ABTest = {
        id: randomUUID(),
        cadenceId,
        touchNumber,
        variant: key as 'control' | 'variant_a' | 'variant_b',
        subject: value.subject,
        body: value.body,
        sentCount: 0,
        openCount: 0,
        clickCount: 0,
        replyCount: 0,
        openRate: 0,
        clickRate: 0,
        replyRate: 0,
        createdAt: new Date(),
      };
      this.tests.set(test.id, test);
      tests.push(test);
    }

    logger.info(`Created AB test for cadence ${cadenceId} touch ${touchNumber}`, { testCount: tests.length });
    return tests;
  }

  async selectVariant(cadenceId: string, touchNumber: number): Promise<'control' | 'variant_a' | 'variant_b'> {
    const variants = ['control', 'variant_a', 'variant_b'] as const;
    const random = Math.floor(Math.random() * variants.length);
    return variants[random];
  }

  async recordMetric(testId: string, metric: 'open' | 'click' | 'reply'): Promise<void> {
    const test = this.tests.get(testId);
    if (!test) return;

    if (metric === 'open') {
      test.openCount++;
    } else if (metric === 'click') {
      test.clickCount++;
    } else if (metric === 'reply') {
      test.replyCount++;
    }

    test.sentCount = test.sentCount || 1;
    test.openRate = (test.openCount / test.sentCount) * 100;
    test.clickRate = (test.clickCount / test.sentCount) * 100;
    test.replyRate = (test.replyCount / test.sentCount) * 100;

    this.tests.set(testId, test);
  }

  async getTestResults(cadenceId: string, touchNumber: number): Promise<ABTest[]> {
    return Array.from(this.tests.values()).filter(
      (t) => t.cadenceId === cadenceId && t.touchNumber === touchNumber
    );
  }

  async getWinnerVariant(cadenceId: string, touchNumber: number): Promise<'control' | 'variant_a' | 'variant_b'> {
    const results = await this.getTestResults(cadenceId, touchNumber);
    
    let winner: ABTest = results[0];
    let highestScore = 0;

    for (const test of results) {
      // Calculate weighted score (60% open, 30% click, 10% reply)
      const score = (test.openRate * 0.6) + (test.clickRate * 0.3) + (test.replyRate * 0.1);
      if (score > highestScore) {
        highestScore = score;
        winner = test;
      }
    }

    return winner.variant;
  }
}

export const abTestingEngine = new ABTestingEngine();
