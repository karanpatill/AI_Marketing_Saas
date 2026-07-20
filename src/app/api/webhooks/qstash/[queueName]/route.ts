import { NextRequest, NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import { logger } from '@/backend/utils/logger';
import { createAdminClient } from '@/lib/supabaseServer';
import { AIGenerationService } from '@/backend/services/AIGenerationService';

// Ensure QSTASH_CURRENT_SIGNING_KEY and QSTASH_NEXT_SIGNING_KEY are in env.
const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || '',
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('upstash-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing upstash-signature header' }, { status: 401 });
    }

    const bodyText = await req.text();

    const isValid = await receiver.verify({
      signature,
      body: bodyText,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(bodyText);
    const queueName = req.nextUrl.pathname.split('/').pop() || 'default'; // e.g. /api/webhooks/qstash/[queueName]

    logger.info({ queueName, payload }, 'Processing QStash webhook');

    const supabaseAdmin = createAdminClient();

    switch (queueName) {
      case 'ai-generations':
        const aiService = new AIGenerationService(supabaseAdmin);
        await aiService.processJob(payload.jobId, payload.jobType, payload.payload);
        break;
      default:
        logger.warn({ queueName }, 'No handler found for queue');
        break;
    }

    return NextResponse.json({ success: true, message: 'Processed successfully' }, { status: 200 });

  } catch (error: any) {
    logger.error({ err: error }, 'QStash webhook processing failed');
    return NextResponse.json({ error: 'Processing failed', details: error.message }, { status: 500 });
  }
}
