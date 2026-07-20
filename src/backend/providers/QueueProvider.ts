import { logger } from '../utils/logger';

export interface EnqueueOptions {
  delaySeconds?: number;
}

/**
 * Abstract interface for queue systems (e.g. Upstash QStash or Inngest).
 */
export interface IQueueProvider {
  enqueue<T>(queueName: string, payload: T, options?: EnqueueOptions): Promise<string>;
}

export class MockQueueProvider implements IQueueProvider {
  async enqueue<T>(queueName: string, payload: T, options?: EnqueueOptions): Promise<string> {
    logger.info({ queueName, payload, options }, 'Job enqueued (mock)');
    return 'mock-job-id';
  }
}
