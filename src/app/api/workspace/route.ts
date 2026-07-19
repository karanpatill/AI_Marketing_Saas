import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get active organizations
    const { data: members, error: membersError } = await supabase
      .from("members")
      .select(`
        org_id,
        role,
        organizations (id, name, slug, plan, subscription_status)
      `)
      .eq("user_id", user.id);

    if (membersError) throw membersError;

    const orgs = members?.map((m: any) => ({
      orgId: m.org_id,
      role: m.role,
      ...m.organizations
    })) || [];

    // Get workspaces for those organizations
    const orgIds = orgs.map(o => o.orgId);
    let workspaces: any[] = [];

    if (orgIds.length > 0) {
      const { data: ws, error: wsError } = await supabase
        .from("workspaces")
        .select("*")
        .in("org_id", orgIds);

      if (wsError) throw wsError;
      workspaces = ws || [];
    }

    return NextResponse.json({ organizations: orgs, workspaces });
  } catch (error: any) {
    console.error("Workspace fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve workspaces" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId, name } = await req.json();

    if (!orgId || !name) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Check if user is Admin/Owner in this org
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .single();

    if (memberError || !member || !["owner", "admin"].includes(member.role)) {
      return NextResponse.json({ error: "Forbidden. Admin rights required." }, { status: 403 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

    const { data: workspace, error: wsCreateError } = await supabase
      .from("workspaces")
      .insert({
        org_id: orgId,
        name,
        slug
      })
      .select()
      .single();

    if (wsCreateError) throw wsCreateError;

    // Log Activity
    await supabase.from("activity_logs").insert({
      org_id: orgId,
      user_id: user.id,
      action: "workspace_created",
      details: { workspaceName: name, workspaceId: workspace.id }
    });

    return NextResponse.json(workspace);
  } catch (error: any) {
    console.error("Workspace create error:", error);
    return NextResponse.json({ error: error.message || "Failed to create workspace" }, { status: 500 });
  }
}
