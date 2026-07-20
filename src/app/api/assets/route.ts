import { NextRequest, NextResponse } from "next/server";
import { withApiWrapper } from "@/backend/middlewares/apiWrapper";
import { requireAuth } from "@/backend/middlewares/auth";
import { createAdminClient } from "@/lib/supabaseServer";
import { AssetService } from "@/backend/services/AssetService";

export const GET = withApiWrapper(async (req: NextRequest) => {
  await requireAuth();
  const url = new URL(req.url);
  const workspaceId = url.searchParams.get("workspaceId");
  
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const service = new AssetService(supabase);
  const data = await service.getAssets(workspaceId);

  return NextResponse.json(data);
});

export const POST = withApiWrapper(async (req: NextRequest) => {
  await requireAuth();
  const body = await req.json();
  const { workspaceId, type, url: assetUrl, ...data } = body;

  if (!workspaceId || !type || !assetUrl) {
    return NextResponse.json({ error: "workspaceId, type, and url are required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const service = new AssetService(supabase);
  const asset = await service.createAsset(workspaceId, type, assetUrl, data);

  return NextResponse.json(asset, { status: 201 });
});
