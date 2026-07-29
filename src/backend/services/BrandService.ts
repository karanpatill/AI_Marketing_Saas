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

  private async assignDesignLanguageAI(name: string, data: any): Promise<string> {
    if (!this.genAI) return "minimalism";
    
    const prompt = `You are an expert AI art director. 
Given the following brand details, assign exactly ONE of the following 8 design languages to it:
[Blueprint, Brutalism, Swiss Style, Surrealism, Minimalism, Maximalism, Hand-drawn, Retro]

Brand Name: ${name}
Industry: ${data.industry || 'Unknown'}
Business Description: ${data.business_description || 'Unknown'}
Personality: ${data.brand_personality || 'Unknown'}
Target Audience: ${data.target_audience || 'Unknown'}
Values: ${JSON.stringify(data.brand_values || [])}

Respond with ONLY the exact name of the chosen design language from the list above. Nothing else.`;

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim().toLowerCase();
      
      const validStyles = ["blueprint", "brutalism", "swiss style", "surrealism", "minimalism", "maximalism", "hand-drawn", "retro"];
      for (const style of validStyles) {
        if (text.includes(style)) return style;
      }
      return "minimalism"; // fallback
    } catch (e) {
      console.error("Failed to assign design language via AI:", e);
      return "minimalism";
    }
  }

  async createBrand(workspaceId: string, name: string, data: any = {}) {
    const internalDesignLanguage = await this.assignDesignLanguageAI(name, data);
    return this.repo.createBrand({ 
      workspace_id: workspaceId, 
      name, 
      ...data,
      internal_design_language: internalDesignLanguage
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
