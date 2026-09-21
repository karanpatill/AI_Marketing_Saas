import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";
import { withApiWrapper } from "@/backend/middlewares/apiWrapper";
import { requireAuth, resolveWorkspaceForUser } from "@/backend/middlewares/auth";
import { AIGenerationService } from "@/backend/services/AIGenerationService";

export const POST = withApiWrapper(async (req: NextRequest) => {
  const user = await requireAuth();
  
  const body = await req.json();
  // Membership is enforced here so a caller can't spend another org's tokens.
  const resolvedWorkspaceId = await resolveWorkspaceForUser(user.id, body.workspaceId || body.orgId);
  const supabaseAdmin = createAdminClient();

  const aiService = new AIGenerationService(supabaseAdmin);

  const job = await aiService.enqueueJob({
    workspaceId: resolvedWorkspaceId,
    userId: user.id,
    jobType: 'generate_video',
    payload: body
  });

  return NextResponse.json({ success: true, jobId: job.id, requestId: job.id }, { status: 202 });
});
