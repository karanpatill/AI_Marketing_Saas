import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireWorkspaceAccess } from '@/backend/middlewares/auth';
import { createOAuthState } from '@/backend/utils/oauthState';
import { FacebookPublisherService } from '@/backend/services/social/FacebookPublisherService';
import { logger } from '@/backend/utils/logger';

/** Browser navigation entry point: 302 to Meta's consent screen with IG scopes. */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  try {
    const user = await requireAuth();
    const workspaceId = request.nextUrl.searchParams.get('workspaceId');
    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    }
    await requireWorkspaceAccess(user.id, workspaceId);

    const state = await createOAuthState('instagram', workspaceId);
    const url = FacebookPublisherService.getInstagramAuthUrl(state, `${origin}/api/social/callback/instagram`);
    return NextResponse.redirect(url);
  } catch (error) {
    logger.error({ err: error }, 'Instagram connect failed');
    return NextResponse.redirect(
      `${origin}/dashboard?instagram_error=${encodeURIComponent((error instanceof Error && error.message) || 'auth_url_failed')}&settingsTab=integrations`
    );
  }
}
