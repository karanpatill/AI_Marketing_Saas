import { supabase } from "@/lib/supabase";
import { getBrandMemoryContext } from "@/lib/brandMemory";
import { callLLM } from "@/lib/aiProvider";

export interface ContentMixItem {
  platform: string;
  postType: string;
  recommendedCount: number;
  overrideCount: number;
}

/**
 * Generates and stores a recommended content requirement distribution plan.
 */
export async function generateContentMixRecommendation(brandDnaId: string): Promise<ContentMixItem[]> {
  // 1. Fetch Brand Memory
  const brandMemory = await getBrandMemoryContext(brandDnaId);

  // 2. Build Recommendation Prompt
  const prompt = `You are a world-class Social Media strategist.
Analyze the following Brand DNA and target objectives to recommend the optimal 30-day posting frequency distribution plan.

${brandMemory.systemPromptInjection}

--- RECOMMENDATION RULES ---
For each selected platform (listed in Brand DNA), recommend a specific quantity of monthly assets based on:
1. Industry best practices (e.g. LinkedIn converts best with text/image posts, Instagram with Reels/Carousels, YouTube with Shorts).
2. The brand's main marketing goal.

Return ONLY a valid JSON array of objects (no markdown, no backticks, just raw JSON array) matching this schema:
[
  {
    "platform": "string (lowercase, e.g., 'instagram', 'linkedin', 'facebook', 'youtube', 'x', 'pinterest')",
    "postType": "string (lowercase, e.g., 'static', 'carousel', 'video', 'story', 'shorts', 'long_video')",
    "count": "number (recommended monthly count, e.g., 10, 12, 15, 8)"
  }
]`;

  const responseText = await callLLM(prompt);
  
  // Sanitize code block wrappers if any
  let jsonText = responseText.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```$/, "").trim();
  }
  const recommendations = JSON.parse(jsonText) as Array<{ platform: string; postType: string; count: number }>;

  // 3. Prepare rows for upsert
  const upsertRows = recommendations.map(rec => ({
    brand_dna_id: brandDnaId,
    platform: rec.platform.toLowerCase(),
    post_type: rec.postType.toLowerCase(),
    recommended_count: rec.count,
    override_count: rec.count
  }));

  // Perform bulk upsert in Supabase using the unique constraint
  const { error } = await supabase
    .from("brand_content_mix")
    .upsert(upsertRows, { onConflict: "brand_dna_id,platform,post_type" });

  if (error) {
    throw new Error(`Failed to upsert content mix recommendations: ${error.message}`);
  }

  return getContentMixPlan(brandDnaId);
}

/**
 * Updates the user-defined override count for a specific platform asset type.
 */
export async function updateContentMixOverride(
  brandDnaId: string,
  platform: string,
  postType: string,
  newCount: number
): Promise<void> {
  const { error } = await supabase
    .from("brand_content_mix")
    .update({ override_count: newCount })
    .match({ 
      brand_dna_id: brandDnaId, 
      platform: platform.toLowerCase(), 
      post_type: postType.toLowerCase() 
    });

  if (error) {
    throw new Error(`Failed to update content mix override: ${error.message}`);
  }
}

/**
 * Retrieves the compiled content mix plan (recommended and overridden counts) for a brand.
 */
export async function getContentMixPlan(brandDnaId: string): Promise<ContentMixItem[]> {
  const { data, error } = await supabase
    .from("brand_content_mix")
    .select("platform, post_type, recommended_count, override_count")
    .eq("brand_dna_id", brandDnaId)
    .order("platform", { ascending: true });

  if (error) {
    throw new Error(`Failed to retrieve content mix plan: ${error.message}`);
  }

  return (data || []).map(row => ({
    platform: row.platform,
    postType: row.post_type,
    recommendedCount: row.recommended_count,
    overrideCount: row.override_count
  }));
}
