import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";
import { withApiWrapper } from "@/backend/middlewares/apiWrapper";
import { requireAuth } from "@/backend/middlewares/auth";
import { AIGenerationService } from "@/backend/services/AIGenerationService";

export const POST = withApiWrapper(async (req: NextRequest) => {
  const user = await requireAuth();
  
  const body = await req.json();
  let resolvedWorkspaceId = body.workspaceId || body.orgId;
  const supabaseAdmin = createAdminClient();

  if (!resolvedWorkspaceId) {
    const { data: firstWs } = await supabaseAdmin.from('workspaces').select('id').limit(1);
    resolvedWorkspaceId = firstWs?.[0]?.id || "00000000-0000-0000-0000-000000000000";
  }

  const aiService = new AIGenerationService(supabaseAdmin);

  const job = await aiService.enqueueJob({
    workspaceId: resolvedWorkspaceId,
    userId: user.id,
    jobType: 'generate_carousel',
    payload: body
  });

  return NextResponse.json({ success: true, jobId: job.id }, { status: 202 });
});
