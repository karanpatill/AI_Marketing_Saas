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
    console.log("--- GENERATE CAROUSEL REQUEST RECEIVED ---");
    console.log("Body payload:", JSON.stringify(body, null, 2));

    const userPrompt = String(body.prompt || "");

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

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const falApiKey = process.env.FAL_API_KEY;

    if (!geminiApiKey || !falApiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY or FAL_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // ── STEP 1: Ask Gemini to design the 5 slides and draft the visual backdrop image prompt ──

    const promptGenerationInput = `You are a world-class Marketing Art Director and Creative Director.
Your task is to:
1. Design a 5-slide visual carousel presentation deck content based on the user's objective: "${userPrompt}"
2. Write a highly detailed, 150-250 word visual prompt for a text-to-image model (FLUX) to generate a SINGLE background backdrop image.

To ensure absolute brand consistency, you MUST align both the backdrop prompt and the slide copy with the COMPLETE brand DNA and memory details:
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

PROMPT RULES for the Backdrop Graphic:
- It will be used as a backdrop under HTML text slides.
- It must be a sleek, clean visual asset (e.g. abstract gradient textures, a minimal product pedestal, a beautifully lit luxury workspace corner, flowing architectural lines).
- Must respect the brand color scheme (Primary "${primaryColor}" and Secondary "${secondaryColor}").
- **CRITICAL**: Absolutely NO text, words, letters, logos, or UI buttons on the image itself.
- Make it 150-250 words, detailed, shot on a Hasselblad 80mm lens, soft volumetric lighting.

SLIDE DESIGN RULES (5 Slides):
- Slide 1: Hook / Title Slide
- Slide 2: Problem / Opportunity
- Slide 3: Concept / Solution
- Slide 4: Value / Detail
- Slide 5: Call to Action (CTA)

For each slide, specify the text content (Title, Description, optional short Badge like "01 / STEPS", and CTA). Also, specify a custom 3D background transformation config so that when the single backdrop image is rendered, it appears slightly differently (different rotation shifts, scale zoom shifts, brightness adjustments, and saturation/contrast tweaks to keep the slide clean).

You must respond with a single, valid JSON object containing exactly these fields:
{
  "fluxPrompt": "A detailed visual backdrop prompt for FLUX. Must start with: 'A premium professional backdrop graphic...'",
  "slides": [
    {
      "badge": "HOOK",
      "title": "Slide Title text here",
      "description": "Short descriptive copy here (1-2 sentences max)",
      "cta": "Swipe next",
      "backgroundConfig": {
        "scale": 1.1,
        "rotation": 0,
        "brightness": 0.65,
        "contrast": 1.0,
        "saturation": 0.9
      }
    },
    {
      "badge": "THE PROBLEM",
      "title": "...",
      "description": "...",
      "cta": "Read more",
      "backgroundConfig": {
        "scale": 1.25,
        "rotation": 4,
        "brightness": 0.55,
        "contrast": 1.1,
        "saturation": 0.8
      }
    },
    ...
  ]
}`;

    const promptPayload = {
      contents: [{ parts: [{ text: promptGenerationInput }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            fluxPrompt: { type: "STRING" },
            slides: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  badge:       { type: "STRING" },
                  title:       { type: "STRING" },
                  description: { type: "STRING" },
                  cta:         { type: "STRING" },
                  backgroundConfig: {
                    type: "OBJECT",
                    properties: {
                      scale:      { type: "NUMBER" },
                      rotation:   { type: "NUMBER" },
                      brightness: { type: "NUMBER" },
                      contrast:   { type: "NUMBER" },
                      saturation: { type: "NUMBER" },
                    },
                    required: ["scale", "rotation", "brightness", "contrast", "saturation"],
                  },
                },
                required: ["badge", "title", "description", "cta", "backgroundConfig"],
              },
            },
          },
          required: ["fluxPrompt", "slides"],
        },
      },
    };

    let carouselData = null;
    try {
      const models = ["gemini-2.5-flash", "gemini-1.5-flash"];

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
      const generatedText = geminiResJson.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error("No output generated from Gemini API");
      }

      // Sanitize markdown code block wrappers if present
      let jsonText = generatedText.trim();
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```$/, "").trim();
      }

      carouselData = JSON.parse(jsonText);
    } catch (e: any) {
      console.warn("Gemini call failed or rate-limited in generate-carousel. Falling back to programmatic slides.", e.message);
      carouselData = {
        fluxPrompt: `A premium professional marketing post graphic backdrop for ${brandName} in the ${industry} industry. ${userPrompt}. Sleek editorial styling, rich color scheme with accents of ${secondaryColor} and deep tones of ${primaryColor}, ultra-detailed, 8K resolution, design agency quality, no text.`,
        slides: [
          {
            badge: "01 / HOOK",
            title: `Elevating ${brandName}`,
            description: `Discover how we are redefining ${industry} through meticulous design and curated taste.`,
            cta: "Swipe next",
            backgroundConfig: { scale: 1.1, rotation: 0, brightness: 0.65, contrast: 1.0, saturation: 0.9 }
          },
          {
            badge: "02 / THE SHIFT",
            title: "Rejecting the Ordinary",
            description: "We believe in soulfully designed spaces and experiences over generic search boxes.",
            cta: "Learn more",
            backgroundConfig: { scale: 1.25, rotation: 4, brightness: 0.55, contrast: 1.1, saturation: 0.8 }
          },
          {
            badge: "03 / CORE VISION",
            title: "Meticulous Curation",
            description: "Connecting discerning individuals with premium stays, wellness retreats, and local immersion.",
            cta: "Explore details",
            backgroundConfig: { scale: 1.35, rotation: -3, brightness: 0.5, contrast: 1.2, saturation: 0.85 }
          },
          {
            badge: "04 / BENEFITS",
            title: "Creator Opportunities",
            description: "Synchronizing travel plans with your specific mood and artistic direction.",
            cta: "See how",
            backgroundConfig: { scale: 1.2, rotation: 2, brightness: 0.6, contrast: 1.0, saturation: 0.95 }
          },
          {
            badge: "05 / GET STARTED",
            title: `Begin Your Journey`,
            description: `Join ${brandName} today and step into a sanctuary of curated travel.`,
            cta: "Get access",
            backgroundConfig: { scale: 1.15, rotation: 0, brightness: 0.7, contrast: 0.95, saturation: 1.0 }
          }
        ]
      };
    }

    const fluxPrompt = String(carouselData.fluxPrompt || `A premium professional marketing post graphic backdrop for ${brandName} (${industry}). Sleek editorial styling, rich color scheme with accents of ${secondaryColor} and deep tones of ${primaryColor}, ultra-detailed, 8K resolution, design agency quality.`);

    // ── STEP 2: Call fal.ai Flux Schnell to generate the single backdrop image ──
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
      console.error("Fal Carousel backdrop generation failed:", errText);
      throw new Error(`fal.ai carousel backdrop returned status ${falResponse.status}`);
    }

    const falResJson = await falResponse.json();
    const imageUrl = falResJson.images?.[0]?.url || null;

    if (!imageUrl) {
      throw new Error("No image URL returned from fal.ai");
    }

    return NextResponse.json({
      imageUrl,
      fluxPrompt,
      slides: carouselData.slides || [],
    });
  } catch (error: any) {
    console.error("Carousel generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate carousel." },
      { status: 500 }
    );
  }
}
