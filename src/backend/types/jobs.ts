export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Job {
  id: string;
  user_id: string;
  workspace_id: string;
  project_id?: string;
  job_type: string;
  status: JobStatus;
  provider?: string;
  provider_job_id?: string;
  priority: number;
  progress: number;
  current_step?: string;
  input_payload: any;
  output_reference?: any;
  error?: any;
  retry_count: number;
  max_retries: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateJobInput {
  userId: string;
  workspaceId: string;
  projectId?: string;
  jobType: string;
  payload: any;
}
