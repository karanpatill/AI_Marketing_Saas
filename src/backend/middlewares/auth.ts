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
