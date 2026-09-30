import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { createAdminClient } from "@/lib/supabaseServer";

export class StrategyEngine {
  private genAI: GoogleGenerativeAI;
  private supabase: ReturnType<typeof createAdminClient>;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    this.supabase = createAdminClient();
  }

  /**
   * Generates a full 30-day strategy using the Brand DNA.
   * Uses Gemini Structured Output to return an exact JSON schema.
   */
  async generate30DayStrategy(orgId: string, brandId: string, brandDna: any) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in environment variables.");
    }

    const model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              day: { type: SchemaType.INTEGER },
              format: { type: SchemaType.STRING, enum: ["STATIC", "CAROUSEL", "VIDEO"] },
              format_style: { type: SchemaType.STRING, description: "e.g., 'Cinematic B-Roll', 'Talking Head', 'Infographic', 'Meme', 'Macro Product Shot'" },
              visual_theme: { type: SchemaType.STRING, description: "The overarching visual direction for this specific post (e.g., 'Minimalist', 'Maximalist', 'Corporate', 'Vibrant', 'Dark Premium')." },
              hook: { type: SchemaType.STRING },
              caption: { type: SchemaType.STRING },
              visual_concept: { type: SchemaType.STRING },
              creative_mechanic: { type: SchemaType.STRING }
            },
            required: ["day", "format", "format_style", "visual_theme", "hook", "caption", "visual_concept", "creative_mechanic"]
          }
        }
      }
    });

    const prompt = `
    You are an elite Autonomous Marketing Director at a top-tier ad agency.
    Create a 30-day content calendar for the following brand. 
    
    BRAND DNA:
    ${JSON.stringify(brandDna, null, 2)}
    
    RULES:
    1. Do NOT use generic AI slop phrases ("Unlock your potential", "Elevate your business").
    2. DYNAMIC CONTENT MIX: Do NOT use a fixed rotation. Analyze the Brand DNA and decide the best format ratio. (e.g., A bakery might need 80% VIDEO of food. A B2B SaaS might need 70% CAROUSEL for education).
    3. FORMAT STYLES: For every post, define a highly specific 'format_style'. If it's a VIDEO, is it a "Cinematic Slow-Mo", "Founder Talking Head", "UGC Style", or "Trendy CapCut Edit"? If STATIC, is it a "Twitter Quote Mockup", "High-fashion Editorial", or "Meme"?
    4. DYNAMIC VISUAL THEME: Every post must have a specific 'visual_theme' assigned based on the post's purpose and the brand's extracted Visual Direction. Do NOT force all 30 posts into one boring theme. A serious carousel might be 'Minimalist & Clean', while a weekend sale post might be 'Maximalist & Vibrant'.
    5. Use proven creative mechanics (e.g. Expectation vs Reality, Myth-busting, POV, Founder Story).
    6. Provide the exact hook, the caption, and a highly detailed visual_concept for the Video/HTML renderer.
    6. Generate exactly 30 posts, numbered day 1 to 30.
    `;

    console.log("Generating 30-day strategy with Gemini 1.5 Flash...");
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const postsPlan = JSON.parse(responseText);

    // Save the plan to the database
    console.log("Saving strategy to database...");
    
    const { data: campaign, error: campaignError } = await this.supabase
      .from('campaign_plans')
      .insert({
        org_id: orgId,
        brand_id: brandId,
        status: 'active'
      })
      .select()
      .single();

    if (campaignError) throw campaignError;

    // We will generate the posts starting from tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const postsToInsert = postsPlan.map((post: any, index: number) => {
      const postDate = new Date(tomorrow);
      postDate.setDate(postDate.getDate() + index);

      // We mock the media_url generation for now using an HTML placeholder service
      // We'll pass the specific format_style into the mock image so you can see the dynamic AI choices in the demo!
      const mockText = \`\${post.format} - \${post.format_style}\`;
      const mockMediaUrl = \`https://dummyimage.com/1080x1080/0A0A0A/E1E0CC&text=\${encodeURIComponent(mockText)}\`;

      return {
        campaign_id: campaign.id,
        org_id: orgId,
        post_date: postDate.toISOString().split('T')[0], // YYYY-MM-DD
        format: post.format,
        hook: post.hook,
        caption: post.caption,
        visual_concept: post.visual_concept,
        media_url: mockMediaUrl,
        status: 'planned'
      };
    });

    const { error: postsError } = await this.supabase
      .from('scheduled_posts')
      .insert(postsToInsert);

    if (postsError) throw postsError;

    console.log(\`Successfully generated and mocked 30 days of content for Campaign \${campaign.id}\`);
    
    return {
      campaignId: campaign.id,
      postCount: postsToInsert.length,
      status: "success"
    };
  }
}
