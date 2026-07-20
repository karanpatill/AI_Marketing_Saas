import { IQueueProvider } from './QueueProvider';
import { Client } from '@upstash/qstash';
import { logger } from '../utils/logger';
import { BaseError } from '../utils/errors';

export class UpstashQueueProvider implements IQueueProvider {
  private client: Client;

  constructor() {
    this.client = new Client({
      token: process.env.QSTASH_TOKEN || 'MISSING_QSTASH_TOKEN',
    });
  }

  async enqueue(queueName: string, payload: any, options?: { delaySeconds?: number }): Promise<string> {
    try {
      // With QStash, we typically publish to a URL (a Next.js API route acting as a worker).
      // For this implementation, we will use a base worker URL and append the queueName.
      // E.g., https://my-app.com/api/workers/${queueName}
      
      const baseUrl = process.env.WORKER_BASE_URL;
      if (!baseUrl) {
        throw new Error('WORKER_BASE_URL environment variable is required for QStash');
      }

      const destinationUrl = `${baseUrl.replace(/\/$/, '')}/${queueName}`;

      const res = await this.client.publishJSON({
        url: destinationUrl,
        body: payload,
        delay: options?.delaySeconds,
      });

      return res.messageId;
    } catch (error: any) {
      logger.error({ err: error, queueName, payload }, 'Failed to enqueue message to QStash');
      throw new BaseError('Queue Provider Error', 500, 'ENQUEUE_FAILED', error.message);
    }
  }

  async enqueueBatch(queueName: string, payloads: any[]): Promise<string[]> {
    const messageIds: string[] = [];
    for (const payload of payloads) {
      const id = await this.enqueue(queueName, payload);
      messageIds.push(id);
    }
    return messageIds;
  }
}
