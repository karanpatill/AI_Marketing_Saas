import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabaseServer";
import { WorkspaceService } from "@/backend/services/WorkspaceService";
import { AppShell } from "@/components/shell/AppShell";
import type { ShellUser, ShellWorkspace } from "@/components/shell/types";

export const dynamic = "force-dynamic";

export default async function DashboardShellLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const admin = createAdminClient();
  const [{ data: profile }, memberships] = await Promise.all([
    admin.from("profiles").select("name, avatar_url").eq("id", user.id).maybeSingle(),
    new WorkspaceService(admin).getUserOrganizationsAndWorkspaces(user.id),
  ]);

  const orgNames = new Map(memberships.organizations.map((o: { orgId: string; name?: string }) => [o.orgId, o.name]));

  const shellUser: ShellUser = {
    id: user.id,
    name: profile?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "You",
    email: user.email || "",
    avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || null,
  };

  const workspaces: ShellWorkspace[] = memberships.workspaces.map((w: { id: string; name: string; org_id: string }) => ({
    id: w.id,
    name: w.name,
    orgId: w.org_id,
    orgName: orgNames.get(w.org_id),
  }));

  return (
    <AppShell user={shellUser} workspaces={workspaces} activeWorkspaceId={workspaces[0]?.id}>
      {children}
    </AppShell>
  );
}
