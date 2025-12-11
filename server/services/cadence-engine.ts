import cron from 'node-cron';
import { storage } from '../storage';
import { emailService } from './email-service';
import { getWebSocketManager } from '../websocket';
import type { SelectEmailCadence, SelectProspect } from '@shared/schema';

interface CadenceTouch {
  touchNumber: number;
  delayDays: number;
  subject: string;
  template: string;
}

const DEFAULT_CADENCE: CadenceTouch[] = [
  {
    touchNumber: 1,
    delayDays: 0,
    subject: 'Your Website Accessibility Audit is Ready',
    template: 'initial_report'
  },
  {
    touchNumber: 2,
    delayDays: 3,
    subject: 'Quick fixes to improve your accessibility score',
    template: 'quick_wins'
  },
  {
    touchNumber: 3,
    delayDays: 7,
    subject: 'How other companies are addressing accessibility',
    template: 'social_proof'
  },
  {
    touchNumber: 4,
    delayDays: 10,
    subject: 'Your compliance risk assessment',
    template: 'compliance_risk'
  },
  {
    touchNumber: 5,
    delayDays: 14,
    subject: 'Remediation roadmap for your team',
    template: 'remediation_plan'
  }
];

export class CadenceEngine {
  private cronJobs: Map<string, cron.ScheduledTask> = new Map();
  private isRunning = false;

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('🚀 Cadence Engine started');

    // Run every hour
    const task = cron.schedule('0 * * * *', async () => {
      await this.processPendingCadences();
    });

    this.cronJobs.set('main', task);

    // Initial check
    await this.processPendingCadences();
  }

  async stop() {
    this.cronJobs.forEach(task => task.stop());
    this.cronJobs.clear();
    this.isRunning = false;
    console.log('⛔ Cadence Engine stopped');
  }

  private async processPendingCadences() {
    try {
      console.log('🔄 Processing pending cadences...');
      
      const cadences = await storage.getPendingCadences();
      
      for (const cadence of cadences) {
        try {
          await this.processCadence(cadence);
        } catch (error) {
          console.error(`❌ Error processing cadence ${cadence.id}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error in cadence processing:', error);
    }
  }

  private async processCadence(cadence: SelectEmailCadence) {
    const prospect = await storage.getProspect(cadence.prospectId);
    if (!prospect) return;

    const nextTouch = DEFAULT_CADENCE[cadence.currentTouch];
    if (!nextTouch) {
      // Cadence complete
      await storage.updateCadence(cadence.id, { 
        status: 'completed'
      });
      return;
    }

    const now = new Date();
    const nextScheduled = cadence.nextScheduled ? new Date(cadence.nextScheduled) : now;

    // Check if it's time to send
    if (nextScheduled > now) {
      return;
    }

    try {
      // Generate email content
      const emailContent = this.generateEmailContent(
        nextTouch.template,
        prospect,
        nextTouch.touchNumber
      );

      // Send email
      await emailService.send({
        to: prospect.email || '',
        subject: nextTouch.subject,
        html: emailContent,
        cadenceId: cadence.id
      });

      // Log touch
      await storage.createEmailTouchLog({
        cadenceId: cadence.id,
        touchNumber: nextTouch.touchNumber,
        subject: nextTouch.subject,
        sentAt: now
      });

      // Schedule next touch or complete
      const nextTouchIndex = cadence.currentTouch + 1;
      const nextTouchData = DEFAULT_CADENCE[nextTouchIndex];

      let nextScheduledDate = null;
      if (nextTouchData) {
        nextScheduledDate = new Date(now.getTime() + nextTouchData.delayDays * 24 * 60 * 60 * 1000);
      }

      await storage.updateCadence(cadence.id, {
        currentTouch: nextTouchIndex,
        nextScheduled: nextScheduledDate,
        lastSent: now,
        status: nextTouchData ? 'active' : 'completed'
      });

      // Emit update via WebSocket
      const wsManager = getWebSocketManager();
      if (wsManager) {
        wsManager.emitCadenceUpdate(cadence.id, 'touch-sent', {
          touchNumber: nextTouch.touchNumber,
          timestamp: now
        });
      }

      console.log(`✅ Sent email touch ${nextTouch.touchNumber} to ${prospect.company}`);
    } catch (error) {
      console.error(`❌ Error sending cadence email:`, error);
    }
  }

  private generateEmailContent(
    template: string,
    prospect: SelectProspect,
    touchNumber: number
  ): string {
    const baseHtml = `
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .content { line-height: 1.6; color: #333; }
            .cta { background: #007bff; color: white; padding: 12px 24px; border-radius: 4px; display: inline-block; text-decoration: none; margin-top: 20px; }
            .footer { text-align: center; margin-top: 40px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Accessibility Audit Report</h2>
            </div>
            <div class="content">
              <p>Hello ${prospect.company},</p>
    `;

    let content = '';
    
    switch (template) {
      case 'initial_report':
        content = `
          <p>We've completed a comprehensive WCAG accessibility audit of your website.</p>
          <p><strong>Key Findings:</strong></p>
          <ul>
            <li>Total Issues: ${prospect.violations || 0}</li>
            <li>Accessibility Score: ${prospect.icpScore || 0}/100</li>
            <li>Risk Level: ${prospect.riskLevel || 'low-risk'}</li>
          </ul>
          <a href="#" class="cta">View Full Report</a>
        `;
        break;
      case 'quick_wins':
        content = `
          <p>We've identified quick wins that can be implemented in the next sprint:</p>
          <p>These quick fixes will improve your accessibility score and provide better UX for all users.</p>
          <a href="#" class="cta">See Quick Wins</a>
        `;
        break;
      case 'social_proof':
        content = `
          <p>Leading companies in the ${prospect.industry || 'industry'} are prioritizing accessibility. Here's how they're doing it:</p>
          <p>Industry benchmark data shows that 87% of leaders have invested in accessibility improvements.</p>
          <a href="#" class="cta">View Industry Insights</a>
        `;
        break;
      case 'compliance_risk':
        content = `
          <p>Based on our analysis, your compliance risk score indicates potential legal exposure.</p>
          <p>${prospect.riskLevel === 'high-risk' ? 'Taking action now is critical.' : 'We recommend addressing this proactively.'}</p>
          <a href="#" class="cta">View Risk Assessment</a>
        `;
        break;
      case 'remediation_plan':
        content = `
          <p>We've created a prioritized remediation roadmap for your team.</p>
          <p>This plan helps you allocate resources efficiently and track progress over time.</p>
          <a href="#" class="cta">View Remediation Plan</a>
        `;
        break;
      default:
        content = `<p>Thank you for your interest in improving your website's accessibility.</p>`;
    }

    return baseHtml + content + `
              <p>Best regards,<br>WCAG AI Platform</p>
            </div>
            <div class="footer">
              <p>You received this email because ${prospect.company} requested an accessibility audit.</p>
              <a href="#">Unsubscribe</a>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async startCadenceForProspect(prospectId: string) {
    try {
      const cadence = await storage.createEmailCadence({
        prospectId,
        currentTouch: 0,
        status: 'active'
      });

      console.log(`✅ Started cadence for prospect ${prospectId}`);
      return cadence;
    } catch (error) {
      console.error(`❌ Error starting cadence:`, error);
      throw error;
    }
  }

  async pauseCadence(cadenceId: string, reason: string) {
    await storage.updateCadence(cadenceId, {
      status: 'paused',
      pauseReason: reason
    });
  }

  async resumeCadence(cadenceId: string) {
    await storage.updateCadence(cadenceId, {
      status: 'active',
      pauseReason: null
    });
  }
}

export const cadenceEngine = new CadenceEngine();
