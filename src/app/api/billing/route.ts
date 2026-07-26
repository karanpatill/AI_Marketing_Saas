import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";
import { withApiWrapper } from "@/backend/middlewares/apiWrapper";
import { requireAuth } from "@/backend/middlewares/auth";
import { BillingService } from "@/backend/services/BillingService";
import { WorkspaceService } from "@/backend/services/WorkspaceService";

export const GET = withApiWrapper(async (req: NextRequest) => {
  const user = await requireAuth();

  const url = new URL(req.url);
  const orgId = url.searchParams.get("orgId");
  
  const supabaseAdmin = createAdminClient();
  const workspaceService = new WorkspaceService(supabaseAdmin);
  
  if (orgId) {
    // Validate user has access to org
    const data = await workspaceService.getUserOrganizationsAndWorkspaces(user.id);
    const org = data.organizations.find(o => o.orgId === orgId);
    
    if (!org) {
      return NextResponse.json({ error: "Unauthorized access to organization" }, { status: 403 });
    }

    const billingService = new BillingService(supabaseAdmin);
    const billingStatus = await billingService.getBillingStatus(orgId);
    const plans = await billingService.getPlans();
    
    return NextResponse.json({
      billingStatus,
      plans
    });
  }

  // If no orgId, just return the available plans
  const billingService = new BillingService(supabaseAdmin);
  const plans = await billingService.getPlans();
  return NextResponse.json({ plans });
});
