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

  async publishToConnectedAccounts(workspaceId: string, outputReference: any) {
    logger.info({ workspaceId, outputReference }, "Publishing asset to connected accounts");
    
    try {
      // Handle Video Assets
      if (outputReference?.videoUrl) {
        const caption = outputReference.caption || "Automated generated video #AI";
        const { FacebookPublisherService } = await import('./social/FacebookPublisherService');
        const { LinkedInPublisherService } = await import('./social/LinkedInPublisherService');

        logger.info({ workspaceId }, 'Attempting to publish video to Facebook...');
        let fbResult = await FacebookPublisherService.publishVideo(workspaceId, caption, outputReference.videoUrl);
        if (fbResult.success) {
          logger.info(`Successfully published video to Facebook: ${fbResult.postId}`);
        } else {
          logger.warn(`Failed to publish video to Facebook: ${fbResult.error}`);
        }

        logger.info({ workspaceId }, 'Attempting to publish video to LinkedIn...');
        let inResult = await LinkedInPublisherService.publishVideo(workspaceId, caption, outputReference.videoUrl);
        if (inResult.success) {
          logger.info(`Successfully published video to LinkedIn`);
        } else {
          logger.warn(`Failed to publish video to LinkedIn: ${inResult.error}`);
        }

        return { success: true, fbResult, inResult };
      }

      let base64Images: string[] = [];

      // Check if we have HTML to render from AI generation
      if (outputReference.type === 'carousel' && outputReference.slides && outputReference.slides.length > 0) {
        const { ImageRenderingService } = await import('./ImageRenderingService');
        for (const slide of outputReference.slides) {
          if (slide.html) {
             const b64 = await ImageRenderingService.renderHtmlToBase64(slide.html, 1080, 1350);
             base64Images.push(b64);
          }
        }
      } else if (outputReference.html_content || outputReference.html) {
        const { ImageRenderingService } = await import('./ImageRenderingService');
        const htmlToRender = outputReference.html_content || outputReference.html;
        const b64 = await ImageRenderingService.renderHtmlToBase64(htmlToRender, 1080, 1350);
        base64Images.push(b64);
      } else {
        // Fallback: Use image URLs
        let imageUrls: string[] = [];
        if (outputReference.urls && outputReference.urls.length > 0) {
          imageUrls = outputReference.urls;
        } else if (outputReference.imageUrl) {
          imageUrls = [outputReference.imageUrl];
        } else if (outputReference.image_url) {
          imageUrls = [outputReference.image_url];
        }

        if (imageUrls.length > 0) {
          const imageUrl = imageUrls[0];
          const imageResponse = await fetch(imageUrl);
          const arrayBuffer = await imageResponse.arrayBuffer();
          base64Images.push(Buffer.from(arrayBuffer).toString('base64'));
        }
      }

      if (base64Images.length === 0) {
        throw new Error("No images or HTML generated for this asset yet");
      }

      const caption = outputReference.caption || "Automated generated content #AI";
      
      const { FacebookPublisherService } = await import('./social/FacebookPublisherService');
      const { LinkedInPublisherService } = await import('./social/LinkedInPublisherService');

      logger.info({ workspaceId }, 'Attempting to publish to Facebook...');
      let fbResult = await FacebookPublisherService.publishPost(workspaceId, caption, base64Images);
      if (fbResult.success) {
        logger.info(`Successfully published asset to Facebook: ${fbResult.postId}`);
      } else {
        logger.warn(`Failed to publish to Facebook: ${fbResult.error}`);
      }

      logger.info({ workspaceId }, 'Attempting to publish to LinkedIn...');
      let inResult = await LinkedInPublisherService.publishPost(workspaceId, caption, base64Images);
      if (inResult.success) {
        logger.info(`Successfully published asset to LinkedIn`);
      } else {
        logger.warn(`Failed to publish to LinkedIn: ${inResult.error}`);
      }

      return { success: true, fbResult, inResult };
    } catch (err: any) {
      logger.error({ err, workspaceId }, "Failed to publish asset");
      throw err;
    }
  }
}
