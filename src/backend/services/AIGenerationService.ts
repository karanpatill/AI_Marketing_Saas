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

  constructor(supabaseAdmin: SupabaseClient) {
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
      
      // Force local background execution to avoid QStash dummy token errors
      logger.warn('Forcing local background execution for AI job.');
      this.processJob(job.id, job.job_type, job.input_payload).catch(err => {
        logger.error({ err, jobId: job.id }, 'Background execution failed');
      });
      
      return job;
    } catch (error: any) {
      logger.error({ err: error, input }, 'Failed to create job in repository');
      throw new BaseError('Failed to create job', 500, 'CREATE_JOB_FAILED', error.message);
    }
  }

  async processJob(jobId: string, jobType: string, payload: any): Promise<void> {
    logger.info({ jobId, jobType }, 'Processing job in Universal Engine');
    await this.generationManager.processJob(jobId);
  }
}
