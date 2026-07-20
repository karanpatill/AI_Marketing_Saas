import { TeamRepository } from '../repositories/TeamRepository';
import { BaseError, ForbiddenError, ValidationError } from '../utils/errors';
import { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import { UpdateRoleInput } from '../validations/team';

export class TeamService {
  private repository: TeamRepository;

  constructor(supabaseAdmin: SupabaseClient) {
    this.repository = new TeamRepository(supabaseAdmin);
  }

  async getTeamMembers(orgId: string) {
    try {
      const members = await this.repository.getTeamMembers(orgId);
      return members.map((m: any) => ({
        id: m.id,
        role: m.role,
        joinedAt: m.joined_at,
        userId: m.user_id,
        name: m.profiles?.name || "Unknown Member",
        email: m.profiles?.email || "No email",
        avatarUrl: m.profiles?.avatar_url || ""
      }));
    } catch (error: any) {
      logger.error({ err: error, orgId }, 'Failed to get team members');
      return []; // Return empty array to prevent dashboard crashes
    }
  }

  async updateMemberRole(callerUserId: string, callerRole: string, input: UpdateRoleInput) {
    const { orgId, userId, newRole } = input;

    const targetMember = await this.repository.getMember(orgId, userId);
    if (!targetMember) {
      throw new ValidationError("Target user is not a member of this organization.");
    }

    if (targetMember.role === "owner" && callerRole !== "owner") {
      throw new ForbiddenError("Only owners can update other owners' roles.");
    }

    try {
      await this.repository.updateRole(orgId, userId, newRole);
      await this.repository.logActivity(orgId, callerUserId, "role_updated", { targetUserId: userId, newRole });
    } catch (error: any) {
      logger.error({ err: error, orgId, userId, newRole }, 'Failed to update member role');
      throw new BaseError('Failed to update member role', 500, 'UPDATE_ROLE_FAILED', error.message);
    }
  }

  async removeMember(callerUserId: string, orgId: string, userId: string) {
    // Prevent last owner from leaving
    if (userId === callerUserId) {
      const ownersCount = await this.repository.getOwnersCount(orgId);
      if (ownersCount <= 1) {
        throw new ValidationError("Cannot leave organization. You are the last owner.");
      }
    }

    try {
      await this.repository.removeMember(orgId, userId);
      await this.repository.logActivity(orgId, callerUserId, "member_removed", { removedUserId: userId });
    } catch (error: any) {
      logger.error({ err: error, orgId, userId }, 'Failed to remove member');
      throw new BaseError('Failed to remove member', 500, 'REMOVE_MEMBER_FAILED', error.message);
    }
  }
}
