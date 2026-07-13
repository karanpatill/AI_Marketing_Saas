import { NextResponse } from "next/server";
import { 
  generateContentMixRecommendation, 
  updateContentMixOverride, 
  getContentMixPlan 
} from "@/lib/contentPlanning";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brandDnaId = searchParams.get("brandDnaId");

    if (!brandDnaId) {
      return NextResponse.json({ error: "Missing brandDnaId parameter" }, { status: 400 });
    }

    const plan = await getContentMixPlan(brandDnaId);
    return NextResponse.json(plan);

  } catch (error: any) {
    console.error("GET Content Mix Plan Error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve content mix plan" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brandDnaId, action } = body;

    if (!brandDnaId) {
      return NextResponse.json({ error: "Missing brandDnaId" }, { status: 400 });
    }

    if (action === "generate") {
      const plan = await generateContentMixRecommendation(brandDnaId);
      return NextResponse.json({ success: true, plan, message: "AI Content Mix recommendation generated and saved" });
    }

    if (action === "override") {
      const { platform, postType, count } = body;
      if (!platform || !postType || count === undefined) {
        return NextResponse.json({ error: "Missing platform, postType, or count for override action" }, { status: 400 });
      }

      await updateContentMixOverride(brandDnaId, platform, postType, Number(count));
      return NextResponse.json({ success: true, message: `Updated override count for ${platform} ${postType}` });
    }

    return NextResponse.json({ error: "Invalid action. Supported: generate, override" }, { status: 400 });

  } catch (error: any) {
    console.error("POST Content Mix Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process content mix transaction" }, { status: 500 });
  }
}
