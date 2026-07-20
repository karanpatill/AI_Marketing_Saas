import { SupabaseClient } from "@supabase/supabase-js";
import { CampaignRepository } from "../repositories/CampaignRepository";

export class CampaignService {
  private repo: CampaignRepository;

  constructor(supabase: SupabaseClient) {
    this.repo = new CampaignRepository(supabase);
  }

  async createCampaign(projectId: string, name: string, data: any = {}) {
    return this.repo.createCampaign({ project_id: projectId, name, ...data });
  }

  async getCampaigns(projectId: string) {
    return this.repo.getCampaignsByProject(projectId);
  }

  async getCampaign(id: string) {
    return this.repo.getCampaignById(id);
  }

  async updateCampaign(id: string, data: any) {
    return this.repo.updateCampaign(id, data);
  }

  async deleteCampaign(id: string) {
    return this.repo.deleteCampaign(id);
  }
}
