import { SupabaseClient } from "@supabase/supabase-js";
import { AutomationRepository } from "../repositories/AutomationRepository";
import { InstagramPublisherService } from "./social/InstagramPublisherService";
import { logger } from "../utils/logger";

export class AutomationPublishingService {
  private autoRepo: AutomationRepository;

  constructor(private supabase: SupabaseClient) {
    this.autoRepo = new AutomationRepository(supabase);
  }

  async runPublisher() {
    logger.info("Starting Automation Publishing Service");
    const posts = await this.autoRepo.getPostsNeedingPublishing();

    for (const post of posts) {
      try {
        await this.publishPost(post);
      } catch (error: any) {
        logger.error({ error, postId: post.id }, "Failed to publish post");
        await this.autoRepo.updateCalendarEntry(post.id, { 
          status: "failed", 
          publishing_error: error.message 
        });
      }
    }
  }

  private async publishPost(post: any) {
    logger.info(`Publishing post ${post.id}`);

    // Verify it has generated images
    if (!post.image_urls || post.image_urls.length === 0) {
      throw new Error("No images generated for this post yet");
    }

    const imageUrl = post.image_urls[0]; // Take the first image for now
    const caption = post.caption || post.topic; // Fallback to topic if no caption generated

    const result = await InstagramPublisherService.publishSinglePost(
      post.workspace_id,
      imageUrl,
      caption
    );

    if (result.success) {
      logger.info(`Successfully published post ${post.id} to Instagram: ${result.permalink}`);
      await this.autoRepo.updateCalendarEntry(post.id, {
        status: "published"
      });
    } else {
      throw new Error(result.error || "Unknown Instagram publishing error");
    }
  }
}
