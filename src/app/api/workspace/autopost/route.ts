import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { logger } from '@/backend/utils/logger';

// Admin client bypasses RLS for workspace lookups
const getAdminClient = () =>
  createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { workspaceId, enabled, time, type } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Fetch the workspace (using admin client to bypass RLS)
    const { data: workspace, error: wsError } = await admin
      .from('workspaces')
      .select('org_id, auto_post_schedule_id')
      .eq('id', workspaceId)
      .single();

    if (wsError || !workspace) {
      logger.error({ wsError, workspaceId }, 'Workspace not found');
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Verify the user belongs to this workspace's org via `members` table
    const { data: member, error: memberError } = await admin
      .from('members')
      .select('id')
      .eq('org_id', workspace.org_id)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      // Also check workspace_users as a fallback
      const { data: wsUser } = await admin
        .from('workspace_users')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();

      if (!wsUser) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    let scheduleId = workspace.auto_post_schedule_id;

    // Try to handle AutoPostScheduler if available, but don't crash if not configured
    try {
      const { AutoPostScheduler } = await import('@/backend/services/AutoPostScheduler');
      const scheduler = new AutoPostScheduler();

      if (enabled) {
        if (scheduleId) {
          await scheduler.disableAutoPost(scheduleId);
        }
        if (time && type) {
          const [hour, minute] = time.split(':');
          const cron = `${minute} ${hour} * * *`;
          scheduleId = await scheduler.enableAutoPost(workspaceId, cron, type);
        }
      } else {
        if (scheduleId) {
          await scheduler.disableAutoPost(scheduleId);
          scheduleId = null;
        }
      }
    } catch (schedulerErr) {
      // Scheduler might not be configured in all environments — that's OK
      logger.warn({ schedulerErr }, 'AutoPostScheduler not available, skipping schedule management');
      if (!enabled) scheduleId = null;
    }

    // Update DB
    const { error: updateError } = await admin
      .from('workspaces')
      .update({
        auto_post_enabled: enabled,
        auto_post_time: time || null,
        auto_post_type: type || null,
        auto_post_schedule_id: scheduleId,
      })
      .eq('id', workspaceId);

    if (updateError) {
      logger.error({ error: updateError }, 'Failed to update workspace auto-post settings');
      return NextResponse.json({ error: 'Failed to update settings: ' + updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, scheduleId, enabled });
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to configure auto-posting');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
