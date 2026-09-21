import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServer';
import { AutomationGenerationService } from '@/backend/services/AutomationGenerationService';
import { logger } from '@/backend/utils/logger';
import { requireCronSecret } from '@/backend/middlewares/auth';
import { BaseError } from '@/backend/utils/errors';

// Vercel Cron will hit this endpoint
export async function GET(req: Request) {
  try {
    // Fail closed: CRON_SECRET must be configured and match.
    requireCronSecret(req);

    const supabaseAdmin = createAdminClient();
    const generatorService = new AutomationGenerationService(supabaseAdmin);
    
    await generatorService.runGenerator();

    return NextResponse.json({ success: true, message: 'Generator executed successfully' });
  } catch (error: any) {
    if (error instanceof BaseError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Generator CRON failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
