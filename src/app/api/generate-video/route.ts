import { NextResponse } from "next/server";


// POST handler to submit video generation to queue
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("--- QUEUE VIDEO REQUEST RECEIVED ---");

    // If body contains requestId, handle status check request
    if (body.requestId) {
      const requestId = body.requestId;
      const falApiKey = process.env.FAL_API_KEY;
      if (!falApiKey) {
        return NextResponse.json({ error: "FAL_API_KEY is not configured" }, { status: 500 });
      }

      console.log(`Checking queue status for request: ${requestId}`);
      const statusUrl = `https://queue.fal.run/fal-ai/longcat-video/requests/${requestId}/status`;
      const statusRes = await fetch(statusUrl, {
        method: "GET",
        headers: {
          Authorization: `Key ${falApiKey}`,
        },
      });

      if (!statusRes.ok) {
        const errText = await statusRes.text();
        console.error("Fal status check failed:", errText);
        return NextResponse.json({ error: `Fal status check returned status ${statusRes.status}` }, { status: statusRes.status });
      }

      const statusJson = await statusRes.json();
      const status = statusJson.status || "IN_QUEUE";
      let videoUrl = null;

      if (status === "COMPLETED") {
        // The status endpoint only returns status metadata.
        // The actual video output lives at response_url — fetch it now.
        const responseUrl = statusJson.response_url;
        if (responseUrl) {
          const resultRes = await fetch(responseUrl, {
            method: "GET",
            headers: { Authorization: `Key ${falApiKey}` },
          });
          if (resultRes.ok) {
            const resultJson = await resultRes.json();
            // LongCat Video returns { video: { url: "..." } }
            videoUrl = resultJson?.video?.url || resultJson?.video_url || null;
            console.log("LongCat result JSON keys:", Object.keys(resultJson));
            console.log("Video URL found:", videoUrl);
          } else {
            console.error("Failed to fetch result from response_url:", await resultRes.text());
          }
        } else {
          console.error("No response_url in status JSON:", JSON.stringify(statusJson));
        }
      }

      return NextResponse.json({
        status,
        videoUrl,
        logs: statusJson.logs || [],
        error: statusJson.error || null,
      });
    }

    console.log("Body payload:", JSON.stringify(body, null, 2));

    const userPrompt = String(body.prompt || "");
    const duration = String(body.duration || "10s");

    // Brand DNA context
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

    // ── STEP 1: Ask Gemini to generate a highly consistent visual & motion prompt ──
    const promptGenerationInput = `You are a world-class Marketing Creative Director and Film Director.
Write a highly detailed, professional-grade video generation prompt (150-250 words) for a text-to-video model (LongCat-Video) to create a premium marketing video.

The user wants to generate this specific video idea:
"${userPrompt}"

To ensure absolute brand consistency, you MUST compile and align the video prompt with the COMPLETE brand DNA and memory details:
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

VIDEO PROMPT RULES (Strictly Enforce):
1. **HIGH DESCRIPTIVENESS**: You MUST write a detailed, 150-250 word visual and motion prompt.
2. **SUBJECT & COMPOSITION**: Describe the core subject (e.g. boutique stay lobby, luxury wellness retreat balcony, high-tech interface, abstract organic shapes) in a clean, professional, cinematic layout.
3. **MOTION & DYNAMICS**: Clearly specify the cinematic camera movement (e.g. slow cinematic dolly forward, smooth panning sweep, gentle crane shot, subtle drone reveal) and subject motion (e.g. soft leaves swaying, warm light rays drifting, water ripples, steam rising slowly).
4. **LIGHTING & ATMOSPHERE**: Specify premium lighting (e.g. soft volumetric rays, dramatic split-lighting, warm golden hour sun casting geometric shadows).
5. **COLOR INTEGRATION**: Explicitly describe how the brand colors are woven into the scene. The primary color (${primaryColor}) should dominate the environment, and the accent color (${secondaryColor}) should be highlighted in light sources, outlines, or focal points.
6. **NO TEXT IN VIDEO**: Strictly forbid letters, words, UI elements, or watermark logos. The video must be a pure, high-quality visual.

OUTPUT FORMAT: Return ONLY the final detailed text prompt. No introduction, no markdown, no explanations.`;

    let videoPromptText = "";
    try {
      let model = "gemini-2.5-flash";
      let geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;

      const promptPayload = {
        contents: [{ parts: [{ text: promptGenerationInput }] }],
        generationConfig: {
          temperature: 1.0,
          maxOutputTokens: 500,
        },
      };

      let geminiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promptPayload),
      });

      if (!geminiResponse.ok && geminiResponse.status === 429) {
        console.warn("Gemini 2.5 Flash rate limited (429). Falling back to Gemini 2.5 Pro.");
        model = "gemini-2.5-pro";
        geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
        geminiResponse = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(promptPayload),
        });
      }

      if (!geminiResponse.ok) {
        const errText = await geminiResponse.text();
        throw new Error(`Gemini API returned status ${geminiResponse.status}: ${errText}`);
      }

      const geminiResJson = await geminiResponse.json();
      videoPromptText = geminiResJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    } catch (e: any) {
      console.warn("Gemini call failed or rate-limited. Falling back to programmatic prompt constructor.", e.message);
    }

    if (!videoPromptText) {
      videoPromptText = `A premium cinematic text-to-video scene for ${brandName} in the ${industry} industry. ${userPrompt}. Sleek editorial aesthetic, high-fidelity details, volumetric light rays, shot on 35mm lens, photorealistic. Brand colors: base tone is ${primaryColor}, accent highlights and reflections in ${secondaryColor}. Dynamic camera motion, clean luxury look, no text.`;
    }

    console.log("Generated Video Prompt:", videoPromptText);

    // Map duration to num_frames (approx 30 fps for LongCat Video)
    let numFrames = 150; // 5s default
    if (duration === "10s") {
      numFrames = 300;
    } else if (duration === "20s") {
      numFrames = 600;
    } else if (duration === "30s") {
      numFrames = 900;
    }

    // ── STEP 2: Submit to fal.ai LongCat-Video queue ──
    const falResponse = await fetch("https://queue.fal.run/fal-ai/longcat-video/text-to-video/720p", {
      method: "POST",
      headers: {
        Authorization: `Key ${falApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: videoPromptText,
        num_frames: numFrames,
        num_inference_steps: 20,
        guidance_scale: 6.0,
      }),
    });

    if (!falResponse.ok) {
      const errText = await falResponse.text();
      console.error("Fal Video queue submission failed:", errText);
      throw new Error(`fal.ai video queue submission returned status ${falResponse.status}`);
    }

    const falResJson = await falResponse.json();
    const requestId = falResJson.request_id || null;

    if (!requestId) {
      throw new Error("No request ID returned from fal.ai queue");
    }

    return NextResponse.json({
      requestId,
      videoPrompt: videoPromptText,
    });
  } catch (error: any) {
    console.error("Video generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate video." },
      { status: 500 }
    );
  }
}
