import { NextRequest, NextResponse } from "next/server";
import { withApiWrapper } from "@/backend/middlewares/apiWrapper";
import { requireAuth } from "@/backend/middlewares/auth";
import { createAdminClient } from "@/lib/supabaseServer";

/**
 * GET /api/dashboard/init
 *
 * Single endpoint that replaces the 7+ sequential fetches the dashboard
 * previously made on mount. All sub-queries run in parallel server-side,
 * so the client pays only ONE network round-trip instead of seven.
 *
 * Returns:
 * {
 *   profile:      { name, avatar_url }
 *   organizations: [...]
 *   workspaces:   [...]
 *   // resolved for the first workspace:
 *   brandDna:     { ... } | null
 *   brandAssets:  { ... } | null
 *   billing:      { subscription, wallet } | null
 *   team:         [...] | []
 *   calendar:     [...] | []
 *   contentMix:   [...] | []
 *   notifications:[...] | []
 * }
 */
export const GET = withApiWrapper(async (_req: NextRequest) => {
  const user = await requireAuth();
  const supabase = createAdminClient();

  // ── Phase 1: Fetch user profile + org/workspace memberships in parallel ──
  const [profileResult, membersResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("members")
      .select("org_id, role, organizations(id, name, slug, plan, subscription_status)")
      .eq("user_id", user.id),
  ]);

  const profile = profileResult.data ?? {
    name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "",
    avatar_url: "",
  };

  const members = membersResult.data ?? [];
  const organizations = members.map((m: any) => ({
    orgId: m.org_id,
    role: m.role,
    ...m.organizations,
  }));

  if (organizations.length === 0) {
    // No org yet — return minimal payload; onboarding flow handles creation
    return NextResponse.json({
      profile,
      organizations: [],
      workspaces: [],
      brandDna: null,
      brandAssets: null,
      billing: null,
      team: [],
      calendar: [],
      contentMix: [],
      notifications: [],
    });
  }

  const defaultOrgId = organizations[0].orgId;

  // ── Phase 2: Workspaces + notifications in parallel ──
  const [workspacesResult, notificationsResult] = await Promise.all([
    supabase
      .from("workspaces")
      .select("*")
      .in("org_id", organizations.map((o: any) => o.orgId))
      .order("created_at", { ascending: false }),

    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const workspaces = workspacesResult.data ?? [];
  const notifications = notificationsResult.data ?? [];

  const defaultWorkspace =
    workspaces.find((w: any) => w.org_id === defaultOrgId) ?? null;

  if (!defaultWorkspace) {
    return NextResponse.json({
      profile,
      organizations,
      workspaces,
      brandDna: null,
      brandAssets: null,
      billing: null,
      team: [],
      calendar: [],
      contentMix: [],
      notifications,
    });
  }

  // ── Phase 3: Brand DNA + billing + team — all in parallel ──
  const [dnaResult, billingResult, teamResult] = await Promise.all([
    supabase
      .from("brand_dna")
      .select("*")
      .eq("workspace_id", defaultWorkspace.id)
      .maybeSingle(),

    // Billing: subscription + wallet
    (async () => {
      const [subResult, walletResult] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("*")
          .eq("org_id", defaultOrgId)
          .maybeSingle(),
        supabase
          .from("org_wallets")
          .select("balance, free_tokens_granted")
          .eq("org_id", defaultOrgId)
          .maybeSingle(),
      ]);
      return {
        subscription: subResult.data ?? null,
        wallet: walletResult.data ?? { balance: 0 },
      };
    })(),

    // Team members
    supabase
      .from("members")
      .select("id, role, joined_at, user_id, profiles:user_id(name, email, avatar_url)")
      .eq("org_id", defaultOrgId),
  ]);

  const brandDna = dnaResult.data ?? null;
  const billing = billingResult;
  const team = teamResult.data ?? [];

  if (!brandDna) {
    return NextResponse.json({
      profile,
      organizations,
      workspaces,
      brandDna: null,
      brandAssets: null,
      billing,
      team,
      calendar: [],
      contentMix: [],
      notifications,
    });
  }

  // ── Phase 4: Assets + calendar + content mix — all in parallel ──
  const [assetsResult, calendarResult, contentMixResult] = await Promise.all([
    supabase
      .from("brand_assets")
      .select("*")
      .eq("brand_dna_id", brandDna.id)
      .maybeSingle(),

    supabase
      .from("brand_calendar")
      .select("*")
      .eq("brand_dna_id", brandDna.id)
      .order("date", { ascending: true })
      .limit(60),

    supabase
      .from("content_mix_recommendations")
      .select("*")
      .eq("brand_dna_id", brandDna.id),
  ]);

  return NextResponse.json({
    profile,
    organizations,
    workspaces,
    brandDna,
    brandAssets: assetsResult.data ?? null,
    billing,
    team,
    calendar: calendarResult.data ?? [],
    contentMix: contentMixResult.data ?? [],
    notifications,
  });
});
