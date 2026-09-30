import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { StrategyEngine } from "@/backend/services/StrategyEngine";
import { BrandService } from "@/backend/services/BrandService";
import { createAdminClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orgId, brandId } = body;

    if (!orgId) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    // Initialize services
    const brandService = new BrandService(createAdminClient());
    const strategyEngine = new StrategyEngine();

    // 1. Fetch Brand DNA
    // If brandId is not provided, fetch the primary brand for this org
    let brandDna = null;
    if (brandId) {
      const brandData = await brandService.getBrand(brandId);
      brandDna = brandData;
    } else {
      // Just fallback to a dummy brand DNA if none exists for demo purposes
      brandDna = {
        name: "Demo Brand",
        industry: "SaaS",
        tone: ["Professional", "Witty", "Direct"],
        visuals: { style: "Dark Mode Minimalist", colors: ["#000000", "#FFFFFF", "#FF5500"] }
      };
    }

    // 2. Generate the 30-Day Strategy via Gemini
    const result = await strategyEngine.generate30DayStrategy(orgId, brandId || null, brandDna);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Campaign generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate campaign" }, { status: 500 });
  }
}
