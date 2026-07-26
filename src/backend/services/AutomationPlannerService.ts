import { SupabaseClient } from "@supabase/supabase-js";
import { AutomationRepository } from "../repositories/AutomationRepository";
import { BrandRepository } from "../repositories/BrandRepository";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../utils/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export class AutomationPlannerService {
  private autoRepo: AutomationRepository;
  private brandRepo: BrandRepository;

  constructor(private supabase: SupabaseClient) {
    this.autoRepo = new AutomationRepository(supabase);
    this.brandRepo = new BrandRepository(supabase);
  }

  async runPlanner() {
    logger.info("Starting Automation Planner Service");
    const workspaces = await this.autoRepo.getWorkspacesNeedingPlanning();

    for (const workspace of workspaces) {
      try {
        await this.planForWorkspace(workspace);
      } catch (error) {
        logger.error({ error, workspaceId: workspace.workspace_id }, "Failed to plan for workspace");
      }
    }
  }

  private async planForWorkspace(settings: any) {
    logger.info(`Planning for workspace ${settings.workspace_id}`);
    
    // Check if they already have enough planned content. We'll skip for now to simplify, 
    // or we can generate X posts based on settings.posts_per_week.
    
    // 1. Fetch Brand DNA
    const brands = await this.brandRepo.getBrandsByWorkspace(settings.workspace_id);
    const brand = brands.length > 0 ? brands[0] : null;

    if (!brand || !brand.dna) {
      logger.warn(`No brand DNA found for workspace ${settings.workspace_id}`);
      return;
    }

    // 2. Generate Topics using Gemini
    const topics = await this.generateTopicsFromGemini(brand.dna, settings.posts_per_week);

    // 3. Save to Calendar
    // We'll schedule them starting tomorrow
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(9, 0, 0, 0); // 9 AM

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      // Distribute based on content_mix_preferences
      const isCarousel = Math.random() < (settings.content_mix_preferences.carousel / 100);
      const postType = isCarousel ? "carousel" : "static";

      await this.autoRepo.createCalendarEntry({
        workspace_id: settings.workspace_id,
        post_type: postType,
        topic: topic,
        scheduled_time: currentDate.toISOString(),
        status: "planned"
      });

      // Increment date for the next post
      currentDate.setDate(currentDate.getDate() + Math.floor(7 / settings.posts_per_week));
    }

    logger.info(`Successfully planned ${topics.length} posts for workspace ${settings.workspace_id}`);
  }

  private async generateTopicsFromGemini(dna: any, count: number): Promise<string[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      You are an expert social media strategist. 
      Given the following brand DNA:
      ${JSON.stringify(dna)}

      Generate ${count} unique social media post topics or ideas that align perfectly with this brand.
      Return ONLY a JSON array of strings. No markdown formatting, no code blocks, just the raw JSON array.
      Example: ["Topic 1", "Topic 2"]
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Clean up potential markdown formatting (```json ... ```)
      const cleanedText = text.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
      
      return JSON.parse(cleanedText);
    } catch (error) {
      logger.error({ err: error }, "Failed to parse Gemini response for topics");
      // Fallback topics
      return Array.from({ length: count }, (_, i) => `Brand related topic ${i + 1}`);
    }
  }
}
