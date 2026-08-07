import { BillingRepository } from '../repositories/BillingRepository';
import { BaseError, ForbiddenError } from '../utils/errors';
import { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

export class BillingService {
  private repository: BillingRepository;

  constructor(supabaseAdmin: SupabaseClient) {
    this.repository = new BillingRepository(supabaseAdmin);
  }

  async getPlans() {
    return this.repository.getPlans();
  }

  async getBillingStatus(orgId: string) {
    try {
      const subscription = await this.repository.getSubscriptionByOrgId(orgId);
      const wallet = await this.repository.getWallet(orgId);
      
      return {
        subscription: subscription || null,
        wallet: wallet || { balance: 0 }
      };
    } catch (error: any) {
      logger.error({ err: error, orgId }, 'Failed to get billing status');
      throw new BaseError('Failed to get billing status', 500, 'GET_BILLING_STATUS_FAILED', error.message);
    }
  }

  async processDummyCheckout(orgId: string, planId: string) {
    try {
      const plan = await this.repository.getPlanById(planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // Simulate webhook logic - in reality, this would just create a Stripe Checkout Session
      // and the webhook would do the upsert. Here we do it directly.
      const subscription = await this.repository.upsertSubscription(orgId, planId, 'active');
      
      // Grant tokens
      if (plan.token_allowance > 0) {
        await this.repository.addTokens(orgId, plan.token_allowance, 'subscription_grant');
      }

      return {
        success: true,
        subscription,
        message: `Successfully subscribed to ${plan.name} and granted ${plan.token_allowance} tokens.`
      };
    } catch (error: any) {
      logger.error({ err: error, orgId, planId }, 'Failed to process dummy checkout');
      throw new BaseError('Checkout failed', 500, 'CHECKOUT_FAILED', error.message);
    }
  }

  async grantInitialTokens(orgId: string) {
    try {
      // 10 free tokens for signup
      const success = await this.repository.grantFreeTokens(orgId, 10);
      return success;
    } catch (error: any) {
      logger.error({ err: error, orgId }, 'Failed to grant initial tokens');
      // Don't throw to avoid breaking org creation if this fails
      return false;
    }
  }

  async deductTokensForGeneration(orgId: string, type: 'static_post' | 'carousel' | 'video' | string) {
    try {
      let cost = 1;
      if (type === 'carousel') cost = 3;
      if (type === 'video') cost = 5;
      const newBalance = await this.repository.deductTokens(orgId, cost, `${type}_generation`);
      return newBalance;
    } catch (error: any) {
      if (error.message === 'Insufficient tokens') {
        throw new BaseError('Payment Required: Not enough tokens', 402, 'INSUFFICIENT_TOKENS', 'You need more tokens to perform this action.');
      }
      logger.error({ err: error, orgId, type }, 'Failed to deduct tokens');
      throw new BaseError('Failed to deduct tokens', 500, 'DEDUCT_TOKENS_FAILED', error.message);
    }
  }
}
