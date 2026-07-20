import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";
import { withApiWrapper } from "@/backend/middlewares/apiWrapper";
import { requireAuth } from "@/backend/middlewares/auth";
import { AIGenerationService } from "@/backend/services/AIGenerationService";

export const POST = withApiWrapper(async (req: NextRequest) => {
  const user = await requireAuth();
  
  const body = await req.json();

  // Determine orgId. If it's not provided, try to find an active one, or use a default one for now,
  let resolvedWorkspaceId = body.workspaceId || body.orgId;
  const supabaseAdmin = createAdminClient();

  if (!resolvedWorkspaceId) {
    // 1. Try to find the user's first workspace directly from their user_id if we want, or just get any workspace they belong to
    // Since this is admin client, we just get the first workspace available
    const { data: firstWs } = await supabaseAdmin.from('workspaces').select('id').limit(1);
    resolvedWorkspaceId = firstWs?.[0]?.id || "00000000-0000-0000-0000-000000000000";
  }

  const aiService = new AIGenerationService(supabaseAdmin);

  const job = await aiService.enqueueJob({
    workspaceId: resolvedWorkspaceId,
    userId: user.id,
    jobType: 'generate_post',
    payload: body
  });

  return NextResponse.json(
    { 
      success: true, 
      message: "Job enqueued successfully", 
      jobId: job.id 
    },
    { status: 202 }
  );
});
