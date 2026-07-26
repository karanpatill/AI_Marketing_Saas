import { SupabaseClient } from "@supabase/supabase-js";

export class AutomationRepository {
  constructor(private supabase: SupabaseClient) {}

  // ----------------------------------------------------
  // SETTINGS
  // ----------------------------------------------------
  async getSettings(workspaceId: string) {
    const { data, error } = await this.supabase
      .from("automation_settings")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();

    if (error && error.code !== "PGRST116") { // Not found
      throw error;
    }
    
    return data || null;
  }

  async updateSettings(workspaceId: string, settings: any) {
    // Upsert mechanism
    const existing = await this.getSettings(workspaceId);
    if (existing) {
      const { data, error } = await this.supabase
        .from("automation_settings")
        .update({ ...settings, updated_at: new Date().toISOString() })
        .eq("workspace_id", workspaceId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await this.supabase
        .from("automation_settings")
        .insert({ workspace_id: workspaceId, ...settings })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  // ----------------------------------------------------
  // CALENDAR
  // ----------------------------------------------------
  async createCalendarEntry(entry: any) {
    const { data, error } = await this.supabase
      .from("content_calendar")
      .insert(entry)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getCalendarForWorkspace(workspaceId: string, limit = 30) {
    const { data, error } = await this.supabase
      .from("content_calendar")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("scheduled_time", { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data;
  }

  async updateCalendarEntry(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from("content_calendar")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // ----------------------------------------------------
  // CRON QUERIES
  // ----------------------------------------------------
  
  // Find workspaces that need planning (e.g. active autopilot but < 7 days of planned posts)
  async getWorkspacesNeedingPlanning() {
    // In a real app, this would be a complex join or edge function.
    // For now, we return active workspaces.
    const { data, error } = await this.supabase
      .from("automation_settings")
      .select("*")
      .eq("is_active", true);
    if (error) throw error;
    return data || [];
  }

  // Get posts that need to be generated (planned, scheduled within next 48h)
  async getPostsNeedingGeneration() {
    const next48Hours = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const { data, error } = await this.supabase
      .from("content_calendar")
      .select("*, workspaces(org_id)")
      .eq("status", "planned")
      .lte("scheduled_time", next48Hours);
    if (error) throw error;
    return data || [];
  }

  // Get posts that need to be published (scheduled, time is <= now)
  async getPostsNeedingPublishing() {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from("content_calendar")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_time", now);
    if (error) throw error;
    return data || [];
  }
}
