import { IGenerationModule, GenerationContext, GenerationResult } from '../interfaces/IGenerationModule';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { determineDesignLanguage, getStyleProfile, getContrastColor, resolveInitialImage } from "../utils/styleProfiles";
import { getTemplateForLanguage, TemplateOptions } from "../utils/htmlTemplates";

export class ImageGenerator implements IGenerationModule {
  jobType = 'generate_post';

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
      prompt: topic = "A professional marketing post", 
      brandName = "Brand",
      brandPersonality = "Luxury", 
      businessDescription = "",
      targetAudience = "",
      usp = "",
      aspectRatio = "4/5"
    } = inputParams;

    const assignedLanguage = determineDesignLanguage(brandPersonality, businessDescription);

    return `
You are an elite, world-class copywriter, art director, and content strategist specializing in ultra-premium, high-converting LinkedIn and Instagram posts.
Your style flawlessly matches the brand's visual identity, vibe, and tone of voice, acting as the ultimate manifestation of the brand's DNA.

--- BRAND DNA & IDENTITY ---
- Brand Name: ${brandName}
- Visual Vibe & Tone: ${brandPersonality}
- Core Business: ${businessDescription}
- Target Audience: ${targetAudience ? targetAudience : 'General professional audience'}
- Unique Selling Proposition (USP): ${usp ? usp : 'Premium quality and design'}
- Assigned Design Language: ${assignedLanguage}

DESIGN LANGUAGE DIRECTIVES for ${assignedLanguage}:

Topic of the Post: "${topic}"

--- DESIGN LANGUAGE RULES FOR COPY ---
When writing for specific design languages, adapt the pacing, punctuation, and length:
- Blueprint: Technical, structured, heavily reliant on exact metrics or formulas. 
- Brutalism / Neo-Brutalism: Punchy, aggressive, very short sentences. Use bold declarations.
- Swiss Style: Objective, clear, perfectly structured, no fluff.
- Surrealism: Ethereal, abstract, poetic hooks, slightly unusual phrasing.
- Minimalism: Extremely concise. Let the negative space do the talking. 1-2 lines max.
- Maximalism: Loud, energetic, dense information, highly persuasive and enthusiastic.
- Retro/Hand Drawn: Nostalgic, casual, friendly, conversational.

--- CRITICAL RULES ---
1. WRITE WORLD-CLASS COPY: No generic marketing jargon. Use psychological hooks, counter-narratives, and undeniable value.
2. This is for a single static post graphic. Keep the text punchy and readable.
3. BRAND ALIGNMENT: The vocabulary and tone must sound exactly like the brand DNA provided above.

Return the result STRICTLY as a JSON object with the following structure. DO NOT include markdown formatting (\`\`\`json):
{
  "category": "MARKETING INSIGHT",
  "title": "The specific hook title that stops the scroll.",
  "content": "Short, compelling subtitle setting up the premise."
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

    await updateProgress(40, 'generating_content');
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    
    let jsonOutput = result.response.text();
    // Clean up potential markdown wrapper
    jsonOutput = jsonOutput.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    let parsed: any = {};
    try {
      parsed = JSON.parse(jsonOutput);
      if (Array.isArray(parsed)) {
        parsed = parsed[0] || {};
      }
    } catch (err) {
      console.error("Failed to parse image post JSON", err, "RAW:", jsonOutput);
      parsed = {
        title: "Marketing Insight",
        content: "Discover how our unique approach transforms business operations."
      };
    }

    await updateProgress(90, 'rendering_html');

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

    const textPrimaryClass = isLightBg ? "text-black" : "text-white";
    const textSecondaryClass = isLightBg ? "text-black/80" : "text-white/80";
    const textMutedClass = isLightBg ? "text-black/60" : "text-white/60";
    
    const bgImgRes = await resolveInitialImage(assignedLanguage, context.inputParams.topic || context.inputParams.prompt || "", `${parsed.category} ${parsed.title}`);
    const bgImageUrl = bgImgRes?.url || "";

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
      category: parsed.category || 'INSIGHT',
      title: parsed.title || '',
      content: parsed.content || '',
      aspectRatio,
      bgImageUrl
    };

    const html = getTemplateForLanguage(assignedLanguage, options);

    return {
      status: 'completed',
      outputReference: { html: html.trim() },
      metadata: { 
        provider: 'gemini',
        duration: Date.now() - startTime
      }
    };
  }

  async validateOutput(rawResponse: any): Promise<boolean> {
    return !!rawResponse?.html;
  }
}

