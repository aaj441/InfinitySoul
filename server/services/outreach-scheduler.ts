import { logger } from "../logger";

export interface ScheduledOutreach {
  prospectId: string;
  email: string;
  subject: string;
  body: string;
  scheduledFor: Date;
  type: "initial" | "followup";
  dayNumber?: number;
  status: "pending" | "sent" | "failed";
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
}

export class OutreachScheduler {
  private queue: ScheduledOutreach[] = [];
  private readonly BEST_SEND_TIMES = [9, 11, 14]; // 9am, 11am, 2pm

  scheduleInitialOutreach(
    prospectId: string,
    email: string,
    subject: string,
    body: string
  ): ScheduledOutreach {
    const nextBestTime = this.getNextBestSendTime();

    const outreach: ScheduledOutreach = {
      prospectId,
      email,
      subject,
      body,
      scheduledFor: nextBestTime,
      type: "initial",
      status: "pending",
    };

    this.queue.push(outreach);
    logger.info(
      `Scheduled initial outreach for ${prospectId} at ${nextBestTime.toISOString()}`
    );

    return outreach;
  }

  scheduleFollowUp(
    prospectId: string,
    email: string,
    subject: string,
    body: string,
    daysAfterInitial: number
  ): ScheduledOutreach {
    const initialOutreach = this.queue.find(
      o => o.prospectId === prospectId && o.type === "initial"
    );

    if (!initialOutreach) {
      throw new Error(`No initial outreach found for prospect ${prospectId}`);
    }

    const followUpDate = new Date(initialOutreach.scheduledFor);
    followUpDate.setDate(followUpDate.getDate() + daysAfterInitial);
    followUpDate.setHours(this.BEST_SEND_TIMES[0], 0, 0, 0);

    const followUp: ScheduledOutreach = {
      prospectId,
      email,
      subject,
      body,
      scheduledFor: followUpDate,
      type: "followup",
      dayNumber: daysAfterInitial,
      status: "pending",
    };

    this.queue.push(followUp);
    logger.info(
      `Scheduled follow-up (day ${daysAfterInitial}) for ${prospectId} at ${followUpDate.toISOString()}`
    );

    return followUp;
  }

  getPendingOutreach(): ScheduledOutreach[] {
    const now = new Date();
    return this.queue.filter(o => o.status === "pending" && o.scheduledFor <= now);
  }

  getQueue(): ScheduledOutreach[] {
    return this.queue;
  }

  markAsSent(prospectId: string, type: "initial" | "followup"): void {
    const outreach = this.queue.find(o => o.prospectId === prospectId && o.type === type);
    if (outreach) {
      outreach.status = "sent";
      outreach.sentAt = new Date();
      logger.info(`Marked ${type} outreach for ${prospectId} as sent`);
    }
  }

  markAsOpened(prospectId: string): void {
    const outreach = this.queue.find(o => o.prospectId === prospectId && o.status === "sent");
    if (outreach) {
      outreach.openedAt = new Date();
      logger.info(`Marked outreach for ${prospectId} as opened`);
    }
  }

  markAsClicked(prospectId: string): void {
    const outreach = this.queue.find(o => o.prospectId === prospectId && o.status === "sent");
    if (outreach) {
      outreach.clickedAt = new Date();
      logger.info(`Marked outreach for ${prospectId} as clicked`);
    }
  }

  private getNextBestSendTime(): Date {
    const now = new Date();
    const hour = now.getHours();

    // Find next best send time
    let targetHour = this.BEST_SEND_TIMES.find(h => h > hour);

    if (!targetHour) {
      // If past all send times today, schedule for first time tomorrow
      targetHour = this.BEST_SEND_TIMES[0];
      now.setDate(now.getDate() + 1);
    }

    now.setHours(targetHour, Math.floor(Math.random() * 60), 0, 0);

    return now;
  }

  getMetrics(): {
    total: number;
    pending: number;
    sent: number;
    opened: number;
    clicked: number;
    openRate: number;
    clickRate: number;
  } {
    const total = this.queue.length;
    const sent = this.queue.filter(o => o.status === "sent").length;
    const opened = this.queue.filter(o => o.openedAt).length;
    const clicked = this.queue.filter(o => o.clickedAt).length;
    const pending = this.queue.filter(o => o.status === "pending").length;

    return {
      total,
      pending,
      sent,
      opened,
      clicked,
      openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
      clickRate: sent > 0 ? Math.round((clicked / sent) * 100) : 0,
    };
  }
}

export const outreachScheduler = new OutreachScheduler();
