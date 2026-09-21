import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireWorkspaceAccess } from '@/backend/middlewares/auth';
import { createOAuthState } from '@/backend/utils/oauthState';
import { LinkedInPublisherService } from '@/backend/services/social/LinkedInPublisherService';
import { logger } from '@/backend/utils/logger';

/** Browser navigation entry point: 302 to LinkedIn's consent screen. */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  try {
    const user = await requireAuth();
    const workspaceId = request.nextUrl.searchParams.get('workspaceId');
    if (!workspaceId) {
      return NextResponse.redirect(`${origin}/dashboard?linkedin_error=missing_workspace`);
    }
    await requireWorkspaceAccess(user.id, workspaceId);

    const state = await createOAuthState('linkedin', workspaceId);
    const authUrl = LinkedInPublisherService.getAuthUrl(state, `${origin}/api/social/callback/linkedin`);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    logger.error({ err: error }, 'LinkedIn connect failed');
    return NextResponse.redirect(`${origin}/dashboard?linkedin_error=${encodeURIComponent((error instanceof Error && error.message) || 'auth_url_failed')}`);
  }
}
