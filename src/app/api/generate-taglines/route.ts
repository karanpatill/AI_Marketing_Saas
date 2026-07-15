import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const brandName        = String(body.brandName        || "Brand");
    const industry         = String(body.industry         || "Technology");
    const businessDescription = String(body.businessDescription || "");
    const brandPersonality = String(body.brandPersonality || "Professional");
    const brandValues: string[] = Array.isArray(body.brandValues) ? body.brandValues : [];
    const mission          = String(body.mission          || "");
    const targetAudience   = String(body.targetAudience   || "");
    const existingTagline  = String(body.existingTagline  || "");

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const prompt = `You are a world-class brand strategist and copywriter.

Generate exactly 5 unique, powerful taglines for this brand. Each tagline must be:
- Short: 3–8 words maximum
- Memorable, punchy, and emotionally resonant
- Aligned with the brand's personality and values
- Original and NOT generic

Brand Details:
- Company Name: ${brandName}
- Industry: ${industry}
- Business: ${businessDescription}
- Personality: ${brandPersonality}
- Values: ${brandValues.join(", ")}
- Mission: ${mission}
- Target Audience: ${targetAudience}
${existingTagline ? `- Existing tagline (improve on this): "${existingTagline}"` : ""}

Output format: Return ONLY a valid JSON array of 5 strings. No explanation, no markdown, no extra text. Example:
["Tagline One Here", "Tagline Two Here", "Tagline Three Here", "Tagline Four Here", "Tagline Five Here"]`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 1.2, maxOutputTokens: 300 },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const resJson = await response.json();
    let text = resJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    // Strip markdown code fences if present
    text = text.replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```$/, "").trim();

    const taglines: string[] = JSON.parse(text);

    if (!Array.isArray(taglines) || taglines.length === 0) {
      throw new Error("Invalid taglines format from Gemini");
    }

    return NextResponse.json({ taglines: taglines.slice(0, 5) });
  } catch (error: any) {
    console.error("Tagline generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate taglines" }, { status: 500 });
  }
}
