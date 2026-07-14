import { NextResponse } from "next/server";

// Kit A = Classic / Wordmark style — structured, timeless, geometric
// Kit B = Modern / Gradient style — dynamic, layered, electric
const KIT_STYLE_GUIDE: Record<"A" | "B", string> = {
  A: `Kit Style: CLASSIC BOLD WORDMARK
- Design philosophy: Structured, authoritative, geometric precision
- Icon style: Geometric precision — clean polygon/hexagon/shield with sharp contrast
- Color treatment: Solid fills, no gradients on the icon; one strong accent pop
- Typography style: Heavy weight, spaced, commanding. Use bold slab or geometric sans
- Metaphor: Inspired by agencies like Pentagram, Wolff Olins — timeless mark
- Feel: Premium, built-to-last, institutional credibility`,

  B: `Kit Style: MODERN GRADIENT ELECTRIC
- Design philosophy: Dynamic, fluid, future-forward, digital-native
- Icon style: Abstract overlapping curves, flowing lines, gradient mesh, layered orbs
- Color treatment: Rich linear/radial gradients across all elements; luminous glow effects
- Typography style: Modern variable weight, thin-to-bold mix, ultra-clean sans-serif
- Metaphor: Inspired by Stripe, Linear, Vercel — expressive and technical
- Feel: Startup energy, digital excellence, motion-aware`,
};

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

    // Kit variant — "A" (classic) or "B" (modern gradient)
    const kitVariant: "A" | "B" = body.kitVariant === "B" ? "B" : "A";

    // User-specified brand colors (optional — if not provided, AI chooses)
    const userPrimaryColor: string | null = body.userPrimaryColor || null;
    const userSecondaryColor: string | null = body.userSecondaryColor || null;

    const colorInstruction = userPrimaryColor && userSecondaryColor
      ? `MANDATORY COLOR CONSTRAINT: You MUST use EXACTLY these brand colors throughout ALL SVGs:
- Primary color (deep tone, backgrounds, text): "${userPrimaryColor}"
- Accent/Secondary color (highlights, icon fill, glows): "${userSecondaryColor}"
Do NOT invent other colors. Use only these two plus white/near-white for contrast.`
      : `COLOR GENERATION: Generate a premium, harmonized 2-color palette appropriate for the brand.
- "primaryHex": A deep, sophisticated tone (obsidian, midnight blue, forest, slate, wine — never plain black)
- "secondaryHex": A vibrant, memorable accent (electric cyan, neon emerald, vivid violet, coral, amber)`;

    const styleGuide = KIT_STYLE_GUIDE[kitVariant];

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured." }, { status: 500 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const promptText = `You are a world-class brand identity designer — the creative director of a top-tier design agency. Your task is to generate a complete, production-grade SVG brand kit.

BRAND BRIEF:
- Brand Name: "${brandName}"
- Industry: "${industry}"
- Business Description: "${businessDescription}"
- Mission: "${mission}"
- USP: "${usp}"
- Brand Values: ${brandValues.length > 0 ? brandValues.join(", ") : "N/A"}
- Brand Personality: "${brandPersonality}"

${styleGuide}

${colorInstruction}

SVG QUALITY REQUIREMENTS (strictly enforced):
1. BESPOKE MARK — NOT a letter inside a shape. The icon must be an original abstract symbol that conceptually relates to the brand's industry or values.
   - For tech/SaaS: flowing data nodes, circuit paths, abstract hexagonal mesh
   - For fashion: flowing silhouette lines, abstract leaf/petal geometry  
   - For finance: precision grid patterns, shield-orbit hybrids, column/bar abstractions
   - For lifestyle: organic flowing curves, sun/wave/bloom abstractions
2. GRADIENTS — Use <defs> with <linearGradient> or <radialGradient> elements for rich depth
3. FILTERS — Use <filter> with feDropShadow or feGaussianBlur for premium glow effect
4. TYPOGRAPHY — Use font-family="'Cabinet Grotesk', 'Outfit', 'Montserrat', sans-serif" with font-weight="800" for bold impact
5. VIEWBOX — All SVGs MUST use viewBox instead of hardcoded width/height
6. ALL TAGS MUST BE PROPERLY CLOSED — validate every opening tag has a closing tag
7. NO MARKDOWN — Output raw SVG strings. Never wrap in backtick code blocks.

REQUIRED ASSETS:
- "primaryLogoSvg": Horizontal lockup (viewBox="0 0 280 80") — abstract icon mark LEFT + brand name text RIGHT. Dark background.
- "secondaryLogoSvg": Horizontal lockup (viewBox="0 0 280 80") — same mark + name on light/white background  
- "iconSvg": Standalone abstract symbol (viewBox="0 0 100 100") — NO text, icon only on dark background
- "monogramSvg": Artistic monogram (viewBox="0 0 100 100") — stylized first letter of "${brandName}" blended into geometric form
- "faviconSvg": Micro icon (viewBox="0 0 32 32") — simplified for tiny display, max legibility
- "socialIconsSvg": Circle-cropped version (viewBox="0 0 100 100") — icon fits perfectly inside a circle boundary
- "appIconSvg": Rounded square (viewBox="0 0 512 512") — icon at large scale with premium rounded square background

Respond with a single, valid JSON object only. No other text before or after it.`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              primaryLogoSvg:    { type: "STRING" },
              secondaryLogoSvg:  { type: "STRING" },
              iconSvg:           { type: "STRING" },
              monogramSvg:       { type: "STRING" },
              faviconSvg:        { type: "STRING" },
              socialIconsSvg:    { type: "STRING" },
              appIconSvg:        { type: "STRING" },
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
            required: ["primaryLogoSvg", "secondaryLogoSvg", "iconSvg", "monogramSvg", "faviconSvg", "socialIconsSvg", "appIconSvg", "colors", "typography"],
          },
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error:", errText);
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const resJson = await response.json();
    const generatedText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No output generated from Gemini API");
    }

    // Sanitize markdown code block wrappers if present
    let jsonText = generatedText.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```$/, "").trim();
    }

    const kitData = JSON.parse(jsonText);

    // If user specified colors, override any AI-generated colors to ensure consistency
    if (userPrimaryColor && userSecondaryColor && kitData.colors) {
      kitData.colors.primaryHex = userPrimaryColor;
      kitData.colors.secondaryHex = userSecondaryColor;
    }

    // Attach kit variant label
    kitData.kitVariant = kitVariant;

    return NextResponse.json(kitData);
  } catch (error: any) {
    console.error("Logo generation API error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate logo kit." }, { status: 500 });
  }
}
