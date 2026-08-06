import { Client } from '@upstash/qstash';
import { logger } from '@/backend/utils/logger';

export class AutoPostScheduler {
  private client: Client;
  private appUrl: string;

  constructor() {
    this.client = new Client({ token: process.env.QSTASH_TOKEN || '' });
    // This URL must be publicly accessible for Upstash to reach it.
    // In production, this should be the absolute URL of the deployment.
    this.appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://api.yourdomain.com';
  }

  /**
   * Creates or updates a daily schedule for a workspace
   * @param workspaceId The ID of the workspace
   * @param cron UTC Cron expression (e.g. "0 9 * * *")
   * @param type The type of post (e.g. 'post', 'carousel', 'video')
   * @returns The generated Upstash scheduleId
   */
  async enableAutoPost(workspaceId: string, cron: string, type: string): Promise<string> {
    try {
      const endpoint = `${this.appUrl}/api/webhooks/qstash/auto-post-trigger`;
      
      const schedule = await this.client.schedules.create({
        destination: endpoint,
        cron,
        body: JSON.stringify({ workspaceId, type }),
        retries: 3,
      });
      
      logger.info({ workspaceId, scheduleId: schedule.scheduleId }, 'Successfully enabled Auto-Post schedule');
      return schedule.scheduleId;
    } catch (error) {
      logger.error({ workspaceId, error }, 'Failed to enable Auto-Post schedule');
      throw new Error('Failed to configure auto-posting schedule in Upstash');
    }
  }

  /**
   * Deletes an existing schedule in Upstash
   * @param scheduleId The ID of the schedule to delete
   */
  async disableAutoPost(scheduleId: string): Promise<void> {
    if (!scheduleId) return;
    
    try {
      await this.client.schedules.delete(scheduleId);
      logger.info({ scheduleId }, 'Successfully disabled Auto-Post schedule');
    } catch (error) {
      logger.error({ scheduleId, error }, 'Failed to disable Auto-Post schedule');
      // We might not want to throw here if we're just cleaning up
    }
  }
}
