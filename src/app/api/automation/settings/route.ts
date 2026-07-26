import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { AutomationRepository } from '@/backend/repositories/AutomationRepository';
import { WorkspaceService } from '@/backend/services/WorkspaceService';
import { logger } from '@/backend/utils/logger';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    let workspaceId = url.searchParams.get('workspaceId');

    if (!workspaceId) {
      const workspaceService = new WorkspaceService(supabase);
      const { workspaces } = await workspaceService.getUserOrganizationsAndWorkspaces(user.id);
      if (workspaces.length === 0) {
        return NextResponse.json({ error: 'No workspace found' }, { status: 404 });
      }
      workspaceId = workspaces[0].workspace_id;
    }

    const autoRepo = new AutomationRepository(supabase);
    let settings = await autoRepo.getSettings(workspaceId!);
    
    if (!settings) {
      // Return default settings
      settings = {
        workspace_id: workspaceId,
        is_active: false,
        posts_per_week: 3,
        target_timezone: 'America/New_York',
        content_mix_preferences: { static: 70, carousel: 30 }
      };
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    logger.error('Failed to get automation settings', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { workspaceId, ...settings } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    const autoRepo = new AutomationRepository(supabase);
    const updatedSettings = await autoRepo.updateSettings(workspaceId, settings);

    return NextResponse.json(updatedSettings);
  } catch (error: any) {
    logger.error('Failed to update automation settings', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
