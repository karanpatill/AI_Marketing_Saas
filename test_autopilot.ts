import { createAdminClient } from './src/lib/supabaseServer';
import { AIGenerationService } from './src/backend/services/AIGenerationService';
import { AutomationRepository } from './src/backend/repositories/AutomationRepository';

async function test() {
  const supabase = createAdminClient();
  const workspaceId = '36fff920-ae73-4332-990f-3fea35c79a74';
  const autoRepo = new AutomationRepository(supabase);
  
  let nextPost = await autoRepo.getNextPlannedPost(workspaceId);
  console.log('Using calendar entry:', nextPost);

  const triggerAiService = new AIGenerationService(supabase);
  
  const jobType = nextPost?.post_type === 'carousel' ? 'generate_carousel' : 'generate_post';
  
  const job = await triggerAiService.enqueueJob({
    userId: '00000000-0000-0000-0000-000000000000',
    workspaceId: workspaceId,
    jobType: jobType,
    payload: {
      type: nextPost?.post_type || 'post',
      topic: nextPost?.topic || nextPost?.title || 'Testing',
      auto_published: true,
      calendar_id: nextPost?.id
    }
  });

  console.log('Enqueued Job:', job.id);

  // Now process the job immediately to simulate the worker
  console.log('Processing job locally for testing...');
  await triggerAiService.processJob(job.id, jobType, {
    type: nextPost?.post_type || 'post',
    topic: nextPost?.topic || nextPost?.title || 'Testing',
    auto_published: true,
    calendar_id: nextPost?.id
  });
  console.log('Job processed successfully!');
}
test().catch(console.error);
