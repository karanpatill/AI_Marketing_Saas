import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const brandName = String(body.brandName || "My Brand");
    const industry = String(body.industry || "General");
    const businessDescription = String(body.businessDescription || "");
    const brandPersonality = String(body.brandPersonality || "Modern");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured." }, { status: 500 });
    }

    const url: string = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const promptText: string = "You are an elite, award-winning brand identity designer and senior graphic engineer.\n"
      + "Generate a complete, premium, production-grade vector SVG brand kit for the following company:\n"
      + "- Brand Name: \"" + brandName + "\"\n"
      + "- Industry: \"" + industry + "\"\n"
      + "- Vibe / Personality: \"" + brandPersonality + "\"\n"
      + "- Description: \"" + businessDescription + "\"\n\n"
      + "Design Guidelines for SVGs (Must follow strictly):\n"
      + "1. Bespoke Artistry (No generic shapes): DO NOT generate basic templates (e.g. do not just draw a standard circle with a plain letter 'A' inside). The design must feel high-end, custom, and bespoke (like a professional design agency's work).\n"
      + "2. Modern Aesthetics:\n"
      + "   - Gradients: Use premium linear or radial gradients (e.g., transitions from electric cyan to deep blue, or hot violet to magenta) to give the symbols depth. Use <defs> and <linearGradient> elements.\n"
      + "   - Abstract Geometry: Use interesting overlapping paths, intersecting lines, glowing tech rings, clean polygons, modern curves, or negative space effects.\n"
      + "   - Glow & Depth: Use subtle SVG filters (e.g. <filter> with feDropShadow or feGaussianBlur) to add a high-tech premium feel.\n"
      + "3. Typography:\n"
      + "   - Render the text \"" + brandName + "\" using clean, premium geometric fonts styled via SVG font properties (font-family=\"'Cabinet Grotesk', 'Outfit', 'Montserrat', sans-serif\").\n"
      + "   - Set font-weight to \"800\" or \"bold\" and add letter-spacing (e.g. letter-spacing=\"1\" or \"2\") for a luxury look.\n"
      + "   - Ensure the text and symbol are perfectly aligned and spaced.\n"
      + "4. Coherence:\n"
      + "   - Generate two harmonized colors: \"primaryHex\" (a premium deep tone like obsidian, slate, or midnight blue) and \"secondaryHex\" (a vibrant accent like electric cyan, neon emerald, or royal purple).\n"
      + "   - Use these exact colors throughout all generated SVGs to maintain absolute brand consistency.\n"
      + "5. Variations Required:\n"
      + "   - \"primaryLogoSvg\": Main logo. Contains the abstract vector mark next to the brand name \"" + brandName + "\". Renders beautifully on a light background.\n"
      + "   - \"secondaryLogoSvg\": Horizontal variant optimized for a dark background (include a dark navy/slate background rect or dark shapes).\n"
      + "   - \"iconSvg\": Standalone abstract symbol mark. No text. Clean, centered, and memorable.\n"
      + "   - \"monogramSvg\": A stylized, artistic monogram using the initial letter of \"" + brandName + "\". Blend the letter into a custom geometric shape or curve.\n"
      + "   - \"faviconSvg\": Simplified 32x32 viewbox symbol suitable for tiny sizes. High legibility.\n"
      + "   - \"socialIconsSvg\": Logo graphic optimized inside a circular boundary (or a symbol that fits well in a circle).\n"
      + "   - \"appIconSvg\": Logo graphic optimized inside a rounded square boundary (e.g. rx=\"22%\").\n\n"
      + "Output Constraints:\n"
      + "- The SVG strings must contain valid raw SVG markup. Do NOT wrap them in backticks or markdown blocks.\n"
      + "- All SVGs must be fully responsive (use viewBox=\"0 0 W H\" instead of hardcoded absolute width/height on the root).\n"
      + "- Ensure all tags are correctly closed.\n\n"
      + "You must respond strictly with a single JSON object.";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: promptText,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              primaryLogoSvg: { type: "STRING" },
              secondaryLogoSvg: { type: "STRING" },
              iconSvg: { type: "STRING" },
              monogramSvg: { type: "STRING" },
              faviconSvg: { type: "STRING" },
              socialIconsSvg: { type: "STRING" },
              appIconSvg: { type: "STRING" },
              colors: {
                type: "OBJECT",
                properties: {
                  primaryHex: { type: "STRING" },
                  secondaryHex: { type: "STRING" },
                  primaryRgb: { type: "STRING" },
                  secondaryRgb: { type: "STRING" },
                  primaryCmyk: { type: "STRING" },
                  secondaryCmyk: { type: "STRING" },
                  pantoneApprox: { type: "STRING" },
                },
                required: [
                  "primaryHex",
                  "secondaryHex",
                  "primaryRgb",
                  "secondaryRgb",
                  "primaryCmyk",
                  "secondaryCmyk",
                  "pantoneApprox",
                ],
              },
            },
            required: [
              "primaryLogoSvg",
              "secondaryLogoSvg",
              "iconSvg",
              "monogramSvg",
              "faviconSvg",
              "socialIconsSvg",
              "appIconSvg",
              "colors",
            ],
          },
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error details:", errText);
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const resJson = await response.json();
    const generatedText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      throw new Error("No output generated from Gemini API");
    }

    const kitData = JSON.parse(generatedText.trim());
    return NextResponse.json(kitData);
  } catch (error: any) {
    console.error("Logo generation API error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate logo kit." }, { status: 500 });
  }
}
