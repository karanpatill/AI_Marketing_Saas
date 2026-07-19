import { NextResponse } from "next/server";

async function callGeminiWithRetry(
  url: string,
  payload: object,
  maxRetries = 3,
  delayMs = 4000
): Promise<Response> {
  let lastResponse: Response | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      console.warn(`Gemini 429 rate limit. Waiting ${delayMs}ms before retry ${attempt}/${maxRetries}...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.status !== 429) return res;
    lastResponse = res;
  }
  return lastResponse!;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("--- GENERATE POST REQUEST RECEIVED ---");
    console.log("Body payload:", JSON.stringify(body, null, 2));

    const userPrompt = String(body.prompt || "");
    const aspectRatio = String(body.aspectRatio || "square");

    // Brand context
    const brandName = String(body.brandName || "Brand");
    const industry = String(body.industry || "General");
    const businessDescription = String(body.businessDescription || "");
    const brandPersonality = String(body.brandPersonality || "Modern");
    const brandValues: string[] = Array.isArray(body.brandValues) ? body.brandValues : [];
    const usp = String(body.usp || "");
    const primaryColor = String(body.primaryColor || "#000000");
    const secondaryColor = String(body.secondaryColor || "#ffffff");
    const approvedMoodboard = body.approvedMoodboard || null;

    // Expanded brand DNA parameters
    const website = String(body.website || "");
    const category = String(body.category || "");
    const subCategory = String(body.subCategory || "");
    const mission = String(body.mission || "");
    const vision = String(body.vision || "");
    const products: string[] = Array.isArray(body.products) ? body.products : [];
    const services: string[] = Array.isArray(body.services) ? body.services : [];
    const targetAudience = String(body.targetAudience || "");
    const customerPersonas = String(body.customerPersonas || "");
    const competitors: string[] = Array.isArray(body.competitors) ? body.competitors : [];
    const logoUrl = String(body.logoUrl || "");

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const falApiKey = process.env.FAL_API_KEY;

    if (!geminiApiKey || !falApiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY or FAL_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // ── STEP 1: Ask Gemini to generate a highly consistent visual prompt for Flux Schnell ──
    const promptGenerationInput = `You are a world-class Marketing Art Director and Creative Director.
Your task is to write a highly detailed, professional-grade image generation prompt (150-250 words) for a text-to-image model (FLUX) to create a premium marketing post graphic.

The user wants to generate this specific graphic idea:
"${userPrompt}"

To ensure absolute brand consistency, you MUST compile and align the prompt with the COMPLETE brand DNA and memory details:
- Company Name: ${brandName}
- Website: ${website}
- Industry: ${industry}
- Category: ${category} (Subcategory: ${subCategory})
- Core Business Description: ${businessDescription}
- USP / Tagline: ${usp}
- Mission: ${mission}
- Vision: ${vision}
- Personality: ${brandPersonality}
- Core Values: ${brandValues.join(", ")}
- Products Offered: ${products.join(", ")}
- Services Offered: ${services.join(", ")}
- Target Audience: ${targetAudience}
- Customer Personas: ${customerPersonas}
- Competitors: ${competitors.join(", ")}
- Brand Colors: Primary is "${primaryColor}", Secondary/Accent is "${secondaryColor}"
${approvedMoodboard ? `- Approved Visual Direction / Moodboard: Name is "${approvedMoodboard.name}", Tagline is "${approvedMoodboard.tagline}"` : ""}

PROMPT RULES & DESIGN AESTHETICS (Strictly Enforce):
1. **HIGH DESCRIPTIVENESS**: You MUST write a detailed, 150-250 word visual prompt. Do NOT write a short single-sentence summary.
2. **SUBJECT & COMPOSITION**: Describe the core subject (e.g. luxury product packaging, high-end desk setup, editorial office scene) in a clean, modern, balanced layout. Base the objects, background setting, and props directly on the brand's industry, products, services, and target audience (e.g., if Maharashtra stay discovery, describe a boutique resort balcony or travel details; if a tech platform, describe a clean developer desk or abstract data rays).
3. **LIGHTING & ATMOSPHERE**: Specify premium lighting (e.g. soft volumetric rays, dramatic split-lighting, warm golden hour sun casting geometric shadows, subtle luminous neon glow).
4. **MATERIALS & TEXTURES**: Describe high-fidelity details (e.g. sandblasted metal, polished marble, frosted glass, organic linen, premium paper grain).
5. **COLOR INTEGRATION**: Explicitly describe how the brand colors are woven into the scene. Make sure the primary color (${primaryColor}) dominates the background or shadows, and the accent color (${secondaryColor}) is highlighted in light sources, product accents, or thin structural hairlines.
6. **CAMERA STYLE**: Specify photographic details (e.g. shot on Hasselblad 80mm lens, photorealistic, cinematic depth of field, crisp macro focus, high-end editorial commercial photography).
7. **NO TEXT IN IMAGE**: Strictly forbid letters, words, UI elements, or watermark logos. The image must be a pure, high-quality visual.

EXAMPLE OF DETAILED PROMPT WE EXPECT:
"A premium, professional commercial photograph for a high-end luxury brand. A sleek frosted glass bottle with a matte-black cap sits on a polished dark obsidian stone block. The background is a clean, minimal wall painted in deep charcoal (#0D0D0D), catching soft volumetric rays of warm sunlight filtering through window blinds. The scene is illuminated from the side with a subtle, electric gold light source (#C9A84C) reflecting on the glass edges. Crisp focus, macro detail, high-end editorial photography style, shot on Hasselblad 80mm lens, shallow depth of field, premium quality, no text."

OUTPUT FORMAT: Return ONLY the final detailed text prompt. No introduction, no markdown, no explanations.`;

    let fluxPrompt = "";
    try {
      const models = ["gemini-2.5-flash", "gemini-1.5-flash"];
      const promptPayload = {
        contents: [{ parts: [{ text: promptGenerationInput }] }],
        generationConfig: {
          temperature: 1.0,
          maxOutputTokens: 500,
        },
      };

      let geminiResponse: Response | null = null;
      for (const model of models) {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
        geminiResponse = await callGeminiWithRetry(geminiUrl, promptPayload);
        if (geminiResponse.status !== 429) break;
        console.warn(`Model ${model} still 429 after retries. Trying next model...`);
      }

      if (!geminiResponse || !geminiResponse.ok) {
        const errText = geminiResponse ? await geminiResponse.text() : "No response";
        throw new Error(`Gemini API returned status ${geminiResponse?.status}: ${errText}`);
      }

      const geminiResJson = await geminiResponse.json();
      fluxPrompt = geminiResJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    } catch (e: any) {
      console.warn("Gemini call failed or rate-limited in generate-post. Falling back to programmatic prompt constructor.", e.message);
    }

    if (!fluxPrompt) {
      fluxPrompt = `A premium professional marketing post graphic for ${brandName} (${industry}). ${userPrompt}. Sleek editorial styling, rich color scheme with accents of ${secondaryColor} and deep tones of ${primaryColor}, ultra-detailed, 8K resolution, design agency quality.`;
    }

    console.log("Generated Flux Prompt:", fluxPrompt);

    // Map client aspect ratio to Fal image_size options
    let imageSize = "square";
    if (aspectRatio === "portrait") {
      imageSize = "portrait_16_9";
    } else if (aspectRatio === "landscape") {
      imageSize = "landscape_16_9";
    }

    // ── STEP 2: Call fal.ai Flux Schnell to generate the post image ──
    let imageUrl: string | null = null;
    try {
      const falResponse = await fetch("https://fal.run/fal-ai/flux/schnell", {
        method: "POST",
        headers: {
          Authorization: `Key ${falApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: fluxPrompt,
          image_size: imageSize,
          num_inference_steps: 4,
          num_images: 1,
          enable_safety_checker: true,
          output_format: "png",
        }),
      });

      if (!falResponse.ok) {
        const errText = await falResponse.text();
        console.warn("Fal Post generation failed (will use Unsplash fallback):", errText);
      } else {
        const falResJson = await falResponse.json();
        imageUrl = falResJson.images?.[0]?.url || null;
      }
    } catch (e: any) {
      console.warn("Fal Post generation exception (will use Unsplash fallback):", e.message);
    }

    if (!imageUrl) {
      console.log("Using dynamic Unsplash fallback for post...");
      const unsplashOrientation = aspectRatio === "portrait" ? "portrait" : aspectRatio === "landscape" ? "landscape" : "squarish";
      imageUrl = await getUnsplashFallbackImage(`${industry} ${userPrompt || "marketing presentation"}`, unsplashOrientation);
    }

    return NextResponse.json({
      imageUrl,
      fluxPrompt,
    });
  } catch (error: any) {
    console.error("Post generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate post image." },
      { status: 500 }
    );
  }
}

async function getUnsplashFallbackImage(query: string, orientation: "landscape" | "portrait" | "squarish" = "squarish"): Promise<string> {
  try {
    const cleanQuery = encodeURIComponent(query.substring(0, 80));
    const searchUrl = `https://unsplash.com/napi/search/photos?query=${cleanQuery}&per_page=15&orientation=${orientation}`;
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const limit = Math.min(data.results.length, 8);
        const randomIndex = Math.floor(Math.random() * limit);
        const photo = data.results[randomIndex];
        const rawUrl = photo.urls?.raw || photo.urls?.regular;
        if (rawUrl) {
          return `${rawUrl.split('?')[0]}?q=80&w=1080&auto=format&fit=crop`;
        }
      }
    }
  } catch (err: any) {
    console.error("Unsplash fallback search failed:", err.message);
  }
  return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1080&auto=format&fit=crop"; // Premium dynamic marketing wallpaper
}
