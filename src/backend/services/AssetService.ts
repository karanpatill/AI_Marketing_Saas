import { SupabaseClient } from "@supabase/supabase-js";
import { AssetRepository } from "../repositories/AssetRepository";

export class AssetService {
  private repo: AssetRepository;

  constructor(supabase: SupabaseClient) {
    this.repo = new AssetRepository(supabase);
  }

  async createAsset(workspaceId: string, type: string, url: string, data: any = {}) {
    return this.repo.createAsset({ workspace_id: workspaceId, type, url, ...data });
  }

  async getAssets(workspaceId: string) {
    return this.repo.getAssetsByWorkspace(workspaceId);
  }

  async getAsset(id: string) {
    return this.repo.getAssetById(id);
  }

  async deleteAsset(id: string) {
    return this.repo.deleteAsset(id);
  }
}
