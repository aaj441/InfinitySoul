/**
 * Agent #4: BiometricAgent (Personal)
 * 
 * Logs Whoop/Levels/InsideTracker data
 * Auto-adjusts: diet, training, sleep, supplements
 * Goal: HRV >80, T >900, sleep latency <5
 */

import { BiometricData, BiometricOptimization, AgentReport } from './types';

export class BiometricAgent {
  private history: BiometricData[] = [];

  /**
   * Log biometric data from wearables
   * In production: Integrate with Whoop API, Levels API, InsideTracker API
   */
  async logData(data: BiometricData): Promise<void> {
    this.history.push(data);
    console.log(`\n📊 Biometric data logged at ${data.timestamp.toISOString()}`);
    console.log(`   HRV: ${data.hrv} ms`);
    console.log(`   Testosterone: ${data.testosterone} ng/dL`);
    console.log(`   Sleep Latency: ${data.sleepLatency} min`);
  }

  /**
   * Optimize biometrics based on current metrics
   */
  async optimize(): Promise<BiometricOptimization> {
    const current = this.getCurrentMetrics();
    const recommendations: string[] = [];
    const adjustments: BiometricOptimization['adjustments'] = {};

    console.log(`\n🔧 Optimizing biometrics...`);

    // HRV optimization (target: >80)
    if (current.hrv < 70) {
      recommendations.push('HRV below optimal range - high stress detected');
      adjustments.sleep = 'Add 30-minute nap at 2 PM';
      adjustments.supplements = 'Increase magnesium to 400mg before bed';
      adjustments.training = 'Reduce intensity by 20%, focus on recovery';
    } else if (current.hrv < 80) {
      recommendations.push('HRV approaching optimal range');
      adjustments.sleep = 'Maintain 8 hours, consider earlier bedtime';
      adjustments.supplements = 'Continue current magnesium dosage';
    } else {
      recommendations.push('HRV optimal - maintain current routine');
    }

    // Testosterone optimization (target: >900)
    if (current.testosterone < 700) {
      recommendations.push('Testosterone significantly below target');
      adjustments.diet = 'Increase dietary fat by 5g (focus on saturated fat from eggs, butter)';
      adjustments.training = 'Add heavy compound lifts (squats, deadlifts) 3x/week';
      adjustments.supplements = 'Add zinc (30mg), vitamin D (5000 IU), boron (10mg)';
    } else if (current.testosterone < 900) {
      recommendations.push('Testosterone below target');
      adjustments.diet = 'Increase fat intake, reduce cortisol-inducing foods';
      adjustments.supplements = 'Consider D-aspartic acid supplementation';
    } else {
      recommendations.push('Testosterone optimal - maintain current routine');
    }

    // Sleep latency optimization (target: <5 min)
    if (current.sleepLatency > 10) {
      recommendations.push('Sleep latency too high - sleep quality compromised');
      adjustments.sleep = 'Blue light blockers 2h before bed, room temp to 67°F, magnesium glycinate 400mg';
    } else if (current.sleepLatency > 5) {
      recommendations.push('Sleep latency slightly elevated');
      adjustments.sleep = 'Blue light blockers 1h before bed, maintain cool room temp';
    } else {
      recommendations.push('Sleep latency optimal');
    }

    const optimization: BiometricOptimization = {
      currentMetrics: current,
      recommendations,
      adjustments
    };

    console.log(`   Recommendations: ${recommendations.length}`);
    recommendations.forEach(rec => console.log(`     - ${rec}`));

    return optimization;
  }

  /**
   * Get current biometric metrics (latest reading)
   */
  private getCurrentMetrics(): BiometricData {
    if (this.history.length === 0) {
      // Default values if no data
      return {
        hrv: 65,
        testosterone: 750,
        sleepLatency: 8,
        timestamp: new Date()
      };
    }
    return this.history[this.history.length - 1];
  }

  /**
   * Get trend analysis (7-day moving average)
   */
  getTrends(): {
    hrvTrend: number;
    testosteroneTrend: number;
    sleepLatencyTrend: number;
  } {
    if (this.history.length < 2) {
      return {
        hrvTrend: 0,
        testosteroneTrend: 0,
        sleepLatencyTrend: 0
      };
    }

    const recentData = this.history.slice(-7);
    const avgHrv = recentData.reduce((sum, d) => sum + d.hrv, 0) / recentData.length;
    const avgT = recentData.reduce((sum, d) => sum + d.testosterone, 0) / recentData.length;
    const avgSleep = recentData.reduce((sum, d) => sum + d.sleepLatency, 0) / recentData.length;

    const olderData = this.history.slice(-14, -7);
    if (olderData.length === 0) {
      return {
        hrvTrend: 0,
        testosteroneTrend: 0,
        sleepLatencyTrend: 0
      };
    }

    const oldAvgHrv = olderData.reduce((sum, d) => sum + d.hrv, 0) / olderData.length;
    const oldAvgT = olderData.reduce((sum, d) => sum + d.testosterone, 0) / olderData.length;
    const oldAvgSleep = olderData.reduce((sum, d) => sum + d.sleepLatency, 0) / olderData.length;

    return {
      hrvTrend: avgHrv - oldAvgHrv,
      testosteroneTrend: avgT - oldAvgT,
      sleepLatencyTrend: avgSleep - oldAvgSleep
    };
  }

  /**
   * Generate daily report
   */
  async generateReport(): Promise<AgentReport> {
    const current = this.getCurrentMetrics();
    const trends = this.getTrends();

    const status = 
      current.hrv >= 80 && current.testosterone >= 900 && current.sleepLatency <= 5
        ? 'success'
        : current.hrv < 70 || current.testosterone < 700 || current.sleepLatency > 10
        ? 'warning'
        : 'success';

    return {
      agentName: 'BiometricAgent',
      timestamp: new Date(),
      status,
      summary: `HRV: ${current.hrv} ms (${trends.hrvTrend > 0 ? '↑' : '↓'}${Math.abs(trends.hrvTrend).toFixed(1)}), T: ${current.testosterone} ng/dL (${trends.testosteroneTrend > 0 ? '↑' : '↓'}${Math.abs(trends.testosteroneTrend).toFixed(0)}), Sleep: ${current.sleepLatency} min`,
      metrics: {
        hrv: current.hrv,
        testosterone: current.testosterone,
        sleepLatency: current.sleepLatency,
        hrvTrend: trends.hrvTrend,
        testosteroneTrend: trends.testosteroneTrend,
        sleepLatencyTrend: trends.sleepLatencyTrend
      }
    };
  }
}
