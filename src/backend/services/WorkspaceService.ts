import { WorkspaceRepository } from '../repositories/WorkspaceRepository';
import { ForbiddenError, BaseError } from '../utils/errors';
import { CreateWorkspaceInput } from '../validations/workspace';
import { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

export class WorkspaceService {
  private repository: WorkspaceRepository;

  constructor(supabaseAdmin: SupabaseClient) {
    this.repository = new WorkspaceRepository(supabaseAdmin);
  }

  async getUserOrganizationsAndWorkspaces(userId: string) {
    try {
      const members = await this.repository.getUserOrganizations(userId);
      
      const organizations = members.map((m: any) => ({
        orgId: m.org_id,
        role: m.role,
        ...m.organizations
      }));

      const orgIds = organizations.map((o: any) => o.orgId);
      const workspaces = await this.repository.getWorkspacesByOrgIds(orgIds);

      return { organizations, workspaces };
    } catch (error: any) {
      logger.error({ err: error, userId }, 'Failed to fetch user organizations and workspaces');
      throw new BaseError('Failed to retrieve workspaces', 500, 'FETCH_WORKSPACE_FAILED', error.message);
    }
  }

  async createWorkspace(userId: string, input: CreateWorkspaceInput) {
    const { orgId, name } = input;

    // Check if user is Admin/Owner in this org
    const role = await this.repository.getUserRoleInOrg(orgId, userId);
    
    if (!role || !["owner", "admin"].includes(role)) {
      throw new ForbiddenError("Admin rights required to create a workspace in this organization.");
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

    try {
      const workspace = await this.repository.createWorkspace(orgId, name, slug);
      
      // Log Activity
      await this.repository.logActivity(orgId, userId, "workspace_created", { 
        workspaceName: name, 
        workspaceId: workspace.id 
      });

      return workspace;
    } catch (error: any) {
      logger.error({ err: error, userId, orgId }, 'Failed to create workspace');
      throw new BaseError('Failed to create workspace', 500, 'CREATE_WORKSPACE_FAILED', error.message);
    }
  }
}
