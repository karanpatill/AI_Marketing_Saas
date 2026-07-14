import { supabase } from "@/lib/supabase";
import { getBrandMemoryContext } from "@/lib/brandMemory";

export interface GeneratedCampaignPayload {
  title: string;
  theme: string;
  description: string;
  targetAudience: string;
  posts: Array<{
    dayOffset: number;
    postType: "static" | "carousel" | "video";
    title: string;
    conceptBrief: string;
    cta: string;
  }>;
}

async function callLLMForCampaign(prompt: string): Promise<GeneratedCampaignPayload> {
  const claudeKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (claudeKey) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": claudeKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2500,
        messages: [{ role: "user", content: prompt + "\n\nProvide ONLY the raw JSON object matching the interface (no markdown, no backticks)." }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API failed in Campaign Planner: ${response.status}`);
    }

    const resJson = await response.json();
    const text = resJson.content?.[0]?.text || "";
    return JSON.parse(text.trim());
  } else if (geminiKey) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API failed in Campaign Planner: ${response.status}`);
    }

    const resJson = await response.json();
    const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Empty response from Gemini API in Campaign Planner");
    }
    return JSON.parse(text.trim());
  } else {
    throw new Error("Missing active API keys for Campaign Planner.");
  }
}

/**
 * Creates a brand marketing campaign and dynamically populates calendar events for it.
 */
export async function createMarketingCampaign(
  brandDnaId: string,
  titleInput: string,
  campaignType: string,
  descriptionInput: string,
  platforms: string[]
): Promise<string> {
  const brandMemory = await getBrandMemoryContext(brandDnaId);

  const prompt = `You are a world-class Marketing Campaign Architect.
Create a detailed campaign and content schedule based on the following user input and brand memory:

--- BRAND MEMORY ---
${brandMemory.systemPromptInjection}

--- CAMPAIGN REQUIREMENTS ---
Campaign Title: ${titleInput}
Campaign Type: ${campaignType}
Campaign Description/Brief: ${descriptionInput}
Target Platforms: ${platforms.join(", ")}

Instructions:
Generate a cohesive campaign plan. Output exactly 5 specific, highly engaging scheduled post concepts.
Each post concept must specify which day it should be posted (dayOffset 1 to 14 days), its type (static, carousel, or video), and a clear brief.

Return ONLY a valid JSON object matching this interface (no markdown, no backticks, just raw JSON):
interface GeneratedCampaignPayload {
  title: string; // Refined campaign title
  theme: string; // The core visual/message theme of the campaign
  description: string; // Concise campaign overview
  targetAudience: string; // Refined target persona for this campaign
  posts: Array<{
    dayOffset: number; // Scheduled day, between 1 and 14
    postType: "static" | "carousel" | "video";
    title: string; // Post title
    conceptBrief: string; // Detailed layout design outline, hooks, and content briefs
    cta: string; // Target call to action
  }>;
}`;

  const plan = await callLLMForCampaign(prompt);

  // 1. Write the campaign to public.brand_campaigns
  const { data: campaign, error: campaignError } = await supabase
    .from("brand_campaigns")
    .insert({
      brand_dna_id: brandDnaId,
      title: plan.title,
      theme: plan.theme,
      description: plan.description,
      target_audience: plan.targetAudience,
      platforms: platforms,
      status: "active"
    })
    .select()
    .single();

  if (campaignError || !campaign) {
    throw new Error(`Failed to create campaign record: ${campaignError?.message}`);
  }

  // 2. Generate and write the 5 planned posts to public.brand_calendar
  const calendarRows = plan.posts.map(post => {
    const postDate = new Date();
    postDate.setDate(postDate.getDate() + post.dayOffset);

    return {
      brand_dna_id: brandDnaId,
      campaign_id: campaign.id,
      date: postDate.toISOString().split("T")[0],
      post_type: post.postType,
      title: post.title,
      concept_brief: post.conceptBrief,
      cta: post.cta,
      status: "planned"
    };
  });

  const { error: calendarError } = await supabase
    .from("brand_calendar")
    .insert(calendarRows);

  if (calendarError) {
    throw new Error(`Failed to populate campaign calendar posts: ${calendarError.message}`);
  }

  return campaign.id;
}
