import { SupabaseClient } from '@supabase/supabase-js';

export class BillingRepository {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  // --- Plans ---
  async getPlans() {
    const { data, error } = await this.supabase
      .from('plans')
      .select('*')
      .order('price_monthly', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getPlanById(planId: string) {
    const { data, error } = await this.supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) throw error;
    return data;
  }

  // --- Subscriptions ---
  async getSubscriptionByOrgId(orgId: string) {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('org_id', orgId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async upsertSubscription(orgId: string, planId: string, status: string = 'active') {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .upsert({
        org_id: orgId,
        plan_id: planId,
        status,
        current_period_start: new Date().toISOString(),
        // Defaulting dummy current_period_end to 1 month from now
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'org_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // --- Wallets (Tokens) ---
  async getWallet(orgId: string) {
    let { data, error } = await this.supabase
      .from('org_wallets')
      .select('*')
      .eq('org_id', orgId)
      .maybeSingle();

    if (error) throw error;

    // Auto-create wallet if it doesn't exist
    if (!data) {
      const { data: newWallet, error: createError } = await this.supabase
        .from('org_wallets')
        .insert({ org_id: orgId, balance: 10, free_tokens_granted: true })
        .select()
        .single();
      
      if (createError) throw createError;
      data = newWallet;

      // Log the transaction
      await this.supabase.from('token_transactions').insert({
        org_id: orgId,
        amount: 10,
        reason: 'signup_bonus',
        metadata: { description: '10 free tokens on signup' }
      });
    }

    return data;
  }

  async grantFreeTokens(orgId: string, amount: number) {
    // Attempt to grant free tokens only if not granted yet
    const { data: wallet } = await this.supabase
      .from('org_wallets')
      .select('free_tokens_granted')
      .eq('org_id', orgId)
      .single();

    if (wallet?.free_tokens_granted) {
      return false; // Already granted
    }

    // Manual update
    const { data: currentWallet } = await this.supabase
      .from('org_wallets')
      .select('balance')
      .eq('org_id', orgId)
      .single();
      
    const newBalance = (currentWallet?.balance || 0) + amount;
    
    await this.supabase
      .from('org_wallets')
      .update({ balance: newBalance, free_tokens_granted: true })
      .eq('org_id', orgId);

    await this.logTokenTransaction(orgId, amount, 'signup_bonus');
    return true;
  }

  async addTokens(orgId: string, amount: number, reason: string) {
    const { data: currentWallet } = await this.supabase
      .from('org_wallets')
      .select('balance')
      .eq('org_id', orgId)
      .single();
      
    const newBalance = (currentWallet?.balance || 0) + amount;
    
    await this.supabase
      .from('org_wallets')
      .update({ balance: newBalance })
      .eq('org_id', orgId);

    await this.logTokenTransaction(orgId, amount, reason);
    return newBalance;
  }

  async deductTokens(orgId: string, amount: number, reason: string) {
    const { data: currentWallet } = await this.supabase
      .from('org_wallets')
      .select('balance')
      .eq('org_id', orgId)
      .single();
      
    const currentBalance = currentWallet?.balance || 0;
    
    if (currentBalance < amount) {
      throw new Error("Insufficient tokens");
    }

    const newBalance = currentBalance - amount;
    
    const { error } = await this.supabase
      .from('org_wallets')
      .update({ balance: newBalance })
      .eq('org_id', orgId);
      
    if (error) throw error;

    await this.logTokenTransaction(orgId, -amount, reason);
    return newBalance;
  }

  // --- Transactions ---
  async logTokenTransaction(orgId: string, amount: number, reason: string, metadata: any = {}) {
    const { error } = await this.supabase
      .from('token_transactions')
      .insert({
        org_id: orgId,
        amount,
        reason,
        metadata
      });

    if (error) throw error;
  }
}
