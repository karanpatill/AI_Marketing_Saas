import { supabase } from "@/lib/supabase";
import { getBrandMemoryContext } from "@/lib/brandMemory";

export interface ContentMixItem {
  platform: string;
  postType: string;
  recommendedCount: number;
  overrideCount: number;
}

/**
 * Calls the active LLM (Claude if key present, else Gemini) to generate recommended post distribution.
 */
async function callLLMForContentMix(prompt: string): Promise<Array<{ platform: string; postType: string; count: number }>> {
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
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt + "\n\nProvide ONLY the raw JSON array (no markdown, no backticks)." }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API failed with status ${response.status}`);
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
      throw new Error(`Gemini API failed with status ${response.status}`);
    }

    const resJson = await response.json();
    const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }
    return JSON.parse(text.trim());
  } else {
    throw new Error("Neither Claude API Key nor Gemini API Key is configured in environment variables.");
  }
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

  const recommendations = await callLLMForContentMix(prompt);

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
