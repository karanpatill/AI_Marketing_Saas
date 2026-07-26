import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServer';
import { AutomationPlannerService } from '@/backend/services/AutomationPlannerService';
import { logger } from '@/backend/utils/logger';

// Vercel Cron will hit this endpoint
export async function GET(req: Request) {
  try {
    // Basic auth check if hitting from external, Vercel cron usually passes an auth header
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // In dev we might allow it without secret
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabaseAdmin = createAdminClient();
    const plannerService = new AutomationPlannerService(supabaseAdmin);
    
    await plannerService.runPlanner();

    return NextResponse.json({ success: true, message: 'Planner executed successfully' });
  } catch (error: any) {
    logger.error('Planner CRON failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
