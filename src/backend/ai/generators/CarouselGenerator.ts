import { IGenerationModule, GenerationContext, GenerationResult } from '../interfaces/IGenerationModule';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { determineDesignLanguage, getStyleProfile, getContrastColor, resolveInitialImage } from '../utils/styleProfiles';
import { getTemplateForLanguage, TemplateOptions } from '../utils/htmlTemplates';

export class CarouselGenerator implements IGenerationModule {
  jobType = 'generate_carousel';

  async buildContext(input: Record<string, any>, workspaceId: string): Promise<GenerationContext> {
    return {
      userId: input.userId,
      orgId: input.orgId,
      workspaceId,
      inputParams: input
    };
  }

  async buildPrompt(context: GenerationContext): Promise<string> {
    const { inputParams } = context;
    const { 
      topic = "A professional marketing carousel", 
      brandName = "Brand",
      brandPersonality = "Luxury", 
      businessDescription = "",
      targetAudience = "",
      usp = "",
      aspectRatio = "4/5"
    } = inputParams;

    const assignedLanguage = determineDesignLanguage(brandPersonality, businessDescription);

    return `
You are an elite, world-class copywriter, art director, and content strategist specializing in ultra-premium, high-converting LinkedIn and Instagram carousels.
Your style flawlessly matches the brand's visual identity, vibe, and tone of voice, acting as the ultimate manifestation of the brand's DNA.

--- BRAND DNA & IDENTITY ---
- Brand Name: ${brandName}
- Visual Vibe & Tone: ${brandPersonality}
- Core Business: ${businessDescription}
- Target Audience: ${targetAudience}
- Unique Selling Proposition: ${usp}
- Assigned Design Language: ${assignedLanguage}

DESIGN LANGUAGE DIRECTIVES for ${assignedLanguage}:

Topic of the Carousel: "${topic}"
Length: 5-7 slides.

--- DESIGN LANGUAGE RULES FOR COPY ---
When writing for specific design languages, adapt the pacing, punctuation, and length:
- Blueprint: Technical, structured, heavily reliant on lists and exact metrics. 
- Brutalism / Neo-Brutalism: Punchy, aggressive, very short sentences. Use bold declarations.
- Swiss Style: Objective, clear, perfectly structured, no fluff.
- Surrealism: Ethereal, abstract, poetic hooks, slightly unusual phrasing.
- Minimalism: Extremely concise. Let the negative space do the talking. 1-2 lines max per slide.
- Maximalism: Loud, energetic, dense information, highly persuasive and enthusiastic.
- Retro/Hand Drawn: Nostalgic, casual, friendly, conversational.

--- CRITICAL RULES ---
1. WRITE WORLD-CLASS COPY: No generic marketing jargon. Use psychological hooks, counter-narratives, and undeniable value.
2. PERFECT PACING: Every slide must flow seamlessly into the next.
3. CLEAR PURPOSE: Each slide has a role (Hook, Context, Value/Framework, Example, Hard/Soft CTA).
4. BRAND ALIGNMENT: The vocabulary and tone must sound exactly like the brand DNA provided above.

Return the result STRICTLY as a JSON object with the following structure. DO NOT include markdown formatting (\`\`\`json):
{
  "slides": [
    { 
      "type": "hook", 
      "category": "MARKETING INSIGHT",
      "title": "The specific hook title that stops the scroll.",
      "content": "Short, compelling subtitle setting up the premise."
    },
    { 
      "type": "content", 
      "category": "Step 1",
      "title": "Main Point or Framework Step",
      "content": "Detailed, highly actionable explanation."
    }
  ]
}
`;
  }

  optimizePrompt(prompt: string, targetModel: string): string {
    return prompt;
  }

  routeProvider(context: GenerationContext): string {
    return 'html_renderer';
  }

  async execute(prompt: string, provider: string, context: GenerationContext, updateProgress: (p: number, s: string) => Promise<void>): Promise<GenerationResult> {
    const startTime = Date.now();
    await updateProgress(10, 'initializing_gemini');
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    await updateProgress(40, 'generating_slides_content');
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    
    let jsonOutput = result.response.text();
    let parsedSlides: any[] = [];
    try {
      const parsed = JSON.parse(jsonOutput);
      parsedSlides = parsed.slides || [];
    } catch (err) {
      console.error("Failed to parse carousel JSON", err);
    }

    await updateProgress(90, 'rendering_html_carousel');

    // Build HTML from structured JSON
    const { 
      brandName = "Brand",
      brandPersonality = "Luxury", 
      primaryColor = "#FFB800",
      secondaryColor = "#000000",
      website = "",
      logoUrl = "",
      fonts = [],
      aspectRatio = "4/5"
    } = context.inputParams;

    const assignedLanguage = determineDesignLanguage(brandPersonality, context.inputParams.businessDescription || "");
    const profile = getStyleProfile(assignedLanguage);
    const textColor = getContrastColor(secondaryColor);
    const isLightBg = textColor === "#000000";
    
    const primaryFontName = context.inputParams.primaryFont || (Array.isArray(fonts) && fonts.length > 0 ? fonts[0] : null);
    const bodyFontName = context.inputParams.bodyFont || (Array.isArray(fonts) && fonts.length > 1 ? fonts[1] : null);

    let fontImports: string[] = [];
    if (primaryFontName) {
      fontImports.push(`family=${encodeURIComponent(primaryFontName)}:ital,wght@0,300;0,400;0,600;0,700;0,800;1,400`);
    }
    if (bodyFontName && bodyFontName !== primaryFontName) {
      fontImports.push(`family=${encodeURIComponent(bodyFontName)}:ital,wght@0,300;0,400;0,600;0,700`);
    }

    const fontImportCss = fontImports.length > 0 
      ? `@import url('https://fonts.googleapis.com/css2?${fontImports.join('&')}&display=swap');` 
      : '';

    const headlineFontStyle = primaryFontName ? `font-family: '${primaryFontName}', serif, sans-serif;` : '';
    const bodyFontStyle = bodyFontName ? `font-family: '${bodyFontName}', sans-serif;` : '';

    const bgImgRes = await resolveInitialImage(assignedLanguage, context.inputParams);
    const bgImageUrl = bgImgRes?.url || "";

    const finalSlides = parsedSlides.map((s: any, idx: number) => {
      const slideNum = (idx + 1).toString().padStart(2, '0');
      const totalSlides = parsedSlides.length.toString().padStart(2, '0');

      const options: TemplateOptions = {
        brandName,
        website: website || "@" + brandName.toLowerCase(),
        logoUrl,
        primaryColor,
        secondaryColor,
        textColor,
        isLightBg,
        fontImportCss,
        headlineFontStyle,
        bodyFontStyle,
        category: s.category || 'INSIGHT',
        title: s.title || '',
        content: s.content || '',
        aspectRatio,
        slideNum,
        totalSlides,
        bgImageUrl
      };

      const html = getTemplateForLanguage(assignedLanguage, options);

      return { type: s.type || 'content', html: html.trim() };
    });
    
    return {
      status: 'completed',
      outputReference: { html: "Generated Carousel", slides: finalSlides },
      metadata: { 
        provider: 'gemini',
        duration: Date.now() - startTime
      }
    };
  }

  async validateOutput(rawResponse: any): Promise<boolean> {
    return Array.isArray(rawResponse?.slides);
  }
}

