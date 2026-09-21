import { NextRequest, NextResponse } from "next/server";
import { withApiWrapper } from "@/backend/middlewares/apiWrapper";
import { requireAuth, requireWorkspaceAccess } from "@/backend/middlewares/auth";
import { NotFoundError } from "@/backend/utils/errors";
import { createAdminClient } from "@/lib/supabaseServer";
import { AssetService } from "@/backend/services/AssetService";

export const DELETE = withApiWrapper(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireAuth();
  const { id } = await params;
  
  if (!id) {
    return NextResponse.json({ error: "Asset ID is required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const service = new AssetService(supabase);
  const asset = await service.getAsset(id);
  if (!asset?.workspace_id) throw new NotFoundError("Asset not found");
  await requireWorkspaceAccess(user.id, asset.workspace_id);
  await service.deleteAsset(id);

  return NextResponse.json({ success: true, message: "Asset deleted successfully" }, { status: 200 });
});
