import { SupabaseClient } from "@supabase/supabase-js";
import { ProjectRepository } from "../repositories/ProjectRepository";

export class ProjectService {
  private repo: ProjectRepository;

  constructor(supabase: SupabaseClient) {
    this.repo = new ProjectRepository(supabase);
  }

  async createProject(workspaceId: string, name: string, data: any = {}) {
    return this.repo.createProject({ workspace_id: workspaceId, name, ...data });
  }

  async getProjects(workspaceId: string) {
    return this.repo.getProjectsByWorkspace(workspaceId);
  }

  async getProject(id: string) {
    return this.repo.getProjectById(id);
  }

  async updateProject(id: string, data: any) {
    return this.repo.updateProject(id, data);
  }

  async deleteProject(id: string) {
    return this.repo.deleteProject(id);
  }
}
