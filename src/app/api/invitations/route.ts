import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";
import { withApiWrapper } from "@/backend/middlewares/apiWrapper";
import { requireAuth, requireWorkspaceAdmin } from "@/backend/middlewares/auth";
import { InvitationService } from "@/backend/services/InvitationService";
import { createInvitationSchema } from "@/backend/validations/invitations";

export const GET = withApiWrapper(async (req: NextRequest) => {
  const user = await requireAuth();

  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) {
    return NextResponse.json({ error: { code: 'MISSING_PARAMS', message: 'Missing orgId parameter' } }, { status: 400 });
  }

  // Assuming only admins can view pending invites
  await requireWorkspaceAdmin(user.id, orgId);

  const supabaseAdmin = createAdminClient();
  const invitationService = new InvitationService(supabaseAdmin);

  const invites = await invitationService.getPendingInvitations(orgId);
  return NextResponse.json(invites);
});

export const POST = withApiWrapper(async (req: NextRequest) => {
  const user = await requireAuth();

  const body = await req.json();
  const validatedData = createInvitationSchema.parse(body);

  await requireWorkspaceAdmin(user.id, validatedData.orgId);

  const supabaseAdmin = createAdminClient();
  const invitationService = new InvitationService(supabaseAdmin);

  const invitation = await invitationService.createInvitation(user.id, validatedData);
  return NextResponse.json({ data: invitation }, { status: 201 });
});

export const DELETE = withApiWrapper(async (req: NextRequest) => {
  const user = await requireAuth();

  const orgId = req.nextUrl.searchParams.get("orgId");
  const inviteId = req.nextUrl.searchParams.get("inviteId");

  if (!orgId || !inviteId) {
    return NextResponse.json({ error: { code: 'MISSING_PARAMS', message: 'Missing orgId or inviteId parameters' } }, { status: 400 });
  }

  await requireWorkspaceAdmin(user.id, orgId);

  const supabaseAdmin = createAdminClient();
  const invitationService = new InvitationService(supabaseAdmin);

  await invitationService.revokeInvitation(user.id, orgId, inviteId);
  return NextResponse.json({ success: true, message: "Invitation revoked successfully" });
});
