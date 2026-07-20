import { SupabaseClient } from "@supabase/supabase-js";

export class CampaignRepository {
  constructor(private supabase: SupabaseClient) {}

  async createCampaign(campaignData: any) {
    const { data, error } = await this.supabase
      .from("campaigns")
      .insert(campaignData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getCampaignsByProject(projectId: string) {
    const { data, error } = await this.supabase
      .from("campaigns")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  async getCampaignById(id: string) {
    const { data, error } = await this.supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  async updateCampaign(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from("campaigns")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteCampaign(id: string) {
    const { error } = await this.supabase
      .from("campaigns")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  }
}
