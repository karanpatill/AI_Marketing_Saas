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
      .from("brand_calendar")
      .insert(entry)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getCalendarForWorkspace(workspaceId: string, limit = 30) {
    const { data: dnaData } = await this.supabase
      .from('brand_dna')
      .select('id')
      .eq('workspace_id', workspaceId)
      .single();
    if (!dnaData) return [];

    const { data, error } = await this.supabase
      .from("brand_calendar")
      .select("*")
      .eq("brand_dna_id", dnaData.id)
      .order("date", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async getNextPlannedPost(workspaceId: string) {
    const { data: dnaData } = await this.supabase
      .from('brand_dna')
      .select('id')
      .eq('workspace_id', workspaceId)
      .single();
    if (!dnaData) return null;

    const { data, error } = await this.supabase
      .from("brand_calendar")
      .select("*")
      .eq("brand_dna_id", dnaData.id)
      .eq("status", "planned")
      .order("date", { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    if (data) data.topic = data.title; // map title to topic for backward compatibility
    return data || null;
  }

  async updateCalendarEntry(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from("brand_calendar")
      .update(updates)
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
      .from("brand_calendar")
      .select("*, brand_dna(workspace_id)")
      .eq("status", "planned")
      .lte("date", next48Hours);
    if (error) throw error;
    
    // Map it to backward compatible format
    return (data || []).map((post: any) => ({
      ...post,
      workspace_id: post.brand_dna?.workspace_id,
      topic: post.title,
      scheduled_time: post.date
    }));
  }

  // Get posts that need to be published (scheduled, time is <= now)
  async getPostsNeedingPublishing() {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from("brand_calendar")
      .select("*, brand_dna(workspace_id)")
      .eq("status", "scheduled")
      .lte("date", now);
    if (error) throw error;

    return (data || []).map((post: any) => ({
      ...post,
      workspace_id: post.brand_dna?.workspace_id,
      topic: post.title,
      scheduled_time: post.date
    }));
  }
}
