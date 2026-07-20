import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabaseServer';

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, any>;
}

export class WebhookService {
  
  /**
   * Broadcasts an event to all active webhooks subscribed to that event in the workspace.
   */
  public static async emitEvent(workspaceId: string, eventName: string, data: Record<string, any>) {
    const supabase = createAdminClient();

    // 1. Find all active webhooks for this workspace that subscribe to this event
    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('status', 'active')
      .contains('events', [eventName]);

    if (error || !webhooks || webhooks.length === 0) {
      return; // No subscribers
    }

    const payload: WebhookPayload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      data
    };

    // 2. Dispatch to each URL asynchronously
    webhooks.forEach(webhook => {
      this.dispatchWebhook(webhook, payload).catch(e => {
        console.error(`[WebhookService] Failed to dispatch webhook ${webhook.id}:`, e);
      });
    });
  }

  /**
   * Sends the HTTP request and generates an HMAC signature for security.
   */
  private static async dispatchWebhook(webhook: any, payload: WebhookPayload) {
    const body = JSON.stringify(payload);
    
    // Generate HMAC signature using the webhook's secret
    const signature = crypto.createHmac('sha256', webhook.secret).update(body).digest('hex');

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Automarc-Signature': signature,
          'X-Automarc-Event': payload.event
        },
        body
      });

      const supabase = createAdminClient();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Update last triggered
      await supabase.from('webhooks').update({ 
        last_triggered_at: new Date().toISOString(),
        failure_count: 0 // Reset failures on success
      }).eq('id', webhook.id);

    } catch (e: any) {
      // Increment failure count, disable if it fails too many times
      const supabase = createAdminClient();
      const newFailCount = (webhook.failure_count || 0) + 1;
      
      await supabase.from('webhooks').update({
        failure_count: newFailCount,
        status: newFailCount > 5 ? 'failing' : 'active'
      }).eq('id', webhook.id);
      
      throw e;
    }
  }
}
