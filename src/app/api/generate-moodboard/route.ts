import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const brandName    = String(body.brandName    || "Brand");
    const industry     = String(body.industry     || "Technology");
    const brandPersonality = Array.isArray(body.brandPersonality)
      ? (body.brandPersonality as string[]).join(", ")
      : String(body.brandPersonality || "Professional");
    const brandValues: string[] = Array.isArray(body.brandValues) ? body.brandValues : [];
    const usp          = String(body.usp          || "");
    const website      = String(body.website      || "");
    const mission      = String(body.mission      || "");
    const vision       = String(body.vision       || "");
    const tagline      = String(body.tagline      || usp);
    const targetAudience = String(body.targetAudience   || "");
    const customerPersonas = String(body.customerPersonas || "");
    const competitors: string[] = Array.isArray(body.competitors) ? body.competitors : [];
    const primaryColor   = String(body.primaryColor   || "#1A0A00");
    const secondaryColor = String(body.secondaryColor || "#C9A84C");

    const falApiKey = process.env.FAL_API_KEY;
    if (!falApiKey) {
      return NextResponse.json({ error: "FAL_API_KEY is not configured" }, { status: 500 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    let moodboardPrompt = "";

    if (geminiApiKey) {
      try {
        // ── Gemini is instructed to write the EXACT visual description for the fal.ai board ──
        const promptGenerationInput = `You are an award-winning Brand Strategist, Creative Director, and Social Media Art Director.

Your task is to write a SINGLE, detailed image-generation prompt for FLUX.1 (a diffusion model) that will produce a PREMIUM BRAND MARKETING & SOCIAL MEDIA MOODBOARD PRESENTATION BOARD that looks exactly like a professional agency strategy document.

BRAND INFORMATION:
- Company Name: ${brandName}
- Tagline / USP: ${tagline || usp}
- Industry: ${industry}
- Website: ${website}
- Mission: ${mission}
- Vision: ${vision}
- Brand Personality: ${brandPersonality}
- Core Values: ${brandValues.slice(0, 5).join(", ")}
- Target Audience: ${targetAudience}
- Customer Persona: ${customerPersonas}
- Competitors: ${competitors.slice(0, 3).join(", ")}
- Primary Color: ${primaryColor}
- Secondary Color: ${secondaryColor}

REQUIRED BOARD LAYOUT (must include ALL 20 sections, arranged in a dense multi-row grid exactly like a Pentagram / Collins / La Vivenzia agency brand book):

VISUAL STYLE MANDATE:
- Dark black/obsidian background (#0D0A06 or similar near-black warm dark)
- Thin gold/bronze hairline dividers between all sections
- Gold and cream typography (no white — use warm cream #F5ECD7 and gold #C9A84C)
- Overall feel: luxury editorial, cinematic, invitation-only, world-class
- Resolution: ultra-detailed 8K presentation graphic, photorealistic photography inserts
- Format: Wide landscape presentation board, densely packed with information

TOP LEFT BLOCK — Brand Identity Header:
- Large gold monogram/crest logo mark in top left corner (abstract or letter-based)
- Brand name "${brandName}" in elegant serif or luxury sans below the mark
- Tagline "${tagline || usp}" in small italic caption below brand name
- One evocative brand positioning line in small body copy

SECTION 1 — Brand Personality Grid (top-center):
- Section header "1. BRAND PERSONALITY" in gold uppercase tracking
- 2-column grid of personality words relevant to ${brandPersonality} and ${industry}
- Words styled as clean uppercase labels — luxury, cinematic, authoritative, etc.
- A highlighted brand mission strip below the words

SECTION 2 — Visual Identity & Photography Direction (top-right):
- Section header "2. VISUAL IDENTITY & PHOTOGRAPHY DIRECTION"
- 3 high-end editorial photographs arranged in a masonry grid
- Photos must match brand industry: ${industry} — ${brandPersonality} aesthetics
- Images: one wide cinematic shot, one detail/texture shot, one lifestyle/product shot
- All dramatically lit, moody, and ultra-premium

SECTION 3 — Photography Direction (left column):
- "3. PHOTOGRAPHY DIRECTION"
- DO column: 7 checkmark bullet points (wide cinematic shots, human emotion, natural luxury, golden lighting, reflections, premium interiors, brand textures)
- DON'T column: 5 ✗ bullet points (stock photos, over-edited HDR, smiling at camera, crowded tourist places, bright flashy colors)

SECTION 4 — Instagram / Content Feed Preview (center):
- "4. INSTAGRAM FEED PREVIEW"
- 3×3 or 4×4 mock grid of square content tiles
- Mix: 2 quote cards in ${primaryColor}, 4 moody editorial photos, 1 reel cover tile, 1 carousel preview, 1 product/detail tile
- Labels below: QUOTE, TRAVEL, EXPERIENCE, LIFESTYLE, ARCHITECTURE, FOOD, MEMBER STORY, DESTINATION, REEL COVER

SECTION 5 — Post Categories (right column):
- "5. POST CATEGORIES"
- 10 icon-labeled content types with small icons
- Relevant to ${industry}: Experience Stories, Destination Highlights, Member Stories, Expert Tips, Behind the Scenes, Founder Notes, Product/Service Spotlight, Hidden Gems, Premium Lifestyle, Seasonal Collections

SECTION 6 — Carousel Style (bottom-left):
- "6. CAROUSEL STYLE"
- 5 mini slide mockups in a horizontal row labeled 01–05
- Slide 01: Hero headline slide (bold discovery headline)
- Slide 02: Destination/product detail with bullet points
- Slide 03: Quote slide with attribution
- Slide 04: Brand philosophy statement
- Slide 05: CTA slide ("BECOME A MEMBER" or relevant action)
- Each slide has the brand logo mark watermark bottom-right

SECTION 7 — Reel Direction (right):
- "7. REEL DIRECTION"
- Storyboard strip: HOOK (0–3 sec), TRANSITION, DETAIL SHOT, DRONE VIEW, SLOW MOTION, ELEGANT ENDING
- 6 mini video frame thumbnails in a horizontal strip
- Music style tags: PIANO · ORCHESTRAL · AMBIENT · LUXURY LOUNGE · CINEMATIC

SECTION 8 — Typography System (bottom-left):
- "8. TYPOGRAPHY IN USE"
- Large display heading example in enormous serif: "THE WORLD BEYOND ORDINARY"
- Below it: BODY TEXT example paragraph, CAPTION EXAMPLE, STORY HEADLINE, PRICE ANNOUNCEMENT (styled with separator and per-unit label), QUOTE STYLE in italic

SECTION 9 — Social Media Templates (center):
- "9. SOCIAL TEMPLATES"
- 8 mini platform mockups: Instagram Post 4:5, Instagram Story 9:16, LinkedIn Banner, LinkedIn Carousel, Pinterest Pin 2:3, YouTube Thumbnail, Email Banner, Facebook Cover, WhatsApp Story
- Each is a tiny dark-themed card with brand logo and sample layout

SECTION 10 — Copywriting Tone (right):
- "10. COPYWRITING TONE"
- Two-column comparison: INSTEAD OF → SAY THIS INSTEAD
- 5 rows showing transformation from generic to luxury brand voice
- Relevant to ${industry} and ${brandPersonality}

SECTION 11 — Iconography (bottom row):
- "11. ICONOGRAPHY"
- 8 line-icon circles showing brand-relevant custom icons
- Labels below each icon

SECTION 12 — Motion Direction (left):
- "12. MOTION DIRECTION"
- 5 animation style tags: FADE IN/OUT, SLOW ZOOM, PARALLAX EFFECT, SMOOTH TRANSITIONS, GOLD SHIMMER, FLOATING TEXT
- Small stacked label list

SECTION 13 — Content Pillars (center):
- "13. CONTENT PILLARS"
- Donut/ring chart in gold and dark tones showing content split percentages
- 4–5 pillars: Experiences 40%, Destinations 25%, Lifestyle 15%, Behind The Scenes 10%, Offers 10%
- Percentages and labels in cream text

SECTION 14 — Campaign Concepts (center):
- "14. CAMPAIGN CONCEPTS"
- 4 mini editorial campaign mood cards in a 2×2 grid
- Each card: campaign name, 1 editorial image, and subtitle
- Names relevant to brand: SUMMER ESCAPE, WINTER COLLECTION, HIDDEN EUROPE, etc.

SECTION 15 — Hashtag Strategy (right):
- "15. HASHTAG STRATEGY"
- 3 categories: LUXURY · TRAVEL/INDUSTRY · LOCATION · NICHE
- 3–4 hashtags each category in small monospace text
- All brand-relevant

SECTION 16 — CTA System (far right):
- "16. CTA SYSTEM"
- 5 styled call-to-action button mockups stacked vertically
- Button styles: DISCOVER MORE (filled), BECOME A MEMBER (gold), EXPLORE EXPERIENCES (outline), REQUEST CONCIERGE (dark), RESERVE YOUR JOURNEY (minimal text link)

SECTION 17 — Color Usage (bottom-left):
- "17. COLOR USAGE"
- 3 large color swatches with hex values and percentage usage
- Primary ${primaryColor} at 85%, Accent ${secondaryColor} at 10%, Highlight/cream at 5%
- Labels: BACKGROUND, ACCENT, HIGHLIGHT

SECTION 18 — Brand Voice (bottom-center):
- "18. BRAND VOICE"
- Two columns: WE ARE (positive attributes) vs WE ARE NOT (negative attributes)
- 5 words each in elegant stacked list
- Brand logo watermark embedded

SECTION 19 — Content Ratio (bottom):
- "19. CONTENT RATIO"
- Horizontal bar chart or stacked bars
- Content type ratios: Lifestyle 40%, Destinations 25%, Luxury Details 15%, Member Stories 10%, Brand 10%

SECTION 20 — Mood Summary / Brand Manifesto (bottom-right):
- "20. MOOD SUMMARY"
- 3–4 sentence brand manifesto paragraph
- Poetic, luxury, aspirational tone matching ${brandPersonality}
- Footer: "${brandName} — ${tagline || usp}" in gold small caps

BOTTOM FOOTER:
- Full-width thin gold hairline above footer
- Footer: "${brandName} — ${tagline || usp}" centered in gold uppercase tracking
- Brand logo mark far right

OUTPUT RULES:
- Return ONLY the image prompt text starting with: "A premium professional brand marketing and social media strategy moodboard presentation board for ${brandName}..."
- The prompt must be extremely detailed, describing every visual element, color, typography, layout, photography direction
- No markdown, no explanations, no section headers — just one long flowing descriptive prompt
- Describe textures, lighting, mood, and typography precisely
- The board must look like a real $50,000 agency deliverable`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
        const geminiResponse = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptGenerationInput }] }],
            generationConfig: {
              temperature: 1.0,
              maxOutputTokens: 1500,
            },
          }),
        });

        if (geminiResponse.ok) {
          const resJson = await geminiResponse.json();
          moodboardPrompt = resJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        }
      } catch (err) {
        console.error("Gemini moodboard prompt generation failed, using fallback:", err);
      }
    }

    // ── Fallback: dense manual prompt if Gemini fails ──
    if (!moodboardPrompt) {
      moodboardPrompt = `A premium professional brand marketing and social media strategy moodboard presentation board for ${brandName}, a ${industry} brand with ${brandPersonality} personality. Dark warm obsidian black background with thin hairline gold dividers separating 20 distinct labeled sections arranged in a dense multi-row editorial grid layout. Top-left: gold monogram crest logo mark for ${brandName} with tagline "${tagline || usp}" in ivory serif. Top-center: Brand Personality section with two-column grid of uppercase luxury words. Top-right: Visual Identity photography direction with three dramatic cinematic ${industry} editorial photographs in moody golden lighting. Left column: Photography direction DO/DON'T checklist in cream text. Center: Instagram feed mock grid with 9 square content tiles mixing editorial photos, gold quote cards, and reel covers. Right: 10 post categories with icons. Second row left: Carousel style mockup showing 5 slides numbered 01-05. Center: Reel direction storyboard with 6 video frame thumbnails and music style tags. Third row: Typography system with giant serif "THE WORLD BEYOND ORDINARY" display heading and body text specimens. Social templates section showing 9 platform card mockups. Copywriting tone comparison table. Fourth row: Iconography icons, Motion direction tags, Content pillars donut chart in gold, Campaign concept cards. Bottom row: Color swatches (${primaryColor} 85%, ${secondaryColor} 10%, cream 5%), Brand voice WE ARE/NOT table, Content ratio bar chart, Mood summary manifesto paragraph. Full footer in gold: "${brandName} — ${tagline || usp}". Ultra-detailed 8K resolution, photorealistic photography inserts, luxury editorial design, $50000 branding agency quality presentation.`;
    }

    // ── Call fal.ai Flux Schnell to render the board ──
    let imageUrl: string | null = null;
    let genError: string | null = null;

    try {
      const res = await fetch("https://fal.run/fal-ai/flux/schnell", {
        method: "POST",
        headers: {
          Authorization: `Key ${falApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: moodboardPrompt,
          image_size: "landscape_16_9",
          num_inference_steps: 4,
          num_images: 1,
          enable_safety_checker: true,
          output_format: "png",
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Fal moodboard generation failed:", errText);
        genError = `fal.ai returned status ${res.status}`;
      } else {
        const result = await res.json();
        imageUrl = result?.images?.[0]?.url || null;
      }
    } catch (e: any) {
      console.error("Fal moodboard generation exception:", e.message);
      genError = e.message;
    }

    const singleMood = {
      id: "option_1",
      name: "Bespoke Brand Strategy Board",
      tagline: `Premium visual identity & social strategy for ${brandName}`,
      prompt: moodboardPrompt,
      imageUrl,
      error: genError,
    };

    return NextResponse.json({
      moodboards: [singleMood],
      successful: imageUrl ? 1 : 0,
      total: 1,
      brandName,
    });
  } catch (error: any) {
    console.error("Moodboard generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate moodboard" }, { status: 500 });
  }
}
