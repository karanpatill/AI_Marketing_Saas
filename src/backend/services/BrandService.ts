import { SupabaseClient } from "@supabase/supabase-js";
import { BrandRepository } from "../repositories/BrandRepository";

export class BrandService {
  private repo: BrandRepository;

  constructor(supabase: SupabaseClient) {
    this.repo = new BrandRepository(supabase);
  }

  async createBrand(workspaceId: string, name: string, data: any = {}) {
    return this.repo.createBrand({ workspace_id: workspaceId, name, ...data });
  }

  async getBrands(workspaceId: string) {
    return this.repo.getBrandsByWorkspace(workspaceId);
  }

  async getBrand(id: string) {
    return this.repo.getBrandById(id);
  }

  async updateBrand(id: string, data: any) {
    return this.repo.updateBrand(id, data);
  }

  async deleteBrand(id: string) {
    return this.repo.deleteBrand(id);
  }
}
