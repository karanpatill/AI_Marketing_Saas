import { NextRequest, NextResponse } from "next/server";
import { withApiWrapper } from "@/backend/middlewares/apiWrapper";
import { requireAuth } from "@/backend/middlewares/auth";
import { createAdminClient } from "@/lib/supabaseServer";
import { CampaignService } from "@/backend/services/CampaignService";

export const GET = withApiWrapper(async (req: NextRequest) => {
  await requireAuth();
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId");
  
  if (!projectId) {
    return NextResponse.json([]); // Return empty array if no project provided
  }

  const supabase = createAdminClient();
  const service = new CampaignService(supabase);
  const data = await service.getCampaigns(projectId);

  return NextResponse.json(data);
});

export const POST = withApiWrapper(async (req: NextRequest) => {
  await requireAuth();
  const body = await req.json();
  const { projectId, name, ...data } = body;

  if (!projectId || !name) {
    return NextResponse.json({ error: "projectId and name are required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const service = new CampaignService(supabase);
  const campaign = await service.createCampaign(projectId, name, data);

  return NextResponse.json(campaign, { status: 201 });
});
