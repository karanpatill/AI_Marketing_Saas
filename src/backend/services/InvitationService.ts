import { InvitationRepository } from '../repositories/InvitationRepository';
import { BaseError } from '../utils/errors';
import { CreateInvitationInput } from '../validations/invitations';
import { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import { randomBytes } from 'crypto';

export class InvitationService {
  private repository: InvitationRepository;

  constructor(supabaseAdmin: SupabaseClient) {
    this.repository = new InvitationRepository(supabaseAdmin);
  }

  async getPendingInvitations(orgId: string) {
    try {
      return await this.repository.getPendingInvitations(orgId);
    } catch (error: any) {
      logger.error({ err: error, orgId }, 'Failed to fetch pending invitations');
      throw new BaseError('Failed to retrieve invitations', 500, 'FETCH_INVITATIONS_FAILED', error.message);
    }
  }

  async createInvitation(callerUserId: string, input: CreateInvitationInput) {
    const { orgId, email, role } = input;
    const token = randomBytes(24).toString("hex");
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    try {
      const invitation = await this.repository.createInvitation(orgId, email, role, token, callerUserId, expiresAt.toISOString());
      await this.repository.logActivity(orgId, callerUserId, "member_invited", { email, role, inviteId: invitation.id });
      
      // TODO: Queue an email to be sent to the user via Upstash QStash/Resend
      
      return invitation;
    } catch (error: any) {
      logger.error({ err: error, orgId, email, role }, 'Failed to create invitation');
      throw new BaseError('Failed to create invitation', 500, 'CREATE_INVITATION_FAILED', error.message);
    }
  }

  async revokeInvitation(callerUserId: string, orgId: string, inviteId: string) {
    try {
      await this.repository.revokeInvitation(orgId, inviteId);
      // Optional: log activity for revocation
    } catch (error: any) {
      logger.error({ err: error, orgId, inviteId }, 'Failed to revoke invitation');
      throw new BaseError('Failed to revoke invitation', 500, 'REVOKE_INVITATION_FAILED', error.message);
    }
  }
}
