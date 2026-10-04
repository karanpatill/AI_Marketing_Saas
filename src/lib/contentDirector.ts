import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

// Initialize clients
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================
// TYPES
// ============================================================

export interface BrandBrain {
  brandName: string;
  industry: string;
  category: string;
  website: string;
  businessDescription: string;
  usp: string;
  mission: string;
  vision: string;
  products: string[];
  services: string[];
  pricing: string;
  targetAudience: string;
  customerPersonas: string;
  competitors: string[];
  brandPersonality: string;
  brandValues: string[];
  toneOfVoice: string;
  thingsNeverToSay: string[];
  designSystem: {
    primaryColor: string;
    secondaryColor: string;
    headingFont: string;
    bodyFont: string;
    buttonStyle: string;
    vibe: string;
  };
  // Learned memory from performance
  usedHooks: string[];
  usedTopics: string[];
  usedFormats: string[];
  usedCtaStyles: string[];
  winningHooks: string[];
  winningCtas: string[];
}

export interface ContentPiece {
  day: number;
  format: 'static' | 'carousel' | 'video';
  objective: string;
  contentPillar: string;
  creativeAngle: string;
  hook: string;
  copy: string;
  onScreenCopy: string;
  visualDirection: string;
  generationPrompt: string;
  assetRequirements: string;
  cta: string;
  whyThisExists: string;
  // For carousels: array of slide-specific prompts (min 3, max 6)
  slides?: Array<{
    slideNumber: number;
    headline: string;
    body: string;
    imagePrompt: string;
  }>;
  // For videos: the storyboard breakdown
  storyboard?: {
    hook_0_2s: string;
    develop_2_6s: string;
    payoff_6_8s: string;
    cta_8_10s: string;
    soundDirection: string;
    cameraMovement: string;
  };
}

export interface MonthlyContentPlan {
  brandName: string;
  strategicArchitecture: {
    positioningSummary: string;
    contentPillars: string[];
    monthlyNarrative: string;
    formatDistribution: Record<string, number>;
  };
  contentCalendar: ContentPiece[];
}

// ============================================================
// MASTER SYSTEM PROMPT - The Creative Director's Brain
// ============================================================
const MASTER_SYSTEM_PROMPT = `
You are not a generic AI content generator.

You are an autonomous brand strategist, creative director, senior copywriter, social media strategist, art director, campaign planner, trend researcher, and editorial director operating as one system.

Your job is to transform a business's brand information into content that feels deliberately created by a strong human creative team.

The output must be commercially useful, strategically coherent, visually executable, original, platform-native, and strong enough that a paying business owner would believe a professional creative agency produced it.

==================================================
CORE PRINCIPLE
==================================================

NEVER think: "Today I need to generate a social media post."

Think: "What is this brand trying to make people believe, feel, remember, desire, or do today, and what is the strongest creative way to achieve that?"

Every piece of content must have a strategic reason for existing. Content should build one or more of: Awareness, Desire, Trust, Authority, Differentiation, Brand Memory, Community, Education, Consideration, Conversion, Retention, Cultural Relevance.

Do not optimize every post for immediate selling. A strong content system creates a recognizable brand world.

==================================================
NON-NEGOTIABLE RULES
==================================================

NEVER INVENT FACTS. Never fabricate:
- statistics, certifications, ingredients, clinical results
- years of experience, customer numbers, revenue
- product specifications, partnerships, awards
- testimonials, technical specs, scientific claims
- pricing, guarantees

If a factual claim would materially affect credibility, only use it when supported by the brand data supplied to you. If information is unavailable, use neutral language or mark it unavailable.

ANTI-AI-SLOP ENGINE (HIGHEST PRIORITY):
Never write:
- "In today's fast-paced world..."
- "Revolutionizing...", "Game-changing...", "Take your business to the next level..."
- "Unlock your potential...", "Where innovation meets..."
- "Say goodbye to...", "Say hello to..."
- "It's not just X, it's Y"
- Generic motivational statements
- Empty adjectives, Corporate filler, Overused startup language
- Fake urgency, Generic "Did you know?" hooks
- Fake statistics, Manufactured customer stories

Every piece must contain at least one distinctive creative decision.

REPETITION CONTROL:
Maintain creative memory across the 30 days. Do NOT repeat:
- Same hook structure twice in a row
- Same content pillar on consecutive days
- Same emotional angle 3+ times in a week
- Same CTA style 3+ times per week
- Similar visual composition across consecutive posts

PRODUCT ACCURACY:
If product details are supplied, preserve them exactly. Do not redesign packaging, change logos, alter product geometry, invent ingredients, invent features, or change colors.

COMPETITOR DIFFERENTIATION:
Before finalizing any concept, ask internally: "Could 50 competitors publish this exact post?" If YES - reject and rewrite.

==================================================
CONTENT PILLARS SYSTEM
==================================================

Create 5-8 dynamic content territories appropriate to the SPECIFIC brand. Do not force irrelevant pillars. Choose from:
Product, Education, Behind the Scenes, Founder, Culture, Customer Psychology, Myth Busting, Craftsmanship, Comparisons, Use Cases, Stories, Opinions, Community, Humor, Lifestyle, Industry Commentary, Trends, Seasonal Moments, Social Proof, Product Demonstrations, Transformation, FAQ, Objections, Brand Philosophy, Visual Storytelling

==================================================
CAROUSEL NARRATIVE SYSTEM
==================================================

A carousel is NOT a collection of independent images. It is a narrative:
- Slide 1: STOP (the hook - must compel a swipe)
- Slide 2: DEVELOP (expand the idea)
- Slide 3: PROVE / REVEAL (evidence or surprise)
- Slide 4: PAYOFF (the core value)
- Slide 5: CTA / MEMORY (what to do or remember)
For shorter carousels (3-4 slides), adapt accordingly. Maintain visual continuity.

==================================================
VIDEO STORYBOARD SYSTEM (10 seconds - Kling Standard)
==================================================

For every video define clearly:
- 0-2s: Pattern interrupt / hook (NO logos, NO introductions)
- 2-6s: Development / demonstration
- 6-8s: Payoff
- 8-10s: Brand memory + CTA
Also define: camera movement, subject movement, sound direction, on-screen text.

==================================================
IMAGE PROMPT ENGINE
==================================================

Visual prompts must be production-ready. Always specify:
[SUBJECT] [SCENE] [COMPOSITION] [CAMERA POSITION + LENS] [LIGHTING] [MATERIAL/TEXTURE] [COLOR PALETTE] [BRAND ELEMENTS] [TEXT PLACEMENT] [ASPECT RATIO] [NEGATIVE CONSTRAINTS - what to exclude]

For carousels: every slide prompt must maintain visual continuity (same lighting, color grade, composition style).

==================================================
CTA ENGINE
==================================================

Do NOT end every post with "Shop now." Choose based on objective:
- Awareness: "Save this."
- Engagement: specific relevant question
- Consideration: "See how it works."
- Conversion: "Order now." / specific link CTA
- Community: "Send this to someone who..."
- Education: "Save this for later."
Some content should have NO CTA. Silence is sometimes stronger.

==================================================
QUALITY GATE (INTERNAL - DO NOT SHOW USER)
==================================================

Before returning ANY content piece, internally score 1-10 on:
Strategic clarity, Originality, Brand fit, Hook strength, Copy quality, Visual strength, Product accuracy, Commercial usefulness, Platform suitability, Anti-slop score.
If ANY score is below 8: REWRITE before returning.

==================================================
OUTPUT FORMAT - MONTHLY CALENDAR
==================================================

Return a JSON object. Do not wrap in markdown. Raw JSON only.

The JSON must follow this exact structure:
{
  "brandName": "string",
  "strategicArchitecture": {
    "positioningSummary": "string - how this brand owns its space",
    "contentPillars": ["array of 5-8 content territory names chosen for this brand"],
    "monthlyNarrative": "string - what story this month tells",
    "formatDistribution": { "static": number, "carousel": number, "video": number }
  },
  "contentCalendar": [
    {
      "day": 1,
      "format": "static | carousel | video",
      "objective": "string",
      "contentPillar": "string",
      "creativeAngle": "string - the actual idea, not just the category",
      "hook": "string - the opening line or visual hook",
      "copy": "string - final publish-ready caption",
      "onScreenCopy": "string - exact text displayed inside the creative",
      "visualDirection": "string - detailed art direction",
      "generationPrompt": "string - production-ready DALL-E 3 or Kling prompt",
      "assetRequirements": "string - what brand assets are needed",
      "cta": "string - specific action or NONE",
      "whyThisExists": "string - one line strategic reason",
      "slides": [
        {
          "slideNumber": 1,
          "headline": "string",
          "body": "string",
          "imagePrompt": "string - slide-specific production prompt with visual continuity notes"
        }
      ],
      "storyboard": {
        "hook_0_2s": "string",
        "develop_2_6s": "string",
        "payoff_6_8s": "string",
        "cta_8_10s": "string",
        "soundDirection": "string",
        "cameraMovement": "string"
      }
    }
  ]
}

Note: "slides" is only present when format is "carousel" (3-6 slides based on content needs).
Note: "storyboard" is only present when format is "video".
Note: Both can be null/omitted for "static" format.

DO NOT GENERATE CONTENT UNTIL YOU HAVE UNDERSTOOD THE BRAND.
DO NOT INVENT FACTS.
DO NOT COPY COMPETITORS.
DO NOT REPEAT CREATIVE PATTERNS.
DO NOT PRODUCE GENERIC MARKETING LANGUAGE.
CREATE CONTENT THAT A HUMAN CREATIVE DIRECTOR WOULD ACTUALLY APPROVE.
`;

// ============================================================
// LAYER 1: BRAND BRAIN BUILDER
// Fetches all available brand data from Supabase
// ============================================================
async function buildBrandBrain(brandDnaId: string): Promise<BrandBrain> {
  // Fetch DNA
  const { data: dna, error: dnaError } = await supabase
    .from('brands')
    .select('*')
    .eq('id', brandDnaId)
    .single();

  if (dnaError || !dna) {
    throw new Error(`Failed to fetch Brand DNA: ${dnaError?.message}`);
  }

  // Fetch Design System (from BrandExtractor output stored in design_system column)
  const designSystem = dna.design_system || {};

  // Fetch content history (repetition memory)
  const { data: recentContent } = await supabase
    .from('brand_calendar')
    .select('post_type, title, concept_brief, cta')
    .eq('brand_dna_id', brandDnaId)
    .order('date', { ascending: false })
    .limit(30);

  const usedFormats = recentContent?.map((c: any) => c.post_type) || [];
  const usedTopics = recentContent?.map((c: any) => c.title) || [];

  // Fetch winning performance data
  const { data: winningPosts } = await supabase
    .from('brand_calendar')
    .select('title, cta')
    .eq('brand_dna_id', brandDnaId)
    .eq('status', 'published')
    .limit(10);

  return {
    brandName: dna.brand_name,
    industry: dna.industry || 'General',
    category: dna.category || 'General',
    website: dna.website || '',
    businessDescription: dna.business_description || '',
    usp: dna.usp || '',
    mission: dna.mission || '',
    vision: dna.vision || '',
    products: dna.products || [],
    services: dna.services || [],
    pricing: dna.pricing || 'Not specified',
    targetAudience: dna.target_audience || '',
    customerPersonas: dna.customer_personas || '',
    competitors: dna.competitors || [],
    brandPersonality: dna.brand_personality || '',
    brandValues: dna.brand_values || [],
    toneOfVoice: dna.tone_of_voice || dna.brand_personality || '',
    thingsNeverToSay: dna.things_never_to_say || [],
    designSystem: {
      primaryColor: designSystem.colors?.primary || dna.primary_color || '#000000',
      secondaryColor: designSystem.colors?.secondary || dna.secondary_color || '#ffffff',
      headingFont: designSystem.typography?.heading_font || 'Sans-serif',
      bodyFont: designSystem.typography?.body_font || 'Sans-serif',
      buttonStyle: designSystem.ui_elements?.button_style || 'rounded',
      vibe: designSystem.ui_elements?.vibe || '',
    },
    usedHooks: [],
    usedTopics,
    usedFormats,
    usedCtaStyles: winningPosts?.map((p: any) => p.cta) || [],
    winningHooks: [],
    winningCtas: winningPosts?.map((p: any) => p.cta).filter(Boolean) || [],
  };
}

// ============================================================
// LAYER 2: STRATEGY ENGINE
// Builds the "Why this content?" before "What content?"
// ============================================================
function buildStrategyContext(brain: BrandBrain): string {
  const recentFormatCounts = brain.usedFormats.reduce((acc: Record<string, number>, f) => {
    acc[f] = (acc[f] || 0) + 1;
    return acc;
  }, {});

  return `
==================================================
BRAND BRAIN DATA
==================================================

IDENTITY:
Brand Name: ${brain.brandName}
Industry: ${brain.industry}
Category: ${brain.category}
Website: ${brain.website || 'Not provided'}
Business Description: ${brain.businessDescription || 'Not provided'}
USP: ${brain.usp || 'Not provided'}
Mission: ${brain.mission || 'Not provided'}
Vision: ${brain.vision || 'Not provided'}

PRODUCTS & SERVICES:
Products: ${brain.products.length > 0 ? brain.products.join(', ') : 'Not specified'}
Services: ${brain.services.length > 0 ? brain.services.join(', ') : 'Not specified'}
Pricing Position: ${brain.pricing}

AUDIENCE:
Target Audience: ${brain.targetAudience || 'Not specified'}
Customer Personas: ${brain.customerPersonas || 'Not specified'}
Competitors: ${brain.competitors.length > 0 ? brain.competitors.join(', ') : 'Not specified'}

BRAND VOICE:
Personality: ${brain.brandPersonality || 'Not specified'}
Tone of Voice: ${brain.toneOfVoice || 'Not specified'}
Core Values: ${brain.brandValues.length > 0 ? brain.brandValues.join(', ') : 'Not specified'}
Things NEVER to say: ${brain.thingsNeverToSay.length > 0 ? brain.thingsNeverToSay.join(', ') : 'Not specified'}

VISUAL IDENTITY (from website design extraction):
Primary Color: ${brain.designSystem.primaryColor}
Secondary Color: ${brain.designSystem.secondaryColor}
Heading Font: ${brain.designSystem.headingFont}
Body Font: ${brain.designSystem.bodyFont}
Button Style: ${brain.designSystem.buttonStyle}
Overall Vibe: ${brain.designSystem.vibe}

CONTENT MEMORY (Repetition Control):
Recent formats used (avoid over-repeating): ${JSON.stringify(recentFormatCounts)}
Recent topics covered (do not repeat): ${brain.usedTopics.slice(0, 10).join(', ') || 'None yet - this is a fresh brand'}
Winning CTAs that performed well: ${brain.winningCtas.slice(0, 5).join(', ') || 'None yet'}

==================================================
TASK
==================================================

Generate a complete 30-day content calendar for this brand.

MANDATORY FORMAT ROTATION (enforced for cost & engagement balance):
- Every 3 posts must follow this rotation: carousel → static → video
- Carousel: Dynamic (3 to 6 slides based on content depth - let the idea dictate the length)
- Static: Single DALL-E 3 image
- Video: 10-second Kling cinematic video

IMPORTANT CONSTRAINTS:
1. Do NOT invent any facts, stats, specifications, or claims not present in the brand data above
2. If brand data is sparse, use neutral, honest language - never fabricate
3. Every hook must be different in structure from the previous 2 hooks
4. No two consecutive posts should use the same content pillar
5. Ensure the month feels like ONE coherent brand story, not 30 random posts

Generate the full 30-day calendar now.
`;
}

// ============================================================
// LAYER 3: CREATIVE ENGINE (The Claude 3.5 Sonnet Call)
// This is where the magic happens
// ============================================================
async function runCreativeEngine(strategyContext: string): Promise<MonthlyContentPlan> {
  console.log('[ContentDirector] Running Creative Engine with Claude 3.5 Sonnet...');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 16000,
    temperature: 1, // Max creativity
    system: MASTER_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: strategyContext
      }
    ]
  });

  const rawText = (response.content[0] as any).text;

  // Clean any accidental markdown wrapping
  let jsonText = rawText.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.split('```json')[1].split('```')[0].trim();
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.split('```')[1].split('```')[0].trim();
  }

  const plan = JSON.parse(jsonText) as MonthlyContentPlan;
  console.log(`[ContentDirector] Creative Engine complete. Generated ${plan.contentCalendar.length} content pieces.`);
  return plan;
}

// ============================================================
// LAYER 4: PRODUCTION ENGINE
// Saves the plan to the Supabase database
// ============================================================
async function saveToDatabase(brandDnaId: string, plan: MonthlyContentPlan): Promise<void> {
  console.log('[ContentDirector] Saving plan to database...');

  const calendarRows = plan.contentCalendar.map((piece) => {
    const postDate = new Date();
    postDate.setDate(postDate.getDate() + piece.day - 1);

    return {
      brand_dna_id: brandDnaId,
      date: postDate.toISOString().split('T')[0],
      post_type: piece.format,
      title: piece.hook.substring(0, 100),
      concept_brief: JSON.stringify({
        objective: piece.objective,
        contentPillar: piece.contentPillar,
        creativeAngle: piece.creativeAngle,
        hook: piece.hook,
        copy: piece.copy,
        onScreenCopy: piece.onScreenCopy,
        visualDirection: piece.visualDirection,
        generationPrompt: piece.generationPrompt,
        assetRequirements: piece.assetRequirements,
        whyThisExists: piece.whyThisExists,
        slides: piece.slides || null,
        storyboard: piece.storyboard || null,
      }),
      cta: piece.cta,
      status: 'planned',
    };
  });

  // Insert in batches of 10 to avoid payload limits
  for (let i = 0; i < calendarRows.length; i += 10) {
    const batch = calendarRows.slice(i, i + 10);
    const { error } = await supabase.from('brand_calendar').insert(batch);
    if (error) {
      throw new Error(`Failed to save calendar batch: ${error.message}`);
    }
  }

  console.log(`[ContentDirector] Successfully saved ${calendarRows.length} content pieces.`);
}

// ============================================================
// LAYER 5: QUALITY CONTROL
// Validates the output before saving
// ============================================================
function runQualityControl(plan: MonthlyContentPlan): { passed: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!plan.contentCalendar || plan.contentCalendar.length < 25) {
    issues.push(`Calendar has only ${plan.contentCalendar?.length || 0} days - expected at least 25.`);
  }

  const slopPhrases = [
    'in today\'s fast-paced world',
    'revolutionizing',
    'game-changing',
    'unlock your potential',
    'say goodbye to',
    'say hello to',
    'take your business to the next level',
  ];

  plan.contentCalendar?.forEach((piece, i) => {
    const allText = `${piece.hook} ${piece.copy}`.toLowerCase();
    slopPhrases.forEach(phrase => {
      if (allText.includes(phrase)) {
        issues.push(`Day ${i + 1}: Contains AI slop phrase: "${phrase}"`);
      }
    });

    if (!piece.hook || piece.hook.length < 10) {
      issues.push(`Day ${i + 1}: Hook is too short or missing.`);
    }

    if (!piece.copy || piece.copy.length < 20) {
      issues.push(`Day ${i + 1}: Copy is too short or missing.`);
    }

    if (!piece.generationPrompt || piece.generationPrompt.length < 50) {
      issues.push(`Day ${i + 1}: Generation prompt is too vague.`);
    }
  });

  return {
    passed: issues.length === 0,
    issues
  };
}

// ============================================================
// MAIN ORCHESTRATOR
// The single public function to call
// ============================================================
export async function generateMonthlyContentPlan(brandDnaId: string): Promise<MonthlyContentPlan> {
  console.log(`[ContentDirector] Starting 5-layer pipeline for brand: ${brandDnaId}`);

  // Layer 1: Build Brand Brain
  const brain = await buildBrandBrain(brandDnaId);
  console.log(`[ContentDirector] Brand Brain built for: ${brain.brandName}`);

  // Layer 2: Build Strategy Context
  const strategyContext = buildStrategyContext(brain);

  // Layer 3: Run Creative Engine
  const plan = await runCreativeEngine(strategyContext);

  // Layer 4: Quality Control
  const qcResult = runQualityControl(plan);
  if (!qcResult.passed) {
    console.warn('[ContentDirector] QC Issues detected:', qcResult.issues);
    // Log issues but don't block - minor issues are acceptable in V1
  }

  // Layer 5: Save to Database
  await saveToDatabase(brandDnaId, plan);

  return plan;
}
