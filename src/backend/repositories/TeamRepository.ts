import { SupabaseClient } from '@supabase/supabase-js';

export class TeamRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getTeamMembers(orgId: string) {
    const { data, error } = await this.supabase
      .from("members")
      .select(`
        id,
        role,
        joined_at,
        user_id,
        profiles:user_id (name, email, avatar_url)
      `)
      .eq("org_id", orgId);

    if (error) throw error;
    return data || [];
  }

  async getMember(orgId: string, userId: string) {
    const { data, error } = await this.supabase
      .from("members")
      .select("id, role")
      .eq("org_id", orgId)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
    return data;
  }

  async getOwnersCount(orgId: string) {
    const { data, error } = await this.supabase
      .from("members")
      .select("id", { count: 'exact' })
      .eq("org_id", orgId)
      .eq("role", "owner");

    if (error) throw error;
    return data?.length || 0;
  }

  async updateRole(orgId: string, userId: string, newRole: string) {
    const { error } = await this.supabase
      .from("members")
      .update({ role: newRole })
      .eq("org_id", orgId)
      .eq("user_id", userId);

    if (error) throw error;
  }

  async removeMember(orgId: string, userId: string) {
    const { error } = await this.supabase
      .from("members")
      .delete()
      .eq("org_id", orgId)
      .eq("user_id", userId);

    if (error) throw error;
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
