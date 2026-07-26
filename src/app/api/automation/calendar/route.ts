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
    const calendar = await autoRepo.getCalendarForWorkspace(workspaceId!);
    
    return NextResponse.json(calendar || []);
  } catch (error: any) {
    logger.error('Failed to get automation calendar', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
