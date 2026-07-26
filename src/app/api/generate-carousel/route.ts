import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";
import { withApiWrapper } from "@/backend/middlewares/apiWrapper";
import { requireAuth } from "@/backend/middlewares/auth";
import { AIGenerationService } from "@/backend/services/AIGenerationService";
import { BillingService } from "@/backend/services/BillingService";
export const POST = withApiWrapper(async (req: NextRequest) => {
  const user = await requireAuth();
  
  const body = await req.json();
  let resolvedWorkspaceId = body.workspaceId || body.orgId;
  const supabaseAdmin = createAdminClient();

  if (!resolvedWorkspaceId) {
    const { data: firstWs } = await supabaseAdmin.from('workspaces').select('id').limit(1);
    resolvedWorkspaceId = firstWs?.[0]?.id || "00000000-0000-0000-0000-000000000000";
  }

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

  if (finalOrgId) {
    const billingService = new BillingService(supabaseAdmin);
    try {
      await billingService.deductTokensForGeneration(finalOrgId, 'carousel');
    } catch (error: any) {
      if (error.statusCode === 402) {
        return NextResponse.json({ error: error.message, code: 'PAYMENT_REQUIRED' }, { status: 402 });
      }
      console.error("Token deduction failed", error);
      return NextResponse.json({ error: "Billing error occurred" }, { status: 500 });
    }
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
