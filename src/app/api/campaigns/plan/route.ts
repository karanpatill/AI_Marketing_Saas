import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, requireBrandAccess } from "@/backend/middlewares/auth";
import { BaseError } from "@/backend/utils/errors";
import { createMarketingCampaign } from "@/lib/campaignPlanner";

// The LLM plans the campaign and 5 posts in one call.
export const maxDuration = 60;

const planSchema = z.object({
  brandDnaId: z.string().uuid(),
  title: z.string().trim().min(1).max(160),
  campaignType: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(4000),
  platforms: z.array(z.enum(["instagram", "linkedin", "x", "youtube", "facebook"])).min(1),
});

/** POST /api/campaigns/plan — AI-plans a campaign for a brand and adds its posts to the calendar. */
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const parsed = planSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Please fill in the title, brief and at least one platform." }, { status: 400 });
    }
    const { brandDnaId, title, campaignType, description, platforms } = parsed.data;
    await requireBrandAccess(user.id, brandDnaId);

    const campaignId = await createMarketingCampaign(brandDnaId, title, campaignType, description, platforms);
    return NextResponse.json({ success: true, campaignId });
  } catch (error: unknown) {
    if (error instanceof BaseError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("Plan campaign error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to plan campaign" }, { status: 500 });
  }
}
