import { SupabaseClient } from '@supabase/supabase-js';

export class InvitationRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getPendingInvitations(orgId: string) {
    const { data, error } = await this.supabase
      .from("invitations")
      .select("*")
      .eq("org_id", orgId)
      .eq("status", "pending");

    if (error) throw error;
    return data || [];
  }

  async createInvitation(orgId: string, email: string, role: string, token: string, invitedBy: string, expiresAt: string) {
    const { data, error } = await this.supabase
      .from("invitations")
      .insert({
        org_id: orgId,
        email: email.toLowerCase().trim(),
        role,
        token,
        invited_by: invitedBy,
        status: "pending",
        expires_at: expiresAt
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async revokeInvitation(orgId: string, inviteId: string) {
    const { error } = await this.supabase
      .from("invitations")
      .delete()
      .eq("org_id", orgId)
      .eq("id", inviteId);

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
