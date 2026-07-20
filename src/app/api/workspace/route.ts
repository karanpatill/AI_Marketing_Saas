import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";
import { withApiWrapper } from "@/backend/middlewares/apiWrapper";
import { requireAuth } from "@/backend/middlewares/auth";
import { WorkspaceService } from "@/backend/services/WorkspaceService";
import { createWorkspaceSchema } from "@/backend/validations/workspace";

export const GET = withApiWrapper(async (req: NextRequest) => {
  const user = await requireAuth();

  // Bypass RLS for certain reads using admin client inside service
  const supabaseAdmin = createAdminClient();
  const workspaceService = new WorkspaceService(supabaseAdmin);

  const data = await workspaceService.getUserOrganizationsAndWorkspaces(user.id);
  
  return NextResponse.json(data);
});

export const POST = withApiWrapper(async (req: NextRequest) => {
  const user = await requireAuth();

  const body = await req.json();
  const validatedData = createWorkspaceSchema.parse(body); // Validates and throws ZodError if invalid

  // Needs admin client for some of the workspace management bypasses
  const supabaseAdmin = createAdminClient();
  const workspaceService = new WorkspaceService(supabaseAdmin);

  const workspace = await workspaceService.createWorkspace(user.id, validatedData);

  return NextResponse.json({ data: workspace }, { status: 201 });
});
