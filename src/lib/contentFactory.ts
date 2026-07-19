import { supabase } from "@/lib/supabase";
import { getBrandMemoryContext } from "@/lib/brandMemory";
import { callLLM, getUnsplashFallbackImage } from "@/lib/aiProvider";

export interface GeneratedContentPayload {
  caption: string;
  visualPrompt: string;
  generatedAssets: any;
  hooks: string[];
  ctas: string[];
  hashtags: string[];
}

async function generateImageWithFal(prompt: string): Promise<string> {
  const falKey = process.env.FAL_API_KEY || process.env.FAL_KEY;
  let imageUrl: string | null = null;

  if (falKey) {
    try {
      console.log("Triggering Fal.ai Image Generation (SD 3.5 Large) for prompt:", prompt);
      const response = await fetch("https://fal.run/fal-ai/stable-diffusion-v35-large", {
        method: "POST",
        headers: {
          "Authorization": `Key ${falKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: prompt,
          image_size: "square_hd",
          num_inference_steps: 28,
          enable_safety_checker: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        imageUrl = data.images?.[0]?.url || null;
      } else {
        console.warn("Fal.ai API failed (using Unsplash fallback):", await response.text());
      }
    } catch (err) {
      console.error("Fal.ai fetch error (using Unsplash fallback):", err);
    }
  }

  if (!imageUrl) {
    console.log("Using dynamic Unsplash fallback for calendar post asset image...");
    imageUrl = await getUnsplashFallbackImage(prompt || "business workspace technology graphic", "squarish");
  }

  return imageUrl;
}

/**
 * Generates marketing post copy, hooks, CTAs, hashtags, and visual prompts for a scheduled calendar cell.
 */
export async function generateContentForCalendarItem(calendarItemId: string): Promise<string> {
  // 1. Fetch calendar item details
  const { data: item, error: itemError } = await supabase
    .from("brand_calendar")
    .select("*")
    .eq("id", calendarItemId)
    .single();

  if (itemError || !item) {
    throw new Error(`Failed to fetch calendar item details: ${itemError?.message}`);
  }

  // Fetch campaign details in a separate query if campaign_id is present
  let campaign = null;
  if (item.campaign_id) {
    const { data: campData, error: campError } = await supabase
      .from("brand_campaigns")
      .select("*")
      .eq("id", item.campaign_id)
      .single();
    if (!campError && campData) {
      campaign = campData;
    }
  }

  // 2. Fetch Brand Memory
  const brandMemory = await getBrandMemoryContext(item.brand_dna_id);

  // 3. Compile format-specific instructions
  let formatInstructions = "";
  if (item.post_type === "static") {
    formatInstructions = `
Format: Static Post
Output:
- Caption: Engaging B2B social copy.
- VisualPrompt: Highly descriptive design/photo prompt for Stable Diffusion 3.5 Large (concept graphic backdrop, lighting).
- GeneratedAssets: JSON object containing {"imageUrl": "PLACEHOLDER_GENERATION_DRAFT"}.
`;
  } else if (item.post_type === "carousel") {
    formatInstructions = `
Format: Multi-slide Carousel
Output:
- Caption: Catchy introduction caption and slide-swiping hook.
- VisualPrompt: General style guide prompt for the slides.
- GeneratedAssets: JSON object containing an array of slides (exactly 5 slides):
  "slides": [
    {
      "slideNumber": 1,
      "headline": "Slide Headline",
      "bodyText": "Slide body summary / bullet points",
      "visualDescription": "Graphic backdrop/illustration suggestion for this slide"
    }
  ]
`;
  } else if (item.post_type === "video") {
    formatInstructions = `
Format: short-form Video Reel / Video
Output:
- Caption: Catchy description with targeted hooks and value pointers.
- VisualPrompt: Detailed B-roll background generation video prompt for LongCat-Video (motion, style, lighting).
- GeneratedAssets: JSON object containing timing-aware script subtitles:
  "script": {
    "voiceover": "Full voiceover script to read out loud (under 40 seconds)",
    "timings": [
      { "time": "0s - 3s", "subtitles": "Hook text display" },
      { "time": "3s - 12s", "subtitles": "Main feature details" },
      { "time": "12s - 25s", "subtitles": "Secondary feature detail" },
      { "time": "25s - 30s", "subtitles": "Call-to-action text" }
    ]
  }
`;
  }

  // 4. Build prompt
  const prompt = `You are a world-class Copywriter and Creative Director specializing in B2B SaaS marketing campaigns.
Create the final publishable creative and copywriting blueprint for this planned post:

--- PLANNED POST DETAILS ---
Post Title: ${item.title}
Post Type: ${item.post_type}
Post Concept Brief: ${item.concept_brief}
Target CTA: ${item.cta || "Visit website"}
Parent Campaign Details: ${campaign ? `${campaign.title} - Theme: ${campaign.theme}` : "None"}

--- BRAND IDENTITY MEMORY ---
${brandMemory.systemPromptInjection}

--- FORMAT-SPECIFIC RULES ---
${formatInstructions}

Return ONLY a valid JSON object matching this TypeScript interface (no markdown, no backticks, just raw JSON):
interface GeneratedContentPayload {
  caption: string; // The social media post caption
  visualPrompt: string; // The text-to-image/video visual generator prompt
  generatedAssets: any; // Format-specific JSON object as detailed in rules
  hooks: string[]; // 2-3 copywriting hook variations evaluated for this post
  ctas: string[]; // 1-2 CTA variations
  hashtags: string[]; // Array of 5-8 relevant hashtags
}`;

  const responseText = await callLLM(prompt);
  let jsonText = responseText.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```$/, "").trim();
  }
  const generated = JSON.parse(jsonText) as GeneratedContentPayload;

  // === LIVE FAL.AI MEDIA GENERATION INTEGRATION ===
  if (item.post_type === "static" && generated.visualPrompt) {
    const imageUrl = await generateImageWithFal(generated.visualPrompt);
    if (imageUrl) {
      generated.generatedAssets = { imageUrl };
    }
  } else if (item.post_type === "carousel" && generated.generatedAssets?.slides?.[0]) {
    // Generate a cover image for the first slide of the carousel
    const coverPrompt = generated.generatedAssets.slides[0].visualDescription || generated.visualPrompt;
    const imageUrl = await generateImageWithFal(coverPrompt);
    if (imageUrl) {
      generated.generatedAssets.coverUrl = imageUrl;
    }
  } else if (item.post_type === "video" && generated.visualPrompt) {
    // Generate a visual storyboard/thumbnail frame for the video
    const thumbUrl = await generateImageWithFal(generated.visualPrompt);
    if (thumbUrl) {
      generated.generatedAssets.thumbnailUrl = thumbUrl;
    }
  }

  // 5. Save the generated asset to public.brand_posts
  const { data: postResult, error: postError } = await supabase
    .from("brand_posts")
    .insert({
      brand_dna_id: item.brand_dna_id,
      campaign_id: item.campaign_id || null,
      post_type: item.post_type,
      caption: generated.caption,
      visual_prompt: generated.visualPrompt,
      generated_assets: generated.generatedAssets,
      hooks: generated.hooks,
      ctas: generated.ctas,
      hashtags: generated.hashtags,
      is_winning: false,
      engagement_score: 0.0
    })
    .select()
    .single();

  if (postError || !postResult) {
    throw new Error(`Failed to save generated post asset: ${postError?.message}`);
  }

  // 6. Update the public.brand_calendar item status to completed
  const { error: calendarUpdateError } = await supabase
    .from("brand_calendar")
    .update({
      status: "completed",
      post_id: postResult.id
    })
    .eq("id", calendarItemId);

  if (calendarUpdateError) {
    throw new Error(`Failed to update calendar status: ${calendarUpdateError.message}`);
  }

  return postResult.id;
}
