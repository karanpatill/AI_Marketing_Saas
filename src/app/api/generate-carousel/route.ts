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
    const logoUrl = String(body.logoUrl || "");

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const falApiKey = process.env.FAL_API_KEY;

    if (!geminiApiKey || !falApiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY or FAL_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Determine style vibe from approved moodboard or colors
    let vibe = "luxury"; // default
    const moodboardName = String(approvedMoodboard?.name || "").toLowerCase();
    const moodboardId = String(approvedMoodboard?.id || "");
    if (moodboardId === "option_2" || moodboardName.includes("minimal") || moodboardName.includes("clean")) {
      vibe = "minimal";
    } else if (moodboardId === "option_3" || moodboardName.includes("vibrant") || moodboardName.includes("digital") || moodboardName.includes("bold") || moodboardName.includes("tech")) {
      vibe = "bold";
    } else if (moodboardName.includes("luxury")) {
      vibe = "luxury";
    } else if (moodboardName.includes("editorial")) {
      vibe = "editorial";
    } else if (moodboardName.includes("playful")) {
      vibe = "playful";
    } else if (moodboardName.includes("raw") || moodboardName.includes("industrial")) {
      vibe = "raw";
    }

    // Helper functions for blending and contrast
    const getContrastColor = (hex: string) => {
      if (!hex.startsWith("#")) return "#000000";
      const clean = hex.replace("#", "");
      const r = parseInt(clean.substring(0, 2), 16);
      const g = parseInt(clean.substring(2, 4), 16);
      const b = parseInt(clean.substring(4, 6), 16);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq >= 128 ? "#000000" : "#ffffff";
    };

    const blendColors = (c1: string, c2: string, weight: number) => {
      if (!c1.startsWith("#") || !c2.startsWith("#")) return c1;
      const clean1 = c1.replace("#", "");
      const clean2 = c2.replace("#", "");
      const r1 = parseInt(clean1.substring(0, 2), 16);
      const g1 = parseInt(clean1.substring(2, 4), 16);
      const b1 = parseInt(clean1.substring(4, 6), 16);
      const r2 = parseInt(clean2.substring(0, 2), 16);
      const g2 = parseInt(clean2.substring(2, 4), 16);
      const b2 = parseInt(clean2.substring(4, 6), 16);
      const r = Math.round(r1 * (1 - weight) + r2 * weight);
      const g = Math.round(g1 * (1 - weight) + g2 * weight);
      const b = Math.round(b1 * (1 - weight) + b2 * weight);
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    };

    const getStyleProfile = (v: string) => {
      const vl = v.toLowerCase().trim();
      if (vl === "luxury") {
        return {
          fontName: "Editorial Luxury",
          headingClass: "brand-font-heading font-normal italic",
          bodyClass: "brand-font-body font-light",
          headingDesc: "Elegant, high-end editorial serif. Headings should feel like a premium print magazine, often with sentence-case italicized accents. NEVER use all-caps uppercase.",
          bodyDesc: "Sleek, high-fashion sans-serif. Always use small sizes like text-[13px] md:text-sm.",
          borderClass: "border border-black/10 rounded-none",
          cardClass: "bg-black/[0.02] border border-black/5 rounded-none",
          bgStyle: "radial-gradient",
          layoutStyle: "Ultra-premium minimal editorial. Focus on asymmetrical layouts, huge margins, elegant italic subtitles, and clean single-column or split text."
        };
      } else if (vl === "editorial") {
        return {
          fontName: "Editorial Luxury",
          headingClass: "brand-font-heading font-normal",
          bodyClass: "brand-font-body font-light",
          headingDesc: "Sophisticated editorial serif. Headings should look like newspaper or magazine titles.",
          bodyDesc: "Clean sans-serif. Always use small sizes like text-[13px] md:text-sm.",
          borderClass: "border-b border-black/20 pb-2",
          cardClass: "border-l-4 border-black/40 pl-4 py-2 bg-transparent rounded-none",
          bgStyle: "linear-gradient-vertical",
          layoutStyle: "Magazine editorial. Use two-column text splits (left column for title, right column for cards), large blockquotes, and fine horizontal divider lines."
        };
      } else if (vl === "minimal") {
        return {
          fontName: "Tech Minimalist",
          headingClass: "brand-font-heading font-bold tracking-tight uppercase",
          bodyClass: "brand-font-body font-normal",
          headingDesc: "Modern, clean, geometric sans-serif. Keep headings short and sharp.",
          bodyDesc: "Sleek, clean sans-serif. Always use small sizes like text-[13px] md:text-sm.",
          borderClass: "border-none",
          cardClass: "bg-black/[0.03] border-none rounded-none",
          bgStyle: "solid",
          layoutStyle: "Ultra-minimalist layout. No borders, no divider lines. Pure whitespace, tiny labels, and clean text blocks aligned in a single axis."
        };
      } else if (vl === "bold") {
        return {
          fontName: "Bold Impact",
          headingClass: "brand-font-heading font-extrabold uppercase tracking-tight leading-none",
          bodyClass: "brand-font-body font-medium",
          headingDesc: "Wide, heavy, highly expressive display font. Headings must be uppercase, loud, and short (3-5 words max).",
          bodyDesc: "Clean geometric sans-serif. Always use text-sm.",
          borderClass: "border-4 border-black",
          cardClass: "border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          bgStyle: "linear-gradient-diagonal",
          layoutStyle: "Neobrutalist style. Solid thick black borders, heavy uppercase titles, cards with sharp black offset shadows, raw blocks."
        };
      } else if (vl === "playful") {
        return {
          fontName: "Trendy Condense",
          headingClass: "brand-font-heading font-black tracking-tight uppercase",
          bodyClass: "brand-font-body font-normal",
          headingDesc: "Bold, condensed, modern startup sans-serif.",
          bodyDesc: "Sleek, rounded feel sans-serif. Always use text-[13px] md:text-sm.",
          borderClass: "border border-black/30 rounded-full px-3 py-1",
          cardClass: "bg-black/[0.04] border border-black/10 rounded-2xl p-5",
          bgStyle: "radial-gradient",
          layoutStyle: "Modern friendly startup. Soft rounded-2xl corners on cards, badges with pill-shaped rounded borders, and playful color gradients."
        };
      } else {
        return {
          fontName: "Raw Industrial",
          headingClass: "brand-font-heading font-bold uppercase tracking-tight",
          bodyClass: "brand-font-body font-normal",
          headingDesc: "Heavy industrial display font. Headings should feel structural.",
          bodyDesc: "Monospace/geometric style sans-serif. Always use text-[13px] md:text-sm.",
          borderClass: "border-2 border-black",
          cardClass: "border-2 border-black bg-transparent rounded-none",
          bgStyle: "linear-gradient-vertical",
          layoutStyle: "Raw/code aesthetic. Use grid lines, monospace badges, thin divider lines, and code-like structures."
        };
      }
    };

    const textColor = getContrastColor(primaryColor);
    const isLightBg = textColor === "#000000";
    
    // We define clean Tailwind classes to represent text contrast dynamically using opacity
    const textPrimaryClass = isLightBg ? "text-slate-900" : "text-white";
    const textSecondaryClass = isLightBg ? "text-slate-700" : "text-white/80";
    const textMutedClass = isLightBg ? "text-slate-400" : "text-white/60";

    const profile = getStyleProfile(vibe);
    
    // Replace black/white placeholders in profile classes with the correct text colors
    const replaceColorPlaceholders = (cls: string, isLight: boolean) => {
      let result = cls
        .replace(/black/g, isLight ? "slate-900" : "white")
        .replace(/white/g, isLight ? "white" : "slate-900");
      if (!isLight) {
        result = result.replace(/rgba\(0,0,0,1\)/g, "rgba(255,255,255,1)");
      }
      return result;
    };

    const borderClass = replaceColorPlaceholders(profile.borderClass, isLightBg);
    const cardClass = replaceColorPlaceholders(profile.cardClass, isLightBg);
    const lineClass = isLightBg ? "border-slate-200" : "border-white/10";

    const blendedBg = blendColors(primaryColor, secondaryColor, 0.08);
    
    const backgroundCssStyle = profile.bgStyle === "solid"
      ? `background-color: ${primaryColor};`
      : profile.bgStyle === "linear-gradient-vertical"
      ? `background: linear-gradient(180deg, ${primaryColor} 0%, ${blendedBg} 100%);`
      : profile.bgStyle === "linear-gradient-diagonal"
      ? `background: linear-gradient(135deg, ${primaryColor} 0%, ${blendedBg} 100%);`
      : `background: radial-gradient(circle at top left, ${primaryColor} 0%, ${blendedBg} 100%);`;

    const promptGenerationInput = `You are an elite graphic designer and frontend developer specializing in ultra-premium, high-converting LinkedIn and Instagram carousels.
Your style is minimal, luxurious, and highly intellectual—similar to top agency-grade social media decks (e.g., dark layouts, fine lines, elegant typography pairings, and generous whitespace).

Brand details to ground your designs:
- Brand Name: ${brandName}
- Visual Vibe: ${vibe}
- Brand Personality: ${brandPersonality}
- Core Business Description: ${businessDescription}
- USP / Tagline: ${usp}
- Mission: ${mission}
- Target Audience: ${targetAudience}
- Primary Accent Color: ${secondaryColor} (Use as accent/highlight color)
- Background Canvas Color: ${primaryColor} (Use as main background canvas color)
${logoUrl ? `- Brand Logo URL: ${logoUrl}` : ''}
${website ? `- Website URL: ${website}` : ''}

Topic of the Carousel: "${userPrompt}"
Length: 5-7 slides.

REQUIRED TYPOGRAPHY STYLE FOR THIS DECK (MANDATORY):
We have imported five fonts. To ensure brand consistency across all slides, this carousel MUST strictly use the "${profile.fontName}" visual theme:
- Heading / Title Style: Use classes "${profile.headingClass}".
  Description: ${profile.headingDesc}
- Body / Paragraph Style: Use classes "${profile.bodyClass}".
  Description: ${profile.bodyDesc}

Strictly use the Heading Style for all major headings, slide titles, large callouts, and statistics.
Strictly use the Body/Paragraph Style for all descriptions, bullet points, labels, and small text.
To make headings feel premium, you may wrap key words inside "<span class='text-[var(--color-primary)] font-semibold' style='color: ${secondaryColor}'>...</span>" or add subtle italic touches if using a serif font.

--------------------------------------------------
BRAND LAYOUT MOTIF / DESIGN LANGUAGE (MANDATORY):
To align with the brand vibe "${vibe}", you MUST strictly adopt this design language:
- Theme motif: ${profile.layoutStyle}

--------------------------------------------------
DYNAMIC COLOR CONTRAST RULES:
To support any background color, use the following pre-compiled Tailwind classes:
- Main Titles/Headers: "${textPrimaryClass}"
- Body text & descriptions: "${textSecondaryClass}"
- Muted labels, indicators, headers/footers: "${textMutedClass}"
- Borders / Outlines: "${borderClass}" (use for badges, borders)
- Highlight Cards: "${cardClass}" (use for container boxes)
- Separator Lines: "${lineClass}" (use for hr/div lines)

NEVER use flat grey colors like "text-neutral-400" or "text-gray-500". Use the exact classes provided above—they utilize HSL/RGB opacity to blend with the background color seamlessly!

--------------------------------------------------
CRITICAL LAYOUT RULES FOR PREMIUMNESS (NO OVERLAPPING, EXACT SKELETON ON EVERY SLIDE):
To prevent elements from overlapping headers/footers on mobile, and to keep branding elements positioned at EXACTLY the same coordinates across ALL slides:

1. EVERY single slide HTML code MUST strictly adhere to this exact 3-tier layout skeleton. You are forbidden to deviate from this skeleton structure:
   <div class="relative w-full h-full p-8 flex flex-col justify-between overflow-hidden" style="${backgroundCssStyle} color: ${textColor};">
     <!-- TOP HEADER (Thin horizontal bar, shrink-0) -->
     <div class="w-full flex justify-between items-center shrink-0 border-b ${borderClass} pb-2 z-10">
       <span class="text-[10px] uppercase font-black tracking-widest ${textPrimaryClass}">[Category Name, e.g. PERFORMANCE METRICS]</span>
       <span class="text-[10px] tracking-widest ${textMutedClass} font-mono">[Slide number, e.g. 02 / 06]</span>
     </div>

     <!-- MIDDLE CONTENT BLOCK (flex-1, min-h-0, overflow-hidden) -->
     <div class="flex-1 flex flex-col justify-center min-h-0 overflow-hidden py-4 gap-3 z-10">
       <!-- All slide headings, body text, lists, quotes, and buttons MUST reside strictly inside this block. -->
     </div>

     <!-- BOTTOM FOOTER (Thin horizontal bar, shrink-0) -->
     <div class="w-full flex justify-between items-center shrink-0 border-t ${borderClass} pt-2 z-10">
       ${logoUrl ? `
       <div class="flex items-center gap-1.5 shrink-0">
         <img src="${logoUrl}" class="h-4 w-auto object-contain select-none" style="max-height: 16px;" />
         <span class="text-[10px] uppercase font-bold tracking-[0.25em] ${textMutedClass}">${brandName.toUpperCase()}</span>
       </div>
       ` : `
       <span class="text-[10px] uppercase font-bold tracking-[0.25em] ${textMutedClass}">${brandName.toUpperCase()}</span>
       `}
       <span class="text-[10px] uppercase font-bold tracking-[0.2em] ${textMutedClass}">${website.toUpperCase() || `@${brandName.toLowerCase()}`}</span>
     </div>
   </div>

2. Branding Consistency:
   - The brand name logo ("${brandName.toUpperCase()}") and website/handle must ALWAYS reside strictly in the Bottom Footer, on the left and right respectively.
   - You are strictly forbidden from placing the logo or website at the top of the slide, or changing their layouts from slide to slide. They must align perfectly across the deck.

3. Strict Font Budget & Overflow Prevention (Mandatory):
   - Every slide has a fixed square aspect ratio. On mobile, vertical height is extremely short.
   - Content inside the Middle Content Block must be kept short to prevent vertical overflow.
   - Text budget limits:
     - Main Slide Title: Max 5 words (Max 2 lines).
     - Body Paragraph Text: Max 20 words (Max 3 lines).
     - Card / Sub-content Text: Max 12 words (Max 2 lines).
   - Use these exact sizing classes:
     - Slide titles: Use "text-lg md:text-xl font-extrabold leading-tight".
     - Hook (cover) title: Use "text-xl md:text-2xl font-black leading-tight".
     - Paragraph/Body: Use "text-[12px] md:text-[13px] leading-relaxed".
     - Numbered list headers: Use "text-[13px] md:text-sm font-bold".

--------------------------------------------------
ABSOLUTELY NO CHEAP EMOJIS:
- NEVER use standard emojis (like ✅, ❌, 🔥, 🚀, 💡) as list bullets or icons. It cheapens the design immediately.
- Use elegant inline SVGs or clean text-based tags:
  - Mini Badge: "<span class='inline-block text-[9px] uppercase font-black tracking-widest ${textPrimaryClass} px-2 py-0.5 border ${borderClass} mb-1'>LESSON 01 OF 04</span>"
  - Highlight Card: For key lessons, use a subtle dark or light box with a nested label:
    "<div class='${cardClass} border p-4 rounded-none mt-2'><span class='text-[9px] uppercase tracking-widest font-bold text-[var(--color-primary)] mb-1 block' style='color: ${secondaryColor}'>THE REAL LESSON</span><p class='text-sm ${textSecondaryClass} font-light leading-relaxed'>Funding is not validation. Build real infrastructure first.</p></div>"
  - Separators: Simple thin lines "<hr class='border-t ${lineClass} my-2 w-12' />" to divide sections.

--------------------------------------------------
LAYOUT DIVERSITY INSTRUCTIONS:
Do NOT make every slide look identical in layout structure. Introduce layout variety:
- Use split layouts (e.g. left column for title, right column for cards) for at least one content slide.
- Use bento-grid layouts (e.g. grid with unequal columns) for the tip slide.
- Introduce numbered lists with massive decorative numbers (e.g., "01", "02") in the Heading style.

--------------------------------------------------
SLIDE TEMPLATES:
Generate a refined sequence of these specific slides:
1. "hook" (Cover): A minimal, striking title slide. A large centered title with high-contrast font pairing, a category pill at the top, and bottom branding + swipe indicator. Keep the title inside a single, cohesive, block-aligned heading element (e.g. h1 or h2). Do NOT split different words of the title into separate, independent divs or float them around.
2. "content" (Insight/Bento): A lesson slide. Tiny badge -> Large uppercase heading -> Thin line separator -> 3-4 lines of punchy paragraph content -> A premium highlight card at the bottom.
3. "stat" (Credibility): A giant stat slide. A huge colored statistic (e.g., "90%", "10X", "4.2M") in "text-6xl md:text-7xl font-extrabold leading-none" in the Heading style -> Under it, a short sentence explaining the metric -> A clean content box with structural details.
4. "quote" (Thought Leadership): A beautiful centralized quote. Giant quotation mark -> Quote text in italic leading-relaxed text in the Heading Style -> Author details in small tracking-wider font.
5. "tip" (Actionable Value): A beautiful box with a primary accent border. Contains a checklist or warning, using clean inline SVGs for checks/crosses (no emojis).
6. "cta" (Call to Action): A minimalist end slide. Centralized header -> A beautifully simple outline button ("style='border-color: ${secondaryColor}'") -> Subtle prompt to save/share.

--------------------------------------------------
FLUX BACKGROUND GRAPHIC PROMPT:
Design a highly detailed backdrop prompt for FLUX.1.
It must be a sleek, clean, modern, and abstract graphic (e.g., luxury desk corner, geometric architectural shadows, soft organic linen waves, premium abstract waves) which respects the brand colors (${primaryColor} and ${secondaryColor}) and is completely text-free. Make the prompt 150-250 words, photorealistic, shot on Hasselblad 80mm lens.

OUTPUT FORMAT:
Return the result STRICTLY as a JSON object with the following structure:
{
  "fluxPrompt": "A detailed FLUX image generation prompt starting with: 'A premium professional backdrop graphic...'",
  "slides": [
    {
      "type": "hook",
      "html": "<div class='relative w-full h-full p-8 flex flex-col justify-between overflow-hidden' style='color: ${textColor};'><!-- top header --><div class='w-full flex justify-between items-center shrink-0 border-b ${borderClass} pb-2 z-10'><span class='text-[10px] uppercase font-black tracking-widest ${textPrimaryClass}'>COVER STORY</span><span class='text-[10px] tracking-widest ${textMutedClass} font-mono'>01 / 05</span></div><!-- content --><div class='flex-1 flex flex-col justify-center min-h-0 overflow-hidden py-4 gap-3 z-10'><span class='inline-block text-[9px] uppercase font-black tracking-widest ${textPrimaryClass} px-2 py-0.5 border ${borderClass} mb-1'>BRAND OUTLINE</span><h1 class='text-xl md:text-2xl font-black leading-tight ${textPrimaryClass}'>Title goes here</h1><p class='text-[12px] md:text-[13px] leading-relaxed ${textSecondaryClass}'>Body content here</p></div><!-- footer --><div class='w-full flex justify-between items-center shrink-0 border-t ${borderClass} pt-2 z-10'><span class='text-[10px] uppercase font-bold tracking-[0.25em] ${textMutedClass}'>${brandName.toUpperCase()}</span><span class='text-[10px] uppercase font-bold tracking-[0.2em] ${textMutedClass}'>${website.toUpperCase()}</span></div></div>",
      "backgroundConfig": {
        "scale": 1.15,
        "rotation": 0,
        "brightness": 0.6,
        "contrast": 1.0,
        "saturation": 0.9
      }
    }
  ]
}
Do not include markdown code block formatting. Ensure the HTML matches the brand colors, uses the typography pairings, has large spacing, and looks incredibly premium.`;

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
                  type: { type: "STRING" },
                  html: { type: "STRING" },
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
                required: ["type", "html", "backgroundConfig"],
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
            type: "hook",
            html: `<div class="relative w-full h-full p-8 flex flex-col justify-between overflow-hidden" style="${backgroundCssStyle} color: ${textColor};">
              <div class="w-full flex justify-between items-center shrink-0 border-b ${borderClass} pb-2 z-10">
                <span class="text-[10px] uppercase font-black tracking-widest ${textPrimaryClass}">COVER STORY</span>
                <span class="text-[10px] tracking-widest ${textMutedClass} font-mono">01 / 05</span>
              </div>
              <div class="flex-1 flex flex-col justify-center min-h-0 overflow-hidden py-4 gap-3 z-10">
                <span class="inline-block text-[9px] uppercase font-black tracking-widest ${textPrimaryClass} px-2 py-0.5 border ${borderClass} mb-1">BRAND OUTLINE</span>
                <h1 class="text-xl md:text-2xl font-black leading-tight ${textPrimaryClass}">Redefining ${brandName}</h1>
                <p class="text-[12px] md:text-[13px] leading-relaxed ${textSecondaryClass}">Curated and meticulous solutions for the modern ${industry} landscape.</p>
              </div>
              <div class="w-full flex justify-between items-center shrink-0 border-t ${borderClass} pt-2 z-10">
                <span class="text-[10px] uppercase font-bold tracking-[0.25em] ${textMutedClass}">${brandName.toUpperCase()}</span>
                <span class="text-[10px] uppercase font-bold tracking-[0.2em] ${textMutedClass}">${website.toUpperCase() || `@${brandName.toLowerCase()}`}</span>
              </div>
            </div>`,
            backgroundConfig: { scale: 1.1, rotation: 0, brightness: 0.65, contrast: 1.0, saturation: 0.9 }
          },
          {
            type: "content",
            html: `<div class="relative w-full h-full p-8 flex flex-col justify-between overflow-hidden" style="${backgroundCssStyle} color: ${textColor};">
              <div class="w-full flex justify-between items-center shrink-0 border-b ${borderClass} pb-2 z-10">
                <span class="text-[10px] uppercase font-black tracking-widest ${textPrimaryClass}">THE SHIFT</span>
                <span class="text-[10px] tracking-widest ${textMutedClass} font-mono">02 / 05</span>
              </div>
              <div class="flex-1 flex flex-col justify-center min-h-0 overflow-hidden py-4 gap-3 z-10">
                <h2 class="text-lg md:text-xl font-bold leading-tight ${textPrimaryClass}">Rejecting the Ordinary</h2>
                <p class="text-[12px] md:text-[13px] leading-relaxed ${textSecondaryClass}">We believe in soulfully designed spaces and experiences over generic search boxes.</p>
                <div class="${cardClass} border p-4 rounded-none mt-2">
                  <span class="text-[9px] uppercase tracking-widest font-bold text-[var(--color-primary)] mb-1 block" style="color: ${secondaryColor}">THE VISION</span>
                  <p class="text-xs ${textSecondaryClass} font-light leading-relaxed">Meticulous curation is a standard, not a premium add-on.</p>
                </div>
              </div>
              <div class="w-full flex justify-between items-center shrink-0 border-t ${borderClass} pt-2 z-10">
                <span class="text-[10px] uppercase font-bold tracking-[0.25em] ${textMutedClass}">${brandName.toUpperCase()}</span>
                <span class="text-[10px] uppercase font-bold tracking-[0.2em] ${textMutedClass}">${website.toUpperCase() || `@${brandName.toLowerCase()}`}</span>
              </div>
            </div>`,
            backgroundConfig: { scale: 1.25, rotation: 4, brightness: 0.55, contrast: 1.1, saturation: 0.8 }
          },
          {
            type: "stat",
            html: `<div class="relative w-full h-full p-8 flex flex-col justify-between overflow-hidden" style="${backgroundCssStyle} color: ${textColor};">
              <div class="w-full flex justify-between items-center shrink-0 border-b ${borderClass} pb-2 z-10">
                <span class="text-[10px] uppercase font-black tracking-widest ${textPrimaryClass}">CREDIBILITY</span>
                <span class="text-[10px] tracking-widest ${textMutedClass} font-mono">03 / 05</span>
              </div>
              <div class="flex-1 flex flex-col justify-center min-h-0 overflow-hidden py-4 gap-3 z-10">
                <h1 class="text-5xl md:text-6xl font-black leading-none ${textPrimaryClass}" style="color: ${secondaryColor}">10X</h1>
                <p class="text-[12px] md:text-[13px] leading-relaxed ${textSecondaryClass}">Growth in customer trust and satisfaction ratings through boutique curation.</p>
              </div>
              <div class="w-full flex justify-between items-center shrink-0 border-t ${borderClass} pt-2 z-10">
                <span class="text-[10px] uppercase font-bold tracking-[0.25em] ${textMutedClass}">${brandName.toUpperCase()}</span>
                <span class="text-[10px] uppercase font-bold tracking-[0.2em] ${textMutedClass}">${website.toUpperCase() || `@${brandName.toLowerCase()}`}</span>
              </div>
            </div>`,
            backgroundConfig: { scale: 1.35, rotation: -3, brightness: 0.5, contrast: 1.2, saturation: 0.85 }
          },
          {
            type: "tip",
            html: `<div class="relative w-full h-full p-8 flex flex-col justify-between overflow-hidden" style="${backgroundCssStyle} color: ${textColor};">
              <div class="w-full flex justify-between items-center shrink-0 border-b ${borderClass} pb-2 z-10">
                <span class="text-[10px] uppercase font-black tracking-widest ${textPrimaryClass}">ACTION STEPS</span>
                <span class="text-[10px] tracking-widest ${textMutedClass} font-mono">04 / 05</span>
              </div>
              <div class="flex-1 flex flex-col justify-center min-h-0 overflow-hidden py-4 gap-3 z-10">
                <h2 class="text-lg md:text-xl font-bold leading-tight ${textPrimaryClass}">Core Opportunities</h2>
                <p class="text-[12px] md:text-[13px] leading-relaxed ${textSecondaryClass}">Synchronizing travel plans with your specific mood and artistic direction.</p>
              </div>
              <div class="w-full flex justify-between items-center shrink-0 border-t ${borderClass} pt-2 z-10">
                <span class="text-[10px] uppercase font-bold tracking-[0.25em] ${textMutedClass}">${brandName.toUpperCase()}</span>
                <span class="text-[10px] uppercase font-bold tracking-[0.2em] ${textMutedClass}">${website.toUpperCase() || `@${brandName.toLowerCase()}`}</span>
              </div>
            </div>`,
            backgroundConfig: { scale: 1.2, rotation: 2, brightness: 0.6, contrast: 1.0, saturation: 0.95 }
          },
          {
            type: "cta",
            html: `<div class="relative w-full h-full p-8 flex flex-col justify-between overflow-hidden" style="${backgroundCssStyle} color: ${textColor};">
              <div class="w-full flex justify-between items-center shrink-0 border-b ${borderClass} pb-2 z-10">
                <span class="text-[10px] uppercase font-black tracking-widest ${textPrimaryClass}">GET STARTED</span>
                <span class="text-[10px] tracking-widest ${textMutedClass} font-mono">05 / 05</span>
              </div>
              <div class="flex-1 flex flex-col justify-center min-h-0 overflow-hidden py-4 gap-3 z-10 items-center text-center">
                <h2 class="text-xl md:text-2xl font-black leading-tight ${textPrimaryClass} mb-2">Begin Your Journey</h2>
                <p class="text-[12px] md:text-[13px] leading-relaxed ${textSecondaryClass} mb-4">Step into a sanctuary of premium, curated aesthetics.</p>
                <div class="inline-block px-5 py-2 border font-bold text-xs uppercase tracking-wider" style="border-color: ${secondaryColor}; color: ${secondaryColor};">
                  Get Access Now
                </div>
              </div>
              <div class="w-full flex justify-between items-center shrink-0 border-t ${borderClass} pt-2 z-10">
                <span class="text-[10px] uppercase font-bold tracking-[0.25em] ${textMutedClass}">${brandName.toUpperCase()}</span>
                <span class="text-[10px] uppercase font-bold tracking-[0.2em] ${textMutedClass}">${website.toUpperCase() || `@${brandName.toLowerCase()}`}</span>
              </div>
            </div>`,
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

    const getBgStyleForSlide = (index: number) => {
      const transforms = [
        { scale: 1.25, rotate: 0, origin: "center", position: "center" },
        { scale: 1.4, rotate: 5, origin: "top left", position: "top left" },
        { scale: 1.35, rotate: -6, origin: "bottom right", position: "bottom right" },
        { scale: 1.45, rotate: 10, origin: "center", position: "center" },
        { scale: 1.3, rotate: -5, origin: "top right", position: "top right" },
        { scale: 1.5, rotate: 8, origin: "bottom left", position: "bottom left" },
        { scale: 1.28, rotate: -10, origin: "center", position: "center" },
      ];
      const t = transforms[index % transforms.length];
      return `background-image: var(--bg-image); opacity: var(--bg-opacity, 0.08); background-size: cover; background-position: ${t.position}; transform: scale(${t.scale}) rotate(${t.rotate}deg); transform-origin: ${t.origin}; -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 80%); mask-image: radial-gradient(circle at center, black 30%, transparent 80%); position: absolute; inset: 0px; pointer-events: none; z-index: 0;`;
    };

    const processedSlides = (carouselData.slides || []).map((slide: any, index: number) => {
      if (slide.html) {
        const rootDivEndIndex = slide.html.indexOf(">");
        if (rootDivEndIndex !== -1) {
          const bgStyle = getBgStyleForSlide(index);
          const bgDiv = `<div style="${bgStyle}"></div>`;
          slide.html = slide.html.substring(0, rootDivEndIndex + 1) + bgDiv + slide.html.substring(rootDivEndIndex + 1);
        }
      }
      return slide;
    });

    return NextResponse.json({
      imageUrl,
      fluxPrompt,
      slides: processedSlides,
    });
  } catch (error: any) {
    console.error("Carousel generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate carousel." },
      { status: 500 }
    );
  }
}
