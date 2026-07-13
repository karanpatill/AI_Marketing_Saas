import { supabase } from "@/lib/supabase";

export interface BrandMemoryContext {
  brandName: string;
  website: string;
  industry: string;
  category: string;
  businessDescription: string;
  usp: string;
  mission: string;
  vision: string;
  brandPersonality: string;
  brandValues: string[];
  products: string[];
  services: string[];
  customerPersonas: string;
  competitors: string[];
  
  // Style and colors
  primaryColor: string;
  secondaryColor: string;
  primaryFont: string;
  bodyFont: string;
  approvedMoodboardName: string;
  
  // Dynamic Context for Prompts
  systemPromptInjection: string; 
  winningHooks: string[];
  winningCtas: string[];
}

/**
 * Compiles a comprehensive context block of the brand's memory for direct injection into LLM prompts.
 */
export async function getBrandMemoryContext(brandDnaId: string): Promise<BrandMemoryContext> {
  // 1. Fetch DNA
  const { data: dna, error: dnaError } = await supabase
    .from("brand_dna")
    .select("*")
    .eq("id", brandDnaId)
    .single();

  if (dnaError || !dna) {
    throw new Error(`Failed to fetch Brand DNA for ID: ${brandDnaId}. Error: ${dnaError?.message}`);
  }

  // 2. Fetch Assets (Colors, Fonts, Logo Studio Data)
  const { data: assets, error: assetsError } = await supabase
    .from("brand_assets")
    .select("*")
    .eq("brand_dna_id", brandDnaId)
    .single();

  // Parse colors and typography
  let primaryColor = "#6C47FF";
  let secondaryColor = "#00D4AA";
  let primaryFont = "Plus Jakarta Sans";
  let bodyFont = "Inter";

  if (!assetsError && assets) {
    const logoStudio = assets.logo_studio_data || {};
    if (logoStudio.colors) {
      primaryColor = logoStudio.colors.primaryHex || primaryColor;
      secondaryColor = logoStudio.colors.secondaryHex || secondaryColor;
    }
    if (logoStudio.typography) {
      primaryFont = logoStudio.typography.primaryFont || primaryFont;
      bodyFont = logoStudio.typography.bodyFont || bodyFont;
    }
  }

  // 3. Fetch winning posts/designs (engagement_score > 7.0 or is_winning = true)
  const { data: winningPosts } = await supabase
    .from("brand_posts")
    .select("caption, hooks, ctas, post_type")
    .eq("brand_dna_id", brandDnaId)
    .or("is_winning.eq.true,engagement_score.gte.7.0")
    .order("created_at", { ascending: false })
    .limit(5);

  const winningHooks: string[] = [];
  const winningCtas: string[] = [];
  winningPosts?.forEach(post => {
    if (post.hooks && Array.isArray(post.hooks)) {
      winningHooks.push(...post.hooks);
    }
    if (post.ctas && Array.isArray(post.ctas)) {
      winningCtas.push(...post.ctas);
    }
  });

  // 4. Fetch memory bank items
  const { data: memoryBankItems } = await supabase
    .from("brand_memory_bank")
    .select("content, item_type")
    .eq("brand_dna_id", brandDnaId)
    .order("success_rate", { ascending: false })
    .limit(20);

  const customHooks = memoryBankItems?.filter(i => i.item_type === "hook").map(i => i.content) || [];
  const customCtas = memoryBankItems?.filter(i => i.item_type === "cta").map(i => i.content) || [];
  const customHashtags = memoryBankItems?.filter(i => i.item_type === "hashtag").map(i => i.content) || [];

  const moodboard = dna.approved_moodboard || {};

  // Build the unified LLM prompt context injection block
  const systemPromptInjection = `
You are acting with the official AI Brand Memory of ${dna.brand_name}. 
All content you generate MUST strictly adhere to this memory without exception.

--- BRAND CORE IDENTITY ---
Brand Name: ${dna.brand_name}
Website: ${dna.website || "N/A"}
Industry/Category: ${dna.industry} (${dna.category || "General"})
Business Description: ${dna.business_description}
USP: ${dna.usp}
Mission: ${dna.mission}
Vision: ${dna.vision || "N/A"}
Tone & Personality: ${dna.brand_personality || "Professional & authoritative"}
Core Brand Values: ${(dna.brand_values || []).join(", ")}
Target Audience: ${dna.target_audience}
Customer Personas: ${dna.customer_personas || "N/A"}
Products: ${(dna.products || []).join(", ")}
Services: ${(dna.services || []).join(", ")}
Competitors: ${(dna.competitors || []).join(", ")}

--- VISUAL BLUEPRINT ---
Primary Brand Color: ${primaryColor}
Secondary Brand Color: ${secondaryColor}
Headline Typography Font: ${primaryFont}
Body Typography Font: ${bodyFont}
Approved Visual Theme/Style: ${moodboard.name || "Modern Minimalist"} (${moodboard.tagline || ""})
Mood Palette Colors: ${(moodboard.palette || []).map((p: any) => `${p.name}: ${p.hex}`).join(", ")}

--- PERFORMANCE MEMORY (LEARNED HIGH-CONVERTING ELEMENTS) ---
${winningHooks.length > 0 ? `Proven Successful Hooks:\n- ${winningHooks.slice(0, 5).join("\n- ")}` : ""}
${winningCtas.length > 0 ? `Proven Successful CTAs:\n- ${winningCtas.slice(0, 5).join("\n- ")}` : ""}
${customHooks.length > 0 ? `Custom Hooks Bank:\n- ${customHooks.slice(0, 5).join("\n- ")}` : ""}
${customCtas.length > 0 ? `Custom CTAs Bank:\n- ${customCtas.slice(0, 5).join("\n- ")}` : ""}
${customHashtags.length > 0 ? `Custom Brand Hashtags:\n- ${customHashtags.slice(0, 10).join(", ")}` : ""}
`;

  return {
    brandName: dna.brand_name,
    website: dna.website || "",
    industry: dna.industry,
    category: dna.category || "General",
    businessDescription: dna.business_description,
    usp: dna.usp,
    mission: dna.mission,
    vision: dna.vision || "",
    brandPersonality: dna.brand_personality,
    brandValues: dna.brand_values || [],
    products: dna.products || [],
    services: dna.services || [],
    customerPersonas: dna.customer_personas || "",
    competitors: dna.competitors || [],
    primaryColor,
    secondaryColor,
    primaryFont,
    bodyFont,
    approvedMoodboardName: moodboard.name || "Modern Minimalist",
    systemPromptInjection,
    winningHooks: [...winningHooks, ...customHooks],
    winningCtas: [...winningCtas, ...customCtas]
  };
}

/**
 * Saves a manually added hook, CTA, or hashtag to the memory bank.
 */
export async function saveToMemoryBank(
  brandDnaId: string, 
  itemType: "hook" | "cta" | "hashtag", 
  content: string, 
  category: string = "General"
): Promise<void> {
  const { error } = await supabase.from("brand_memory_bank").insert({
    brand_dna_id: brandDnaId,
    item_type: itemType,
    content: content.trim(),
    category,
    use_count: 0,
    success_rate: 0.0
  });

  if (error) {
    throw new Error(`Failed to save memory bank item: ${error.message}`);
  }
}

/**
 * Updates a generated post's performance rating and engagement metrics.
 * If engagement is high, it flags the post as a winning design so it's prioritized in future prompt contexts.
 */
export async function recordPostPerformance(postId: string, engagementScore: number): Promise<void> {
  const isWinning = engagementScore >= 7.0;
  const { error } = await supabase
    .from("brand_posts")
    .update({
      engagement_score: engagementScore,
      is_winning: isWinning
    })
    .eq("id", postId);

  if (error) {
    throw new Error(`Failed to update post performance: ${error.message}`);
  }
}
