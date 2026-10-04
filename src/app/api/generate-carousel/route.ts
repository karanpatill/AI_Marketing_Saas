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

  // Token Check and Deduction
  let finalOrgId = body.orgId;
  if (resolvedWorkspaceId && resolvedWorkspaceId !== "00000000-0000-0000-0000-000000000000") {
    const { data: ws } = await supabaseAdmin
      .from('workspaces')
      .select('org_id')
      .eq('id', resolvedWorkspaceId)
      .maybeSingle();
    if (ws && ws.org_id) {
      finalOrgId = ws.org_id;
    }
  }

  // NOTE: Carousel generation is intentionally FREE for all users including Free Plan.
  // The ₹50 "Remove Watermark" upsell loop handles monetization for free users.
  // Token deduction only applies to manual Studio generations (static posts and videos).


  const aiService = new AIGenerationService(supabaseAdmin);

  const job = await aiService.enqueueJob({
    workspaceId: resolvedWorkspaceId,
    userId: user.id,
    jobType: 'generate_carousel',
    payload: body
  });

  return NextResponse.json({ success: true, jobId: job.id }, { status: 202 });
});
