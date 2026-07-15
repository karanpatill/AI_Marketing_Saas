import { NextResponse } from "next/server";

// Retry Gemini call up to maxRetries times on 429 rate limit
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
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    const brandName = String(body.brandName || "My Brand");
    const industry = String(body.industry || "General");
    const businessDescription = String(body.businessDescription || "");
    const brandPersonality = String(body.brandPersonality || "Modern");
    const brandValues: string[] = Array.isArray(body.brandValues) ? body.brandValues : [];
    const usp = String(body.usp || "");
    const mission = String(body.mission || "");
    const kitVariant: "A" | "B" = body.kitVariant === "B" ? "B" : "A";

    const userPrimaryColor: string | null = body.userPrimaryColor || null;
    const userSecondaryColor: string | null = body.userSecondaryColor || null;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const falApiKey = process.env.FAL_API_KEY;

    if (!geminiApiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured." }, { status: 500 });
    }
    if (!falApiKey) {
      return NextResponse.json({ error: "FAL_API_KEY is not configured." }, { status: 500 });
    }

    const promptText = `You are a world-class brand strategist and creative director of a top-tier design agency.
Your task is to:
1. Generate a premium brand identity palette (primary/secondary colors, typography).
2. Write a highly customized, ultra-premium image generation prompt for a text-to-image model (like FLUX) to generate the brand's logo symbol mark/icon.

BRAND BRIEF:
- Brand Name: "${brandName}"
- Industry: "${industry}"
- Business Description: "${businessDescription}"
- Mission: "${mission}"
- USP: "${usp}"
- Brand Values: ${brandValues.length > 0 ? brandValues.join(", ") : "N/A"}
- Brand Personality: "${brandPersonality}"

PROMPT WRITING GUIDELINES for the Logo Symbol Mark:
- Must request a clean vector-style, modern, high-end standalone symbol/icon/mark.
- Must explicitly state: "NO text, NO letters, NO words, NO typography, PURE symbol mark only".
- Must specify a clean background (e.g., "on a solid black background" or "on a clean dark grey background") to make the icon pop.
- Describe the abstract shapes, geometric alignment, premium materials/textures (matte finish, subtle glow, gradient depth), and modern agency design style (inspired by Wolff Olins, Pentagram, Stripe, or Vercel).
- Incorporate the brand colors (${userPrimaryColor || "premium dark brand tone"} and ${userSecondaryColor || "luminous accent tone"}) into the prompt description.

You must respond with a single, valid JSON object containing exactly these fields:
{
  "fluxPrompt": "A detailed custom prompt for FLUX to generate the logo symbol mark. MUST start with: 'A premium professional logo icon/symbol mark for...'",
  "colors": {
    "primaryHex": "${userPrimaryColor || "AI suggested deep color hex"}",
    "secondaryHex": "${userSecondaryColor || "AI suggested vibrant color hex"}",
    "primaryRgb": "e.g. 9, 13, 22",
    "secondaryRgb": "e.g. 6, 182, 212",
    "primaryCmyk": "e.g. 70%, 50%, 0%, 90%",
    "secondaryCmyk": "e.g. 95%, 0%, 0%, 15%",
    "pantoneApprox": "e.g. Pantone Black 6 C"
  },
  "typography": {
    "primaryFont": "Cabinet Grotesk or Cinzel or Outfit",
    "bodyFont": "Montserrat or Inter or Outfit",
    "usage": "Use primaryFont for bold display headings, bodyFont for clean UI layouts"
  }
}`;

    const promptPayload = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            fluxPrompt: { type: "STRING" },
            colors: {
              type: "OBJECT",
              properties: {
                primaryHex:     { type: "STRING" },
                secondaryHex:   { type: "STRING" },
                primaryRgb:     { type: "STRING" },
                secondaryRgb:   { type: "STRING" },
                primaryCmyk:    { type: "STRING" },
                secondaryCmyk:  { type: "STRING" },
                pantoneApprox:  { type: "STRING" },
              },
              required: ["primaryHex", "secondaryHex", "primaryRgb", "secondaryRgb", "primaryCmyk", "secondaryCmyk", "pantoneApprox"],
            },
            typography: {
              type: "OBJECT",
              properties: {
                primaryFont: { type: "STRING" },
                bodyFont:    { type: "STRING" },
                usage:       { type: "STRING" },
              },
              required: ["primaryFont", "bodyFont", "usage"],
            },
          },
          required: ["fluxPrompt", "colors", "typography"],
        },
      },
    };

    // Use Flash first (10 RPM free tier), retry on 429, then fall back to 1.5-flash
    const models = ["gemini-2.5-flash", "gemini-1.5-flash"];
    let geminiResponse: Response | null = null;

    for (const model of models) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
      geminiResponse = await callGeminiWithRetry(geminiUrl, promptPayload);
      if (geminiResponse.ok) break;
      if (geminiResponse.status !== 429) break; // non-rate-limit error, don't try next model
      console.warn(`${model} still rate limited after retries. Trying next model...`);
    }

    if (!geminiResponse || !geminiResponse.ok) {
      const errText = await geminiResponse?.text();
      console.error("Gemini API Error:", errText);
      throw new Error(`Gemini API returned status ${geminiResponse?.status}`);
    }

    const geminiResJson = await geminiResponse.json();
    const generatedText = geminiResJson.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No output generated from Gemini API");
    }

    // Sanitize markdown code block wrappers if present
    let jsonText = generatedText.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```$/, "").trim();
    }

    const kitData = JSON.parse(jsonText);

    // Override colors if user specified them
    if (userPrimaryColor && userSecondaryColor && kitData.colors) {
      kitData.colors.primaryHex = userPrimaryColor;
      kitData.colors.secondaryHex = userSecondaryColor;
    }

    const fluxPrompt = String(kitData.fluxPrompt || `A premium professional logo icon/symbol mark for ${brandName}, a ${industry} brand. Standalone symbol mark, clean vector design, solid background, modern tech-forward shape, rich color scheme, no text, no letters.`);

    // ── STEP 2: Call fal.ai Flux Schnell to generate the high-quality logo image ──
    const falResponse = await fetch("https://fal.run/fal-ai/flux/schnell", {
      method: "POST",
      headers: {
        Authorization: `Key ${falApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: fluxPrompt,
        image_size: "square",
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
        output_format: "png",
      }),
    });

    if (!falResponse.ok) {
      const errText = await falResponse.text();
      console.error("Fal Logo generation failed:", errText);
      throw new Error(`fal.ai logo generation returned status ${falResponse.status}`);
    }

    const falResJson = await falResponse.json();
    const imageUrl = falResJson.images?.[0]?.url || null;

    if (!imageUrl) {
      throw new Error("No image URL returned from fal.ai");
    }

    // Build the logos[] array the page expects
    const logos = [
      {
        id: `kit_${kitVariant}_primary`,
        name: kitVariant === "A" ? "Classic Bold Mark" : "Modern Gradient Mark",
        description: fluxPrompt,
        svgContent: null,
        imageUrl: imageUrl, // Flux image URL from Fal
        error: null,
        kitData: { ...kitData, kitVariant },
      },
    ];

    return NextResponse.json({ logos, kitData: { ...kitData, kitVariant } });
  } catch (error: any) {
    console.error("Logo generation API error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate logo kit." }, { status: 500 });
  }
}
