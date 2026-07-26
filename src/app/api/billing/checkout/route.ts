import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";
import { withApiWrapper } from "@/backend/middlewares/apiWrapper";
import { requireAuth } from "@/backend/middlewares/auth";
import { BillingService } from "@/backend/services/BillingService";
import { WorkspaceService } from "@/backend/services/WorkspaceService";
import { z } from "zod";

const checkoutSchema = z.object({
  orgId: z.string(),
  planId: z.string()
});

export const POST = withApiWrapper(async (req: NextRequest) => {
  const user = await requireAuth();

  const body = await req.json();
  const { orgId, planId } = checkoutSchema.parse(body);

  const supabaseAdmin = createAdminClient();
  const workspaceService = new WorkspaceService(supabaseAdmin);
  
  // Validate user is owner/admin in the org
  const data = await workspaceService.getUserOrganizationsAndWorkspaces(user.id);
  const org = data.organizations.find(o => o.orgId === orgId);
  
  if (!org || !["owner", "admin"].includes(org.role)) {
    return NextResponse.json({ error: "Only organization admins can manage billing." }, { status: 403 });
  }

  const billingService = new BillingService(supabaseAdmin);
  const result = await billingService.processDummyCheckout(orgId, planId);
  
  return NextResponse.json(result);
});
