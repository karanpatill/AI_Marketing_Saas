import { SupabaseClient } from "@supabase/supabase-js";

export class AssetRepository {
  constructor(private supabase: SupabaseClient) {}

  async createAsset(assetData: any) {
    const { data, error } = await this.supabase
      .from("assets")
      .insert(assetData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getAssetsByWorkspace(workspaceId: string) {
    const { data, error } = await this.supabase
      .from("assets")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  async getAssetById(id: string) {
    const { data, error } = await this.supabase
      .from("assets")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  async deleteAsset(id: string) {
    const { error } = await this.supabase
      .from("assets")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  }
}
