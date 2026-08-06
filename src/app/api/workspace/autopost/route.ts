import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { AutoPostScheduler } from '@/backend/services/AutoPostScheduler';
import { logger } from '@/backend/utils/logger';

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

    // Verify user belongs to workspace
    const { data: member, error: memberError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const scheduler = new AutoPostScheduler();

    // Fetch existing workspace settings to check for an old schedule
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .select('auto_post_schedule_id')
      .eq('id', workspaceId)
      .single();

    if (wsError) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    let scheduleId = workspace.auto_post_schedule_id;

    if (enabled) {
      // If there's an existing schedule and we're just updating the time, delete old one first
      if (scheduleId) {
        await scheduler.disableAutoPost(scheduleId);
      }

      if (!time || !type) {
        return NextResponse.json({ error: 'Time and type are required when enabling' }, { status: 400 });
      }

      // Convert local time "HH:mm" to UTC Cron
      // For now, assuming time is passed as UTC HH:mm (e.g. "09:00")
      const [hour, minute] = time.split(':');
      const cron = `${minute} ${hour} * * *`; // Run every day at HH:mm

      scheduleId = await scheduler.enableAutoPost(workspaceId, cron, type);
    } else {
      // Disabling
      if (scheduleId) {
        await scheduler.disableAutoPost(scheduleId);
        scheduleId = null; // Clear from DB
      }
    }

    // Update DB
    const { error: updateError } = await supabase
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
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true, scheduleId });
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to configure auto-posting');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
