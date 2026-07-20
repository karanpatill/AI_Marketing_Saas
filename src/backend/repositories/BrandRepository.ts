import { SupabaseClient } from "@supabase/supabase-js";

export class BrandRepository {
  constructor(private supabase: SupabaseClient) {}

  async createBrand(brandData: any) {
    const { data, error } = await this.supabase
      .from("brands")
      .insert(brandData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getBrandsByWorkspace(workspaceId: string) {
    const { data, error } = await this.supabase
      .from("brands")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  async getBrandById(id: string) {
    const { data, error } = await this.supabase
      .from("brands")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  async updateBrand(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from("brands")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteBrand(id: string) {
    const { error } = await this.supabase
      .from("brands")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  }
}
