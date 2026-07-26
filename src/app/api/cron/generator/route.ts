import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServer';
import { AutomationGenerationService } from '@/backend/services/AutomationGenerationService';
import { logger } from '@/backend/utils/logger';

// Vercel Cron will hit this endpoint
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabaseAdmin = createAdminClient();
    const generatorService = new AutomationGenerationService(supabaseAdmin);
    
    await generatorService.runGenerator();

    return NextResponse.json({ success: true, message: 'Generator executed successfully' });
  } catch (error: any) {
    logger.error('Generator CRON failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
