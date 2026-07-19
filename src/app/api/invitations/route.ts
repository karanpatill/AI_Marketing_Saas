import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { randomBytes } from "crypto";

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

    const { data: invites, error: fetchError } = await supabase
      .from("invitations")
      .select("*")
      .eq("org_id", orgId)
      .eq("status", "pending");

    if (fetchError) throw fetchError;

    return NextResponse.json(invites || []);
  } catch (error: any) {
    console.error("Invitations GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve invitations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId, email, role } = await req.json();

    if (!orgId || !email || !role) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Check caller permission
    const { data: caller } = await supabase
      .from("members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .single();

    if (!caller || !["owner", "admin"].includes(caller.role)) {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const { data: invitation, error: inviteError } = await supabase
      .from("invitations")
      .insert({
        org_id: orgId,
        email: email.toLowerCase().trim(),
        role,
        token,
        invited_by: user.id,
        status: "pending",
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (inviteError) throw inviteError;

    // Log Activity
    await supabase.from("activity_logs").insert({
      org_id: orgId,
      user_id: user.id,
      action: "member_invited",
      details: { email, role, inviteId: invitation.id }
    });

    return NextResponse.json(invitation);
  } catch (error: any) {
    console.error("Invitation create error:", error);
    return NextResponse.json({ error: error.message || "Failed to create invitation" }, { status: 500 });
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
    const inviteId = searchParams.get("inviteId");

    if (!orgId || !inviteId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Check caller permission
    const { data: caller } = await supabase
      .from("members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .single();

    if (!caller || !["owner", "admin"].includes(caller.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from("invitations")
      .delete()
      .eq("org_id", orgId)
      .eq("id", inviteId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true, message: "Invitation revoked successfully" });
  } catch (error: any) {
    console.error("Invitation revoke error:", error);
    return NextResponse.json({ error: error.message || "Failed to revoke invitation" }, { status: 500 });
  }
}
