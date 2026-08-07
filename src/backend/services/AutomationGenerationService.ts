import { SupabaseClient } from "@supabase/supabase-js";
import { AutomationRepository } from "../repositories/AutomationRepository";
import { BillingService } from "./BillingService";
import { AIGenerationService } from "./AIGenerationService";
import { logger } from "../utils/logger";

export class AutomationGenerationService {
  private autoRepo: AutomationRepository;
  private billingService: BillingService;
  private aiService: AIGenerationService;

  constructor(private supabase: SupabaseClient) {
    this.autoRepo = new AutomationRepository(supabase);
    this.billingService = new BillingService(supabase);
    this.aiService = new AIGenerationService(supabase);
  }

  async runGenerator() {
    logger.info("Starting Automation Generation Service");
    const posts = await this.autoRepo.getPostsNeedingGeneration();

    for (const post of posts) {
      try {
        await this.generateForPost(post);
      } catch (error: any) {
        console.error("GENERATION ERROR DETAILS:", error);
        logger.error({ error, postId: post.id }, "Failed to generate post");
        await this.autoRepo.updateCalendarEntry(post.id, { 
          status: "failed", 
          publishing_error: error.message 
        });
      }
    }
  }

  private async generateForPost(post: any) {
    logger.info(`Generating content for post ${post.id}`);
    
    // Fetch org_id from workspace
    const { data: ws } = await this.supabase
      .from('workspaces')
      .select('org_id, owner_id')
      .eq('id', post.workspace_id)
      .single();
      
    // Ultimate fallback for user_id
    let userId = post.user_id || ws?.owner_id;
    if (!userId) {
       const { data: brand } = await this.supabase
         .from('brand_dna')
         .select('user_id')
         .eq('workspace_id', post.workspace_id)
         .limit(1)
         .single();
       userId = brand?.user_id;
    }
    // If absolutely no user ID, use a system zero UUID that postgres accepts for UUID columns
    if (!userId) userId = "00000000-0000-0000-0000-000000000000";

    const orgId = ws?.org_id;

    // 1. Deduct tokens (only if part of an org)
    const type = post.post_type || "static_post";
    if (orgId) {
      await this.billingService.deductTokensForGeneration(orgId, type);
    } else {
      logger.warn(`Skipping token deduction for workspace ${post.workspace_id} because it lacks an org_id`);
    }

    let jobType = 'generate_static';
    if (type === 'carousel') jobType = 'generate_carousel';
    if (type === 'video') jobType = 'generate_video';

    // 2. Enqueue Job
    const jobInput = {
      userId: userId, 
      workspaceId: post.workspace_id,
      jobType,
      payload: {
        prompt: post.topic,
        topic: post.topic, // Pass topic explicitly
        calendar_id: post.id, // Required for job callback
        autoPublish: false // We publish via another cron
      },
    };

    const job = await this.aiService.enqueueJob(jobInput);

    // 3. Update Calendar Entry
    await this.autoRepo.updateCalendarEntry(post.id, {
      status: "generating"
    });

    logger.info(`Enqueued job ${job.id} for post ${post.id}`);
    
    // Note: We need a mechanism (like a webhook or another polling cron) 
    // to check when the job is done and update the calendar status to "scheduled"
    // and store the image_urls. For this MVP, we will simulate this by directly 
    // updating it to scheduled if we have a polling mechanism later.
    // For now, we leave it as generating.
  }
}
