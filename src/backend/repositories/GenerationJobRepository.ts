import { SupabaseClient } from '@supabase/supabase-js';
import { CreateJobInput, Job, JobStatus } from '../types/jobs';

export class GenerationJobRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createJob(input: CreateJobInput): Promise<Job> {
    const { data, error } = await this.supabase
      .from('jobs')
      .insert({
        workspace_id: input.workspaceId,
        user_id: input.userId,
        project_id: input.projectId,
        job_type: input.jobType,
        status: 'queued',
        input_payload: input.payload,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateJobStatus(id: string, status: JobStatus, payload?: any): Promise<Job> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (payload?.progress !== undefined) updateData.progress = payload.progress;
    if (payload?.current_step !== undefined) updateData.current_step = payload.current_step;
    if (payload?.output !== undefined) updateData.output_reference = payload.output;
    if (payload?.error !== undefined) updateData.error = payload.error;
    if (status === 'processing') updateData.started_at = new Date().toISOString();
    if (status === 'completed' || status === 'failed') updateData.completed_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getJob(id: string): Promise<Job | null> {
    const { data, error } = await this.supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
}
