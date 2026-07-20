import { useState, useEffect, useCallback } from 'react';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface GenerationJob {
  id: string;
  job_type: string;
  status: JobStatus;
  result?: any;
  error?: string;
}

export function useGenerationJob(jobId: string | null, onCompleted?: (result: any) => void, onError?: (error: string) => void) {
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const fetchJob = useCallback(async () => {
    if (!jobId) return;

    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        const currentJob: GenerationJob = data.job;
        setJob(currentJob);

        if (currentJob.status === 'completed') {
          setIsPolling(false);
          if (onCompleted) onCompleted(currentJob.result);
        } else if (currentJob.status === 'failed') {
          setIsPolling(false);
          if (onError) onError(currentJob.error || 'Job failed');
        }
      }
    } catch (err) {
      console.error('Failed to poll job status:', err);
    }
  }, [jobId, onCompleted, onError]);

  useEffect(() => {
    if (jobId && isPolling) {
      fetchJob(); // Fetch immediately once
      const interval = setInterval(fetchJob, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [jobId, isPolling, fetchJob]);

  const startPolling = useCallback(() => {
    setIsPolling(true);
  }, []);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  return {
    job,
    isPolling,
    startPolling,
    stopPolling
  };
}
