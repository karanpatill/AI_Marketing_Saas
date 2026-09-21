import { SupabaseClient } from "@supabase/supabase-js";
import { ForbiddenError } from "../utils/errors";

/* eslint-disable @typescript-eslint/no-explicit-any -- rows come straight from Supabase without generated types yet */

export type DashboardOverview = {
  profile: { name: string; avatar_url: string };
  organizations: any[];
  workspaces: any[];
  activeWorkspace: any | null;
  brandDna: any | null;
  brandAssets: any | null;
  billing: { subscription: any | null; wallet: { balance: number; free_tokens_granted?: boolean } } | null;
  team: any[];
  calendar: any[];
  contentMix: any[];
  notifications: any[];
  channels: { linkedin: boolean; facebook: boolean; instagram: boolean };
  automation: { is_active: boolean; posts_per_week?: number } | null;
};

/**
 * Assembles everything the dashboard overview needs in four parallel phases.
 * Used by both the server-rendered overview page and GET /api/dashboard/init.
 */
export class DashboardService {
  constructor(private readonly supabase: SupabaseClient) {}

  async getOverview(
    user: { id: string; email?: string; user_metadata?: Record<string, any> },
    opts: { workspaceId?: string | null; brandDnaId?: string | null } = {}
  ): Promise<DashboardOverview> {
    const supabase = this.supabase;

    const [profileResult, membersResult] = await Promise.all([
      supabase.from("profiles").select("name, avatar_url").eq("id", user.id).maybeSingle(),
      supabase.from("members").select("org_id, role, organizations(id, name, slug, plan, subscription_status)").eq("user_id", user.id),
    ]);

    const profile = profileResult.data ?? {
      name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "",
      avatar_url: "",
    };

    const organizations = (membersResult.data ?? []).map((m: any) => ({ orgId: m.org_id, role: m.role, ...m.organizations }));

    const empty: DashboardOverview = {
      profile,
      organizations,
      workspaces: [],
      activeWorkspace: null,
      brandDna: null,
      brandAssets: null,
      billing: null,
      team: [],
      calendar: [],
      contentMix: [],
      notifications: [],
      channels: { linkedin: false, facebook: false, instagram: false },
      automation: null,
    };

    if (organizations.length === 0) return empty;

    const orgIds = organizations.map((o: any) => o.orgId);
    const [workspacesResult, notificationsResult] = await Promise.all([
      supabase.from("workspaces").select("*").in("org_id", orgIds).order("created_at", { ascending: false }),
      supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    ]);

    const workspaces = workspacesResult.data ?? [];
    const notifications = notificationsResult.data ?? [];

    // A requested workspace must belong to one of the user's orgs; otherwise fall back to the newest.
    let activeWorkspace = opts.workspaceId ? workspaces.find((w: any) => w.id === opts.workspaceId) : undefined;
    if (opts.workspaceId && !activeWorkspace) throw new ForbiddenError("Workspace not found or access denied.");
    activeWorkspace = activeWorkspace ?? workspaces[0] ?? null;

    if (!activeWorkspace) return { ...empty, workspaces, notifications };

    const orgId = activeWorkspace.org_id;
    const socials = activeWorkspace.settings_json?.socials ?? {};
    const channels = {
      linkedin: !!socials.linkedin?.isConnected,
      facebook: !!socials.facebook?.isConnected,
      instagram: !!socials.instagram?.isConnected,
    };

    let dnaQuery = supabase.from("brand_dna").select("*").eq("workspace_id", activeWorkspace.id);
    dnaQuery = opts.brandDnaId ? dnaQuery.eq("id", opts.brandDnaId) : dnaQuery.order("created_at", { ascending: false }).limit(1);

    const [dnaResult, subResult, walletResult, teamResult, automationResult] = await Promise.all([
      dnaQuery.maybeSingle(),
      supabase.from("subscriptions").select("*").eq("org_id", orgId).maybeSingle(),
      supabase.from("org_wallets").select("balance, free_tokens_granted").eq("org_id", orgId).maybeSingle(),
      supabase.from("members").select("id, role, joined_at, user_id, profiles:user_id(name, email, avatar_url)").eq("org_id", orgId),
      supabase.from("automation_settings").select("is_active, posts_per_week").eq("workspace_id", activeWorkspace.id).maybeSingle(),
    ]);

    const base: DashboardOverview = {
      ...empty,
      workspaces,
      activeWorkspace,
      notifications,
      channels,
      billing: { subscription: subResult.data ?? null, wallet: walletResult.data ?? { balance: 0 } },
      team: teamResult.data ?? [],
      automation: automationResult.data ?? null,
    };

    const brandDna = dnaResult.data ?? null;
    if (!brandDna) return base;

    const [assetsResult, calendarResult, contentMixResult] = await Promise.all([
      supabase.from("brand_assets").select("*").eq("brand_dna_id", brandDna.id).maybeSingle(),
      supabase.from("brand_calendar").select("*").eq("brand_dna_id", brandDna.id).order("date", { ascending: true }).limit(90),
      supabase.from("content_mix_recommendations").select("*").eq("brand_dna_id", brandDna.id),
    ]);

    return {
      ...base,
      brandDna,
      brandAssets: assetsResult.data ?? null,
      calendar: calendarResult.data ?? [],
      contentMix: contentMixResult.data ?? [],
    };
  }
}
