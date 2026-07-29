import { NextRequest, NextResponse } from "next/server";
import { withApiWrapper } from "@/backend/middlewares/apiWrapper";
import { requireAuth } from "@/backend/middlewares/auth";
import { createAdminClient } from "@/lib/supabaseServer";
import { AssetService } from "@/backend/services/AssetService";

export const DELETE = withApiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  await requireAuth();
  
  if (!params.id) {
    return NextResponse.json({ error: "Asset ID is required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const service = new AssetService(supabase);
  await service.deleteAsset(params.id);

  return NextResponse.json({ success: true, message: "Asset deleted successfully" }, { status: 200 });
});
