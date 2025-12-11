import type { IStorage } from "../storage.js";
import type {
  EmailCampaign,
  EmailVariant,
  InsertEmailCampaign,
  InsertEmailVariant,
  InsertEmailSend,
  InsertEmailEvent,
} from "@shared/schema.js";

interface CampaignAnalytics {
  campaign: EmailCampaign;
  variants: Array<{
    variant: EmailVariant;
    openRate: number;
    clickRate: number;
    replyRate: number;
    conversionRate: number;
  }>;
  winningVariant: EmailVariant | null;
  statisticalSignificance: boolean;
}

interface VariantPerformance {
  variantId: string;
  variantName: string;
  sends: number;
  opens: number;
  clicks: number;
  replies: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
}

export class ABTestingService {
  constructor(private storage: IStorage) {}

  async createCampaign(data: InsertEmailCampaign): Promise<EmailCampaign> {
    return this.storage.createEmailCampaign(data);
  }

  async addVariant(campaignId: string, data: Omit<InsertEmailVariant, 'campaignId'>): Promise<EmailVariant> {
    return this.storage.createEmailVariant({
      ...data,
      campaignId,
    });
  }

  async recordSend(data: InsertEmailSend): Promise<void> {
    const send = await this.storage.createEmailSend(data);
    
    const variant = await this.storage.updateVariantStats(data.variantId, {
      sends: 1,
    });
    
    await this.storage.updateCampaignStats(data.campaignId, {
      totalSends: 1,
    });
  }

  async recordEvent(sendId: string, eventType: 'open' | 'click' | 'reply', metadata?: any): Promise<void> {
    const send = await this.storage.getEmailSendById(sendId);
    if (!send) {
      throw new Error('Send not found');
    }

    await this.storage.createEmailEvent({
      sendId,
      eventType,
      metadata: metadata || null,
    });

    const updates: { opens?: number; clicks?: number; replies?: number } = {};
    if (eventType === 'open') updates.opens = 1;
    if (eventType === 'click') updates.clicks = 1;
    if (eventType === 'reply') updates.replies = 1;

    await this.storage.updateVariantStats(send.variantId, updates);

    const campaignUpdates: { totalOpens?: number; totalClicks?: number; totalReplies?: number } = {};
    if (eventType === 'open') campaignUpdates.totalOpens = 1;
    if (eventType === 'click') campaignUpdates.totalClicks = 1;
    if (eventType === 'reply') campaignUpdates.totalReplies = 1;

    await this.storage.updateCampaignStats(send.campaignId, campaignUpdates);

    const variant = await this.storage.getVariantById(send.variantId);
    if (variant && variant.sends > 0) {
      await this.storage.updateVariantStats(send.variantId, {
        openRate: Math.round((variant.opens / variant.sends) * 100),
        clickRate: Math.round((variant.clicks / variant.sends) * 100),
        replyRate: Math.round((variant.replies / variant.sends) * 100),
      });
    }
  }

  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
    const analytics = await this.storage.getCampaignAnalytics(campaignId);
    
    const variantStats = analytics.variants.map(v => ({
      variant: v,
      openRate: v.sends > 0 ? (v.opens / v.sends) * 100 : 0,
      clickRate: v.sends > 0 ? (v.clicks / v.sends) * 100 : 0,
      replyRate: v.sends > 0 ? (v.replies / v.sends) * 100 : 0,
      conversionRate: v.sends > 0 ? (v.replies / v.sends) * 100 : 0,
    }));

    const winningVariant = this.determineWinner(variantStats);
    const statisticalSignificance = this.calculateSignificance(variantStats);

    return {
      campaign: analytics.campaign,
      variants: variantStats,
      winningVariant: winningVariant?.variant || null,
      statisticalSignificance,
    };
  }

  private determineWinner(
    variants: Array<{ variant: EmailVariant; openRate: number; clickRate: number; replyRate: number; conversionRate: number }>
  ): { variant: EmailVariant; openRate: number; clickRate: number; replyRate: number; conversionRate: number } | null {
    if (variants.length === 0) return null;
    
    return variants.reduce((best, current) => {
      if (!best) return current;
      
      const currentScore = current.conversionRate * 3 + current.clickRate * 2 + current.openRate;
      const bestScore = best.conversionRate * 3 + best.clickRate * 2 + best.openRate;
      
      return currentScore > bestScore ? current : best;
    }, variants[0]);
  }

  private calculateSignificance(
    variants: Array<{ variant: EmailVariant; openRate: number; clickRate: number; replyRate: number }>
  ): boolean {
    if (variants.length < 2) return false;
    
    const minSampleSize = 30;
    const hasEnoughData = variants.every(v => v.variant.sends >= minSampleSize);
    if (!hasEnoughData) return false;

    const sorted = [...variants].sort((a, b) => b.replyRate - a.replyRate);
    const best = sorted[0];
    const secondBest = sorted[1];
    
    const difference = Math.abs(best.replyRate - secondBest.replyRate);
    const threshold = 20;
    
    return difference >= threshold;
  }

  async getAllCampaigns(): Promise<EmailCampaign[]> {
    return this.storage.getAllEmailCampaigns();
  }

  async updateCampaignStatus(
    campaignId: string, 
    status: 'draft' | 'active' | 'paused' | 'completed'
  ): Promise<void> {
    await this.storage.updateEmailCampaign(campaignId, { status });
  }

  async setWinner(campaignId: string, variantId: string): Promise<void> {
    await this.storage.updateEmailCampaign(campaignId, {
      winnerVariantId: variantId,
      status: 'completed',
    });
  }
}
