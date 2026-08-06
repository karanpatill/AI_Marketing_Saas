import { NextRequest, NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import { logger } from '@/backend/utils/logger';
import { createAdminClient } from '@/lib/supabaseServer';
import { AIGenerationService } from '@/backend/services/AIGenerationService';
import { AutomationRepository } from '@/backend/repositories/AutomationRepository';

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
      case 'auto-post-trigger':
        logger.info({ workspaceId: payload.workspaceId }, 'Received auto-post trigger. Enqueuing AI generation job.');
        const triggerAiService = new AIGenerationService(supabaseAdmin);
        const autoRepo = new AutomationRepository(supabaseAdmin);
        
        // Fetch the planned post for today from the content calendar
        const nextPost = await autoRepo.getNextPlannedPost(payload.workspaceId);
        let promptTopic = 'AI Marketing Strategies'; // Fallback
        let calendarId = undefined;
        let postType = payload.type || 'carousel';

        if (nextPost) {
          promptTopic = nextPost.topic;
          calendarId = nextPost.id;
          postType = nextPost.post_type || postType;
        }
        
        // Map user type (carousel, post, video) to the corresponding generator module job_type
        const typeMap: Record<string, string> = {
          'carousel': 'generate_carousel',
          'post': 'generate_post',
          'video': 'generate_video'
        };
        const jobType = typeMap[postType] || 'generate_carousel';
        
        // We push a job to the ai-generations queue to be processed asynchronously
        const job = await triggerAiService.enqueueJob({
          userId: '00000000-0000-0000-0000-000000000000',
          workspaceId: payload.workspaceId,
          jobType: jobType,
          payload: {
            type: postType,
            topic: promptTopic,
            auto_published: true,
            calendar_id: calendarId
          }
        });

        // Mark the calendar entry as generating if we found one
        if (calendarId) {
          await autoRepo.updateCalendarEntry(calendarId, {
            status: "generating",
            job_id: job.id
          });
        }
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
