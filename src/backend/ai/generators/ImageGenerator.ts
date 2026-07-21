import { IGenerationModule, GenerationContext, GenerationResult } from '../interfaces/IGenerationModule';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getContrastColor, getStyleProfile, blendColors, getBgStyleForSlide, resolveInitialImage } from '../utils/styleProfiles';

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

    return `
You are an elite copywriter and content strategist specializing in ultra-premium, high-converting LinkedIn and Instagram posts.
Your style matches the brand's visual identity, vibe, and tone of voice.

Brand DNA Context:
- Brand Name: ${brandName}
- Visual Vibe & Tone: ${brandPersonality}
- Context: ${businessDescription}
${targetAudience ? `- Target Audience: ${targetAudience}` : ''}
${usp ? `- Unique Selling Proposition (USP): ${usp}` : ''}

Topic of the Post: "${topic}"

CRITICAL RULES:
1. Write punchy, insightful, high-value copy strictly aligned with the Brand's DNA.
2. DO NOT write fluff or generic marketing jargon.
3. This is for a single static post graphic.

Return the result STRICTLY as a JSON object with the following structure:
{
  "category": "MARKETING INSIGHT",
  "title": "The Hook Title",
  "content": "Short compelling subtitle or paragraph."
}
Do not include markdown code block formatting.
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

    const profile = getStyleProfile(brandPersonality);
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

    // Enforce Cream & Black Aesthetic
    const bgBlack = "#0A0A0A";
    const accentCream = "#E1E0CC";
    const textCream = "#E1E0CC";
    const textMuted = "rgba(225,224,204,0.6)";
    
    const html = `
   ${fontImportCss ? `<style>${fontImportCss}</style>` : ''}
   <div class="relative w-full h-full p-10 flex flex-col justify-between overflow-hidden" style="background-color: ${bgBlack}; color: ${textCream}; aspect-ratio: ${aspectRatio.replace(':', '/')}; border: 1px solid rgba(225,224,204,0.15);">
     
     <div class="w-full flex justify-between items-center shrink-0 border-b border-[rgba(225,224,204,0.15)] pb-3 z-10 gap-3">
       <div class="flex items-center gap-3">
         ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" class="h-8 w-auto max-h-8 object-contain max-w-[120px] brightness-0 invert opacity-90" style="filter: brightness(0) saturate(100%) invert(98%) sepia(8%) saturate(735%) hue-rotate(334deg) brightness(96%) contrast(89%);" />` : ''}
         <span class="text-xs uppercase font-black tracking-widest px-3 py-1.5 rounded-full bg-[rgba(225,224,204,0.1)] border border-[rgba(225,224,204,0.2)] text-[${accentCream}]">${parsed.category || 'INSIGHT'}</span>
       </div>
     </div>

     <div class="flex-1 flex flex-col justify-center min-h-0 overflow-hidden py-6 gap-5 z-10">
       <div class="w-10 h-1.5 rounded-full shrink-0" style="background-color: ${accentCream};"></div>
       <h2 class="${profile.headingClass} text-3xl md:text-4xl font-black leading-tight tracking-tight" style="${headlineFontStyle}">${parsed.title || ''}</h2>
       ${parsed.content ? `<p class="${profile.bodyClass} text-lg leading-relaxed font-light" style="${bodyFontStyle}; color: ${textMuted};">${parsed.content}</p>` : ''}
     </div>

     <div class="w-full flex justify-between items-center shrink-0 border-t border-[rgba(225,224,204,0.15)] pt-4 z-10">
       <span class="text-xs uppercase font-bold tracking-[0.25em]" style="color: ${accentCream};">${brandName.toUpperCase()}</span>
       <span class="text-xs uppercase font-bold tracking-[0.2em]" style="color: ${textMuted};">${website.toUpperCase() || "@" + brandName.toLowerCase()}</span>
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

