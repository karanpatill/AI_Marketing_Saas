import { createAdminClient } from '@/lib/supabaseServer';
import { integrationManager } from '../integrations/IntegrationManager';

export class PublishingService {
  
  /**
   * Immediately attempts to publish an asset in the queue.
   * If it fails, it increments the retry count and leaves it in the queue for the background worker.
   */
  public static async processPublishJob(queueId: string) {
    const supabase = createAdminClient();

    // 1. Fetch the job details
    const { data: job, error: jobError } = await supabase
      .from('publishing_queue')
      .select('*, workspace_integrations(*), assets(*)')
      .eq('id', queueId)
      .single();

    if (jobError || !job) {
      console.error(`Failed to find publishing job ${queueId}`);
      return;
    }

    if (job.status === 'published' || job.status === 'cancelled') {
      return; // Already handled
    }

    const providerName = job.workspace_integrations.provider;
    const accessToken = job.workspace_integrations.access_token;
    const contentToPublish = job.assets.metadata?.final_copy || 'Check out our latest update!';

    try {
      // 2. Mark as processing
      await supabase.from('publishing_queue').update({ status: 'publishing' }).eq('id', queueId);

      // 3. Get the provider adapter (e.g. LinkedInProvider)
      const provider = integrationManager.getProvider(providerName);

      // 4. Execute the publish method
      // The provider internally handles content adaptation/validation (e.g., character limits)
      const result = await provider.publish(accessToken, {
        content: contentToPublish,
        mediaUrls: job.assets.file_url ? [job.assets.file_url] : []
      });

      if (result.success) {
        // 5. Mark success
        await supabase.from('publishing_queue').update({
          status: 'published',
          published_at: new Date().toISOString(),
          platform_post_id: result.platformPostId,
          platform_post_url: result.platformPostUrl
        }).eq('id', queueId);
        
        console.log(`[PublishingService] Job ${queueId} published successfully to ${providerName}.`);
      } else {
        throw new Error(result.error || 'Unknown provider error');
      }

    } catch (e: any) {
      // 6. Handle Failure / Retry logic
      console.error(`[PublishingService] Job ${queueId} failed: ${e.message}`);
      
      const nextRetryCount = job.retry_count + 1;
      const status = nextRetryCount >= job.max_retries ? 'failed' : 'scheduled';
      
      await supabase.from('publishing_queue').update({
        status: status,
        error_message: e.message,
        retry_count: nextRetryCount
      }).eq('id', queueId);
    }
  }
}
