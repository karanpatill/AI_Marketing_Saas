import { SupabaseClient } from "@supabase/supabase-js";
import { BrandRepository } from "../repositories/BrandRepository";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class BrandService {
  private repo: BrandRepository;
  private genAI: GoogleGenerativeAI | null = null;

  constructor(supabase: SupabaseClient) {
    this.repo = new BrandRepository(supabase);
    if (process.env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  async createBrand(workspaceId: string, name: string, data: any = {}) {
    return this.repo.createBrand({ 
      workspace_id: workspaceId, 
      name, 
      ...data
    });
  }

  async getBrands(workspaceId: string) {
    return this.repo.getBrandsByWorkspace(workspaceId);
  }

  async getBrand(id: string) {
    return this.repo.getBrandById(id);
  }

  async updateBrand(id: string, data: any) {
    if (Object.keys(data).length > 0 && !data.internal_design_language && (data.brand_personality || data.industry || data.business_description)) {
       // Optional: Re-calculate if major fields change, or keep it locked. The requirement says "when brand is onboarded... it will remain consistent all the time".
       // So we DO NOT recalculate on update unless explicitly asked.
    }
    return this.repo.updateBrand(id, data);
  }

  async deleteBrand(id: string) {
    return this.repo.deleteBrand(id);
  }
}
