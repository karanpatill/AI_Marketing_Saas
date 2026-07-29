import { SupabaseClient } from "@supabase/supabase-js";

export class BrandRepository {
  constructor(private supabase: SupabaseClient) {}

  async createBrand(brandData: any) {
    if (brandData.name && !brandData.brand_name) {
      brandData.brand_name = brandData.name;
      delete brandData.name;
    }
    const { data, error } = await this.supabase
      .from("brand_dna")
      .insert(brandData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getBrandsByWorkspace(workspaceId: string) {
    const { data, error } = await this.supabase
      .from("brand_dna")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  async getBrandById(id: string) {
    const { data, error } = await this.supabase
      .from("brand_dna")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  async updateBrand(id: string, updates: any) {
    if (updates.name && !updates.brand_name) {
      updates.brand_name = updates.name;
      delete updates.name;
    }
    const { data, error } = await this.supabase
      .from("brand_dna")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteBrand(id: string) {
    const { error } = await this.supabase
      .from("brand_dna")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  }
}
