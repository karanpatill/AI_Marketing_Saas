import { NextRequest, NextResponse } from "next/server";
import { withApiWrapper } from "@/backend/middlewares/apiWrapper";
import { requireAuth } from "@/backend/middlewares/auth";
import { createAdminClient } from "@/lib/supabaseServer";

/**
 * POST /api/workspace/init
 *
 * Called during onboarding for users who have just signed up
 * and do not yet belong to any organization.
 *
 * Creates:
 *  1. An organization row with the user as "owner"
 *  2. A members row linking the user to the org
 *
 * Returns: { orgId }
 */
export const POST = withApiWrapper(async (req: NextRequest) => {
  const user = await requireAuth();
  const supabase = createAdminClient();

  // --- 1. Check if user already belongs to an org ---
  const { data: existingMembers } = await supabase
    .from("members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1);

  if (existingMembers && existingMembers.length > 0) {
    // Already has an org — return it
    return NextResponse.json({ orgId: existingMembers[0].org_id });
  }

  // --- 2. Create a personal organization for this user ---
  const userEmail = user.email ?? "user";
  const orgName = `${userEmail.split("@")[0]}'s Workspace`;
  const slug = orgName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 63);

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: orgName,
      slug,
      plan: "free",
      subscription_status: "active",
    })
    .select()
    .single();

  if (orgError || !org) {
    console.error("[workspace/init] Failed to create organization:", orgError);
    return NextResponse.json(
      { error: "Failed to create organization", details: orgError?.message },
      { status: 500 }
    );
  }

  // --- 3. Add the user as "owner" of the new org ---
  const { error: memberError } = await supabase.from("members").insert({
    org_id: org.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberError) {
    console.error("[workspace/init] Failed to insert member:", memberError);
    // Roll back the org we just created to avoid orphaned rows
    await supabase.from("organizations").delete().eq("id", org.id);
    return NextResponse.json(
      { error: "Failed to assign user to organization", details: memberError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ orgId: org.id }, { status: 201 });
});
