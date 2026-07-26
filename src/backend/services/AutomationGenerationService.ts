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
    
    const orgId = post.workspaces?.org_id;
    if (!orgId) {
      throw new Error("No org_id found for workspace");
    }

    // 1. Deduct tokens
    const type = post.post_type === "carousel" ? "carousel" : "static_post";
    await this.billingService.deductTokensForGeneration(orgId, type);

    // 2. Enqueue Job
    const jobInput = {
      userId: post.user_id || "system", // Fallback for types
      workspaceId: post.workspace_id,
      jobType: type === "carousel" ? "carousel_generation" : "image_generation",
      payload: {
        prompt: post.topic,
        topic: post.topic, // Pass topic explicitly
        autoPublish: false // We publish via another cron
      },
    };

    const job = await this.aiService.enqueueJob(jobInput);

    // 3. Update Calendar Entry
    await this.autoRepo.updateCalendarEntry(post.id, {
      status: "generating",
      job_id: job.id
    });

    logger.info(`Enqueued job ${job.id} for post ${post.id}`);
    
    // Note: We need a mechanism (like a webhook or another polling cron) 
    // to check when the job is done and update the calendar status to "scheduled"
    // and store the image_urls. For this MVP, we will simulate this by directly 
    // updating it to scheduled if we have a polling mechanism later.
    // For now, we leave it as generating.
  }
}
