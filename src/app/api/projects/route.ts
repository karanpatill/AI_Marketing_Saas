import { NextRequest, NextResponse } from "next/server";
import { withApiWrapper } from "@/backend/middlewares/apiWrapper";
import { requireAuth } from "@/backend/middlewares/auth";
import { createAdminClient } from "@/lib/supabaseServer";
import { ProjectService } from "@/backend/services/ProjectService";

export const GET = withApiWrapper(async (req: NextRequest) => {
  await requireAuth();
  const url = new URL(req.url);
  const workspaceId = url.searchParams.get("workspaceId");
  
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const service = new ProjectService(supabase);
  const data = await service.getProjects(workspaceId);

  return NextResponse.json(data);
});

export const POST = withApiWrapper(async (req: NextRequest) => {
  await requireAuth();
  const body = await req.json();
  const { workspaceId, name, ...data } = body;

  if (!workspaceId || !name) {
    return NextResponse.json({ error: "workspaceId and name are required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const service = new ProjectService(supabase);
  const project = await service.createProject(workspaceId, name, data);

  return NextResponse.json(project, { status: 201 });
});
