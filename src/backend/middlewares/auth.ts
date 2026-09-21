import { NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabaseServer';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { User } from '@supabase/supabase-js';

export interface AuthenticatedRequest extends NextRequest {
  user: User;
}

/**
 * Middleware function that can be called inside an API route to assert authentication.
 * Throws UnauthorizedError if not authenticated.
 */
export async function requireAuth(): Promise<User> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError();
  }

  return user;
}

/**
 * Middleware function to assert that a user has admin/owner rights to a workspace's parent organization.
 * Throws ForbiddenError if not an admin.
 */
export async function requireWorkspaceAdmin(userId: string, workspaceId: string): Promise<void> {
  const supabaseAdmin = createAdminClient();
  
  // Get the workspace to find its org_id
  const { data: workspace, error: wsError } = await supabaseAdmin
    .from('workspaces')
    .select('org_id')
    .eq('id', workspaceId)
    .single();

  if (wsError || !workspace) {
    throw new ForbiddenError("Workspace not found or access denied.");
  }

  // Check role in the org
  const { data: member, error: memberError } = await supabaseAdmin
    .from('members')
    .select('role')
    .eq('org_id', workspace.org_id)
    .eq('user_id', userId)
    .single();

  if (memberError || !member || !['owner', 'admin'].includes(member.role)) {
    throw new ForbiddenError("Admin rights required for this workspace.");
  }
}

/**
 * Middleware function to assert that a user has admin/owner rights to an organization.
 * Throws ForbiddenError if not an admin.
 */
export async function requireOrgAdmin(userId: string, orgId: string): Promise<void> {
  const supabaseAdmin = createAdminClient();
  
  // Check role in the org
  const { data: member, error: memberError } = await supabaseAdmin
    .from('members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .single();

  if (memberError || !member || !['owner', 'admin'].includes(member.role)) {
    throw new ForbiddenError("Admin rights required for this organization.");
  }
}

/**
 * Asserts that a user is a member of the organization that owns a workspace.
 * Returns the org id and the user's role so callers can make finer-grained decisions.
 * Throws ForbiddenError otherwise (also when the workspace does not exist, to avoid leaking ids).
 */
export async function requireWorkspaceAccess(
  userId: string,
  workspaceId: string
): Promise<{ orgId: string; role: string }> {
  if (!workspaceId) {
    throw new ForbiddenError("Workspace not found or access denied.");
  }

  const supabaseAdmin = createAdminClient();

  const { data: workspace, error: wsError } = await supabaseAdmin
    .from('workspaces')
    .select('org_id')
    .eq('id', workspaceId)
    .single();

  if (wsError || !workspace) {
    throw new ForbiddenError("Workspace not found or access denied.");
  }

  const { data: member, error: memberError } = await supabaseAdmin
    .from('members')
    .select('role')
    .eq('org_id', workspace.org_id)
    .eq('user_id', userId)
    .single();

  if (memberError || !member) {
    throw new ForbiddenError("You do not have access to this workspace.");
  }

  return { orgId: workspace.org_id, role: member.role };
}

/**
 * Asserts that a user can access a brand (brand_dna row) through its workspace membership.
 * Returns the owning workspace id.
 */
export async function requireBrandAccess(userId: string, brandDnaId: string): Promise<{ workspaceId: string }> {
  if (!brandDnaId) {
    throw new ForbiddenError("Brand not found or access denied.");
  }

  const supabaseAdmin = createAdminClient();

  const { data: brand, error } = await supabaseAdmin
    .from('brand_dna')
    .select('workspace_id')
    .eq('id', brandDnaId)
    .single();

  if (error || !brand?.workspace_id) {
    throw new ForbiddenError("Brand not found or access denied.");
  }

  await requireWorkspaceAccess(userId, brand.workspace_id);
  return { workspaceId: brand.workspace_id };
}

/**
 * Asserts that a request carries the shared CRON_SECRET as a bearer token.
 * Fails closed: if the secret is not configured the endpoint is unreachable.
 */
export function requireCronSecret(req: Request): void {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');

  if (!secret || authHeader !== `Bearer ${secret}`) {
    throw new UnauthorizedError("Invalid or missing cron secret.");
  }
}

/**
 * Asserts that a user can access a project through its workspace membership.
 */
export async function requireProjectAccess(userId: string, projectId: string): Promise<{ workspaceId: string }> {
  if (!projectId) {
    throw new ForbiddenError("Project not found or access denied.");
  }

  const supabaseAdmin = createAdminClient();
  const { data: project, error } = await supabaseAdmin
    .from('projects')
    .select('workspace_id')
    .eq('id', projectId)
    .single();

  if (error || !project?.workspace_id) {
    throw new ForbiddenError("Project not found or access denied.");
  }

  await requireWorkspaceAccess(userId, project.workspace_id);
  return { workspaceId: project.workspace_id };
}

/**
 * Resolves the workspace a request should act on. If the client supplied one, membership is
 * enforced; otherwise the user's most recent workspace is used. Throws if the user has none.
 */
export async function resolveWorkspaceForUser(userId: string, requestedWorkspaceId?: string | null): Promise<string> {
  if (requestedWorkspaceId) {
    await requireWorkspaceAccess(userId, requestedWorkspaceId);
    return requestedWorkspaceId;
  }

  const supabaseAdmin = createAdminClient();
  const { data: memberships } = await supabaseAdmin
    .from('members')
    .select('org_id')
    .eq('user_id', userId);

  const orgIds = (memberships || []).map((m) => m.org_id);
  if (orgIds.length === 0) {
    throw new ForbiddenError("You are not a member of any workspace yet.");
  }

  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('id')
    .in('org_id', orgIds)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!workspace) {
    throw new ForbiddenError("No workspace found for your account.");
  }
  return workspace.id;
}
