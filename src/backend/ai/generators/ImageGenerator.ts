import { IGenerationModule, GenerationContext, GenerationResult } from '../interfaces/IGenerationModule';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getContrastColor, getStyleProfile, blendColors, getBgStyleForSlide, resolveInitialImage, determineDesignLanguage } from '../utils/styleProfiles';

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
    let parsed: any = {};
    try {
      parsed = JSON.parse(jsonOutput);
    } catch (err) {
      console.error("Failed to parse image post JSON", err);
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
    
    const replaceColorPlaceholders = (cls: string, isLight: boolean) => {
      let result = cls
        .replace(/black/g, isLight ? "black" : "white")
        .replace(/white/g, isLight ? "white" : "black");
      if (!isLight) {
        result = result.replace(/rgba\\(0,0,0,1\\)/g, "rgba(255,255,255,1)");
      }
      return result;
    };
    
    const borderClass = replaceColorPlaceholders(profile.borderClass, isLightBg);
    const backgroundCssStyle = `background-color: ${secondaryColor};`;

    const html = `
   ${fontImportCss ? `<style>${fontImportCss}</style>` : ''}
   <div class="relative w-full h-full p-8 flex flex-col justify-between overflow-hidden" style="${backgroundCssStyle} color: ${textColor}; aspect-ratio: ${aspectRatio.replace(':', '/')};">
     <div class="w-full flex justify-between items-center shrink-0 border-b ${borderClass} pb-2 z-10 gap-3">
       <div class="flex items-center gap-2.5">
         ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" class="h-6 w-auto max-h-7 object-contain max-w-[110px]" />` : ''}
         <span class="text-[10px] uppercase font-black tracking-widest ${textPrimaryClass}">${parsed.category || 'INSIGHT'}</span>
       </div>
     </div>
     <div class="flex-1 flex flex-col justify-center min-h-0 overflow-hidden py-4 gap-3 z-10">
       <div class="w-8 h-1 rounded-full shrink-0" style="background-color: ${primaryColor};"></div>
       <h2 class="${profile.headingClass}" style="${headlineFontStyle}">${parsed.title || ''}</h2>
       ${parsed.content ? `<p class="${profile.bodyClass} ${textSecondaryClass}" style="${bodyFontStyle}">${parsed.content}</p>` : ''}
     </div>
     <div class="w-full flex justify-between items-center shrink-0 border-t ${borderClass} pt-2 z-10">
       <span class="text-[10px] uppercase font-bold tracking-[0.25em] ${textMutedClass}">${brandName.toUpperCase()}</span>
       <span class="text-[10px] uppercase font-bold tracking-[0.2em] ${textMutedClass}">${website.toUpperCase() || "@" + brandName.toLowerCase()}</span>
     </div>
   </div>`;

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

