import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "Missing orgId parameter" }, { status: 400 });
    }

    // Check membership
    const { data: memberCheck } = await supabase
      .from("members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .single();

    if (!memberCheck) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: teamMembers, error: fetchError } = await supabase
      .from("members")
      .select(`
        id,
        role,
        joined_at,
        user_id,
        profiles:user_id (name, email, avatar_url)
      `)
      .eq("org_id", orgId);

    if (fetchError) throw fetchError;

    const formatted = teamMembers?.map((m: any) => ({
      id: m.id,
      role: m.role,
      joinedAt: m.joined_at,
      userId: m.user_id,
      name: m.profiles?.name || "Unknown Member",
      email: m.profiles?.email || "No email",
      avatarUrl: m.profiles?.avatar_url || ""
    })) || [];

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Team GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve team members" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId, userId, newRole } = await req.json();

    if (!orgId || !userId || !newRole) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Check caller role (Must be owner or admin)
    const { data: caller } = await supabase
      .from("members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .single();

    if (!caller || !["owner", "admin"].includes(caller.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prevent changing role of owners unless you are an owner
    const { data: targetMember } = await supabase
      .from("members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", userId)
      .single();

    if (targetMember?.role === "owner" && caller.role !== "owner") {
      return NextResponse.json({ error: "Only owners can update other owners' roles." }, { status: 403 });
    }

    const { error: updateError } = await supabase
      .from("members")
      .update({ role: newRole })
      .eq("org_id", orgId)
      .eq("user_id", userId);

    if (updateError) throw updateError;

    // Log Activity
    await supabase.from("activity_logs").insert({
      org_id: orgId,
      user_id: user.id,
      action: "role_updated",
      details: { targetUserId: userId, newRole }
    });

    return NextResponse.json({ success: true, message: "Member role updated successfully" });
  } catch (error: any) {
    console.error("Team PUT error:", error);
    return NextResponse.json({ error: error.message || "Failed to update member role" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const userId = searchParams.get("userId");

    if (!orgId || !userId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Check caller role
    const { data: caller } = await supabase
      .from("members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .single();

    if (!caller || !["owner", "admin"].includes(caller.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If deleting self, must not be the last owner
    if (userId === user.id) {
      const { data: owners } = await supabase
        .from("members")
        .select("id")
        .eq("org_id", orgId)
        .eq("role", "owner");

      if (owners && owners.length <= 1) {
        return NextResponse.json({ error: "Cannot leave organization. You are the last owner." }, { status: 400 });
      }
    }

    const { error: deleteError } = await supabase
      .from("members")
      .delete()
      .eq("org_id", orgId)
      .eq("user_id", userId);

    if (deleteError) throw deleteError;

    // Log Activity
    await supabase.from("activity_logs").insert({
      org_id: orgId,
      user_id: user.id,
      action: "member_removed",
      details: { removedUserId: userId }
    });

    return NextResponse.json({ success: true, message: "Member removed successfully" });
  } catch (error: any) {
    console.error("Team DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to remove member" }, { status: 500 });
  }
}
