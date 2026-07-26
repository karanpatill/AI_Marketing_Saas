import { SupabaseClient } from '@supabase/supabase-js';
import { IGenerationModule, GenerationContext, GenerationResult } from '../interfaces/IGenerationModule';
import { logger } from '../../utils/logger';

export class GenerationManager {
  private modules: Map<string, IGenerationModule> = new Map();
  private supabase: SupabaseClient;

  constructor(supabaseAdmin: SupabaseClient) {
    this.supabase = supabaseAdmin;
  }

  registerModule(module: IGenerationModule) {
    this.modules.set(module.jobType, module);
  }

  async processJob(jobId: string): Promise<void> {
    const { data: job, error } = await this.supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      logger.error({ jobId, error }, 'Job not found or error fetching job');
      return;
    }

    const generator = this.modules.get(job.job_type);
    if (!generator) {
      await this.updateJobStatus(jobId, 'failed', { error: 'No generator found for job type: ' + job.job_type });
      return;
    }

    try {
      const updateProgress = async (progress: number, step: string) => {
        await this.supabase.from('jobs').update({ progress, current_step: step, status: 'processing' }).eq('id', jobId);
      };

      await updateProgress(5, 'fetching_brand_context');
      // Fetch Brand context using the new os_modules schemas
      const { data: brand } = await this.supabase
        .from('brand_dna')
        .select('*')
        .eq('workspace_id', job.workspace_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      await updateProgress(10, 'building_context');
      const context = await generator.buildContext(job.input_payload, job.workspace_id);
      
      // Inject unified brand context
      if (brand) {
        context.brandContext = brand;
      }

      await updateProgress(20, 'building_prompt');
      const prompt = await generator.buildPrompt(context);

      const provider = generator.routeProvider(context);
      const optimizedPrompt = generator.optimizePrompt(prompt, provider);

      await updateProgress(40, 'executing_generation');
      const result = await generator.execute(optimizedPrompt, provider, context, updateProgress);

      if (result.status === 'completed') {
        const isValid = await generator.validateOutput(result.outputReference);
        if (!isValid) {
            throw new Error("Validation failed on generated output.");
        }
        // Save the asset before completing the job so it is available as soon as
        // the client receives the completed status.
        let assetType = 'other';
        if (job.job_type === 'generate_post') assetType = 'image';
        else if (job.job_type === 'generate_carousel') assetType = 'carousel';

        // Don't duplicate if we already saved it (some jobs might retry, though jobs usually just fail)
        const { error: assetError } = await this.supabase.from('assets').insert({
          workspace_id: job.workspace_id,
          project_id: null,
          job_id: job.id,
          type: assetType,
          url: 'generated', // We store the actual output in metadata for HTML/JSON since there is no single URL
          metadata_json: result.outputReference
        });
        if (assetError) {
          throw new Error(`Failed to save generated asset: ${assetError.message}`);
        }

        await this.updateJobStatus(jobId, 'completed', { output: result.outputReference, progress: 100, current_step: 'finished' });

        // Save to calendar if applicable
        if (job.input_payload?.calendarItemId) {
          await this.supabase.from('content_calendar').update({
            status: 'completed',
            post: result.outputReference,
            updated_at: new Date().toISOString()
          }).eq('id', job.input_payload.calendarItemId);
        }

      } else {
        let friendlyError = result.error || 'Unknown execution error';
        if (typeof friendlyError === 'string' && (friendlyError.includes('429 Too Many Requests') || friendlyError.includes('Quota exceeded') || friendlyError.includes('quota'))) {
          friendlyError = 'Our AI generation system is currently experiencing exceptionally high demand and has temporarily reached its safety limits. Please wait a moment and try generating your strategy again.';
        }
        await this.updateJobStatus(jobId, 'failed', { error: friendlyError });
      }

    } catch (err: any) {
      logger.error({ jobId, error: err.message }, 'Job execution failed');
      
      let friendlyError = err.message || 'An unknown error occurred during generation.';
      if (friendlyError.includes('429 Too Many Requests') || friendlyError.includes('Quota exceeded') || friendlyError.includes('quota')) {
        friendlyError = 'Our AI generation system is currently experiencing exceptionally high demand and has temporarily reached its safety limits. Please wait a moment and try generating your strategy again.';
      }

      await this.updateJobStatus(jobId, 'failed', { error: friendlyError });
    }
  }

  private async updateJobStatus(jobId: string, status: string, payload: any = {}) {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (payload.progress) updateData.progress = payload.progress;
    if (payload.current_step) updateData.current_step = payload.current_step;
    if (payload.output) updateData.output_reference = payload.output;
    if (payload.error) updateData.error = { message: payload.error };
    if (status === 'completed' || status === 'failed') updateData.completed_at = new Date().toISOString();

    await this.supabase.from('jobs').update(updateData).eq('id', jobId);
  }
}
