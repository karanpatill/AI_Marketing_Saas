import { SupabaseClient } from '@supabase/supabase-js';
import { GenerationJobRepository } from '../repositories/GenerationJobRepository';
import { CreateJobInput, Job } from '../types/jobs';
import { UpstashQueueProvider } from '../providers/UpstashQueueProvider';
import { BaseError } from '../utils/errors';
import { logger } from '../utils/logger';
import { GenerationManager } from '../ai/core/GenerationManager';
import { ImageGenerator } from '../ai/generators/ImageGenerator';
import { VideoGenerator } from '../ai/generators/VideoGenerator';
import { CarouselGenerator } from '../ai/generators/CarouselGenerator';

export class AIGenerationService {
  private jobRepo: GenerationJobRepository;
  private queueProvider: UpstashQueueProvider;
  private generationManager: GenerationManager;
  private supabase: SupabaseClient;

  constructor(supabaseAdmin: SupabaseClient) {
    this.supabase = supabaseAdmin;
    this.jobRepo = new GenerationJobRepository(supabaseAdmin);
    this.queueProvider = new UpstashQueueProvider();
    
    // Initialize Generation Engine
    this.generationManager = new GenerationManager(supabaseAdmin);
    this.generationManager.registerModule(new ImageGenerator());
    this.generationManager.registerModule(new VideoGenerator());
    this.generationManager.registerModule(new CarouselGenerator());
  }

  async enqueueJob(input: CreateJobInput): Promise<Job> {
    try {
      const job = await this.jobRepo.createJob(input);
      
      const hasQStash = process.env.QSTASH_TOKEN && 
                        process.env.QSTASH_TOKEN !== 'MISSING_QSTASH_TOKEN' && 
                        process.env.QSTASH_TOKEN !== 'dummy_token_for_local_dev';

      if (hasQStash) {
        logger.info({ jobId: job.id }, 'Enqueuing job to Upstash QStash for background execution');
        const { UpstashQueueProvider } = await import('../providers/UpstashQueueProvider');
        const queueProvider = new UpstashQueueProvider();
        await queueProvider.enqueue('ai-generations', {
          jobId: job.id,
          jobType: job.job_type,
          payload: job.input_payload
        });
      } else {
        // Force local background execution to avoid QStash dummy token errors
        logger.warn('Forcing local background execution for AI job.');
        this.processJob(job.id, job.job_type, job.input_payload).catch(err => {
          logger.error({ err, jobId: job.id }, 'Background execution failed');
        });
      }
      
      return job;
    } catch (error: any) {
      logger.error({ err: error, input }, 'Failed to create job in repository');
      throw new BaseError('Failed to create job', 500, 'CREATE_JOB_FAILED', error.message);
    }
  }

  async processJob(jobId: string, jobType: string, payload: any): Promise<void> {
    logger.info({ jobId, jobType }, 'Processing job in Universal Engine');
    await this.generationManager.processJob(jobId);

    // After generation is complete, check if we need to auto-publish
    if (payload?.auto_published) {
      try {
        const { data: job } = await this.supabase
          .from('jobs')
          .select('status, output_reference, workspace_id')
          .eq('id', jobId)
          .single();

        if (job && job.status === 'completed' && job.output_reference) {
          logger.info({ jobId }, 'Auto-publishing generated asset to social platforms');
          
          // Import here to avoid circular dependencies if any
          const { AutomationPublishingService } = await import('./AutomationPublishingService');
          const publisher = new AutomationPublishingService(this.supabase);
          
          await publisher.publishToConnectedAccounts(job.workspace_id, job.output_reference);

          if (payload?.calendar_id) {
            const { AutomationRepository } = await import('../repositories/AutomationRepository');
            const autoRepo = new AutomationRepository(this.supabase);
            await autoRepo.updateCalendarEntry(payload.calendar_id, {
              status: "published"
            });
            logger.info({ calendarId: payload.calendar_id }, 'Marked calendar entry as published');
          }
        }
      } catch (err) {
        logger.error({ err, jobId }, 'Failed to auto-publish generated campaign');
      }
    }
  }
}
