import { supabase } from "@/lib/supabase";
import { getBrandMemoryContext } from "@/lib/brandMemory";
import { callLLM } from "@/lib/aiProvider";

export interface StrategyPayload {
  annualGoals: {
    objectives: string[];
    positioningTheme: string;
    focusAreas: string[];
  };
  quarterlyRoadmap: {
    q1: { focus: string; kpi: string };
    q2: { focus: string; kpi: string };
    q3: { focus: string; kpi: string };
    q4: { focus: string; kpi: string };
  };
  monthlyPlan: {
    month1: { campaignTitle: string; objective: string };
    month2: { campaignTitle: string; objective: string };
    month3: { campaignTitle: string; objective: string };
  };
  weeklyStructure: {
    dayTemplate: {
      tuesday: string;
      thursday: string;
      saturday: string;
    };
  };
  dailyCalendar: Array<{
    dayOffset: number;
    postType: "static" | "carousel" | "video";
    title: string;
    conceptBrief: string;
    cta: string;
  }>;
}

/**
 * Generates and stores a complete 30-day marketing strategy calendar.
 */
export async function generateMarketingStrategy(brandDnaId: string): Promise<void> {
  // 1. Fetch unified Brand Memory Context
  const brandMemory = await getBrandMemoryContext(brandDnaId);

  // 2. Build Strategy Prompt
  const prompt = `You are a world-class AI Chief Marketing Officer (CMO) specializing in B2B SaaS and Tech startups.
Compile a complete hierarchical marketing strategy (Annual -> Quarterly -> Monthly -> Weekly -> Daily Calendar) for the following brand:

${brandMemory.systemPromptInjection}

--- INSTRUCTIONS ---
Define a highly coherent strategy that converts.
Return ONLY a valid JSON object matching this TypeScript interface (no markdown, no backticks, no text wrappers, just raw JSON):

interface StrategyPayload {
  annualGoals: {
    objectives: string[]; // 3-4 core marketing objectives
    positioningTheme: string; // The core positioning theme (e.g. "Effortless Automation")
    focusAreas: string[]; // 3 focus areas
  };
  quarterlyRoadmap: {
    q1: { focus: string; kpi: string };
    q2: { focus: string; kpi: string };
    q3: { focus: string; kpi: string };
    q4: { focus: string; kpi: string };
  };
  monthlyPlan: {
    month1: { campaignTitle: string; objective: string };
    month2: { campaignTitle: string; objective: string };
    month3: { campaignTitle: string; objective: string };
  };
  weeklyStructure: {
    dayTemplate: {
      tuesday: string; // e.g. "Educational carousel"
      thursday: string; // e.g. "Social proof static post"
      saturday: string; // e.g. "Cinematic value video reel"
    };
  };
  dailyCalendar: Array<{
    dayOffset: number; // 1 to 30
    postType: "static" | "carousel" | "video";
    title: string; // Catchy internal title/concept name
    conceptBrief: string; // 1-2 sentence brief describing visual layout, copy angles, hooks, and context
    cta: string; // Target action (e.g., "Visit link in bio", "Book a demo")
  }>; // Generate EXACTLY 30 items representing consecutive days.
}`;

  const responseText = await callLLM(prompt, { maxTokens: 4000 });
  
  // Sanitize code block wrappers if any
  let jsonText = responseText.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```$/, "").trim();
  }
  const strategy = JSON.parse(jsonText) as StrategyPayload;

  // 3. Save to brand_strategies
  const { error: strategyError } = await supabase.from("brand_strategies").insert({
    brand_dna_id: brandDnaId,
    annual_goals: strategy.annualGoals,
    quarterly_roadmap: strategy.quarterlyRoadmap,
    monthly_plan: strategy.monthlyPlan,
    weekly_structure: strategy.weeklyStructure
  });

  if (strategyError) {
    throw new Error(`Failed to save brand strategy roadmap: ${strategyError.message}`);
  }

  // 4. Generate 30 days of calendar entries in public.brand_calendar
  const calendarRows = strategy.dailyCalendar.map(item => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + item.dayOffset);
    
    return {
      brand_dna_id: brandDnaId,
      date: targetDate.toISOString().split("T")[0],
      post_type: item.postType,
      title: item.title,
      concept_brief: item.conceptBrief,
      cta: item.cta,
      status: "planned"
    };
  });

  // Bulk insert to brand_calendar
  const { error: calendarError } = await supabase.from("brand_calendar").insert(calendarRows);

  if (calendarError) {
    throw new Error(`Failed to populate brand calendar: ${calendarError.message}`);
  }
}

/**
 * Fetches all calendar items for a given brand and date range.
 */
export async function getMarketingCalendar(
  brandDnaId: string, 
  startDate?: string, 
  endDate?: string
): Promise<any[]> {
  let query = supabase
    .from("brand_calendar")
    .select("*, post:post_id(*)")
    .eq("brand_dna_id", brandDnaId)
    .order("date", { ascending: true });

  if (startDate) {
    query = query.gte("date", startDate);
  }
  if (endDate) {
    query = query.lte("date", endDate);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch marketing calendar: ${error.message}`);
  }

  return data || [];
}
