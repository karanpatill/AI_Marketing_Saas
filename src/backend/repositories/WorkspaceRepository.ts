import { SupabaseClient } from '@supabase/supabase-js';

export class WorkspaceRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getUserOrganizations(userId: string) {
    const { data, error } = await this.supabase
      .from("members")
      .select(`
        org_id,
        role,
        organizations (id, name, slug, plan, subscription_status)
      `)
      .eq("user_id", userId);

    if (error) throw error;
    return data || [];
  }

  async getWorkspacesByOrgIds(orgIds: string[]) {
    if (orgIds.length === 0) return [];
    
    const { data, error } = await this.supabase
      .from("workspaces")
      .select("*")
      .in("org_id", orgIds);

    if (error) throw error;
    return data || [];
  }

  async getUserRoleInOrg(orgId: string, userId: string) {
    const { data, error } = await this.supabase
      .from("members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data?.role;
  }

  async createWorkspace(orgId: string, name: string, slug: string) {
    const { data, error } = await this.supabase
      .from("workspaces")
      .insert({
        org_id: orgId,
        name,
        slug
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async logActivity(orgId: string, userId: string, action: string, details: any) {
    const { error } = await this.supabase
      .from("activity_logs")
      .insert({
        org_id: orgId,
        user_id: userId,
        action,
        details
      });

    if (error) throw error;
  }
}
