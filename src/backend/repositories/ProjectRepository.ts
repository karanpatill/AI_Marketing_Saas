import { SupabaseClient } from "@supabase/supabase-js";

export class ProjectRepository {
  constructor(private supabase: SupabaseClient) {}

  async createProject(projectData: any) {
    const { data, error } = await this.supabase
      .from("projects")
      .insert(projectData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getProjectsByWorkspace(workspaceId: string) {
    const { data, error } = await this.supabase
      .from("projects")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  async getProjectById(id: string) {
    const { data, error } = await this.supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  async updateProject(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from("projects")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteProject(id: string) {
    const { error } = await this.supabase
      .from("projects")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  }
}
