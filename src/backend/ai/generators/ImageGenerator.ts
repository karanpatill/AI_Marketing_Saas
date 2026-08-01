import { IGenerationModule, GenerationContext, GenerationResult } from '../interfaces/IGenerationModule';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { determineDesignLanguage, getStyleProfile, getContrastColor, resolveInitialImage } from "../utils/styleProfiles";
import { getTemplateForLanguage, TemplateOptions } from "../utils/htmlTemplates";
import { ModelRegistry } from "../utils/ModelRegistry";

function mapToRealGeminiModel(modelId?: string): string {
  if (!modelId) return "gemini-2.5-flash";
  const m = modelId.toLowerCase();
  if (m.includes("pro")) return "gemini-2.5-pro";
  if (m.includes("lite") || m.includes("8b")) return "gemini-2.5-flash";
  return "gemini-2.5-flash";
}

function parseImageJsonOutput(jsonOutput: string, defaultTopic: string): { category: string; title: string; content: string; image_prompt?: string } {
  let cleaned = jsonOutput.trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    cleaned = match[0];
  }

  try {
    const parsed = JSON.parse(cleaned);
    const obj = Array.isArray(parsed) ? parsed[0] : parsed;
    if (obj && (obj.title || obj.content)) {
      return {
        category: obj.category || 'INSIGHT',
        title: obj.title || defaultTopic || 'Brand Insight',
        content: obj.content || '',
        image_prompt: obj.image_prompt || ''
      };
    }
  } catch (err) {
    console.warn("[ImageGenerator] Standard JSON.parse failed, attempting regex extraction", err);
  }

  const categoryMatch = jsonOutput.match(/"category"\s*:\s*"([^"]+)"/i);
  const titleMatch = jsonOutput.match(/"title"\s*:\s*"([^"]+)"/i);
  const contentMatch = jsonOutput.match(/"content"\s*:\s*"([^"]+)"/i);
  const promptMatch = jsonOutput.match(/"image_prompt"\s*:\s*"([^"]+)"/i);

  if (titleMatch || contentMatch) {
    return {
      category: categoryMatch ? categoryMatch[1] : 'INSIGHT',
      title: titleMatch ? titleMatch[1] : (defaultTopic || 'Marketing Insight'),
      content: contentMatch ? contentMatch[1] : '',
      image_prompt: promptMatch ? promptMatch[1] : ''
    };
  }

  return {
    category: 'STRATEGY',
    title: defaultTopic || 'Future-Proof Tech, Built to Last.',
    content: 'Transform your business with high-impact modern strategies.',
    image_prompt: ''
  };
}

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

    // Use brandContext from GenerationManager if available, fallback to defaults
    const bCtx = context.brandContext || {};
    const colors = bCtx.colors || {};
    const primaryColor = colors.primaryHex || inputParams.primaryColor || "#000000";
    const secondaryColor = colors.secondaryHex || inputParams.secondaryColor || "#ffffff";
    const brandNameToUse = bCtx.brand_name || brandName;
    const brandPersonalityToUse = bCtx.brand_personality || brandPersonality;
    const businessDescriptionToUse = bCtx.business_description || businessDescription;
    const targetAudienceToUse = bCtx.target_audience || targetAudience;
    const uspToUse = bCtx.usp || usp;

    const assignedLanguage = bCtx.internal_design_language || inputParams.internal_design_language || determineDesignLanguage(brandPersonalityToUse, businessDescriptionToUse);
    const profile = getStyleProfile(assignedLanguage);

    return `
You are an elite, world-class copywriter, art director, and content strategist specializing in ultra-premium, high-converting LinkedIn and Instagram posts.
Your style flawlessly matches the brand's visual identity, vibe, and tone of voice, acting as the ultimate manifestation of the brand's DNA.

--- BRAND DNA & IDENTITY ---
- Brand Name: ${brandNameToUse}
- Visual Vibe & Tone: ${brandPersonalityToUse}
- Core Business: ${businessDescriptionToUse}
- Target Audience: ${targetAudienceToUse ? targetAudienceToUse : 'General professional audience'}
- Unique Selling Proposition (USP): ${uspToUse ? uspToUse : 'Premium quality and design'}
- Brand Colors: Primary (${primaryColor}), Secondary (${secondaryColor})
- Assigned Design Language: ${assignedLanguage}

DESIGN LANGUAGE DIRECTIVES for ${assignedLanguage}:
- Layout Philosophy: ${profile.layoutStyle}
- Heading Tone: ${profile.headingDesc}
- Body Copy Style: ${profile.bodyDesc}

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
  "content": "Short, compelling subtitle setting up the premise.",
  "image_prompt": "A detailed image generation prompt for the background image that strictly follows the ${assignedLanguage} design language aesthetics and prominently features the brand colors: ${primaryColor} and ${secondaryColor}."
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
    const targetModel = mapToRealGeminiModel(context.inputParams?.targetModel);
    const model = genAI.getGenerativeModel({ model: targetModel });

    await updateProgress(40, 'generating_content');
    
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });
      
      const jsonOutput = result.response.text();
      const topic = context.inputParams?.topic || context.inputParams?.prompt || "";
      const parsed = parseImageJsonOutput(jsonOutput, topic);

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

      const bCtx = context.brandContext || {};
      const assignedLanguage = bCtx.internal_design_language || context.inputParams.internal_design_language || determineDesignLanguage(brandPersonality, context.inputParams.businessDescription || "");
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

      const bgImgRes = await resolveInitialImage(assignedLanguage, context.inputParams.topic || context.inputParams.prompt || "", parsed.image_prompt || `${parsed.category} ${parsed.title}`);
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

      const finalHtml = getTemplateForLanguage(assignedLanguage, options);

        return {
          status: 'completed',
          outputReference: { 
            id: `img_${Date.now()}`,
            url: 'generated',
            html: finalHtml,
            html_content: finalHtml,
            imageUrl: bgImageUrl,
            raw_json: parsed,
            aspectRatio: aspectRatio,
            caption: `${parsed.category}: ${parsed.title}\n\n${parsed.content}`
          },
          metadata: { 
            provider: 'gemini',
            duration: Date.now() - startTime
          }
        };
    } catch (error: any) {
      console.error("[ImageGenerator] Error:", error);
      ModelRegistry.reportFailure(targetModel, error.message || String(error));
      
      const { formatAiError } = require("../utils/errorHandler");
      
      return {
        status: 'failed',
        error: formatAiError(error),
        metadata: {
          provider: 'gemini',
          duration: Date.now() - startTime
        }
      };
    }
  }

  async validateOutput(rawResponse: any): Promise<boolean> {
    return !!rawResponse?.html_content || !!rawResponse?.html;
  }
}
