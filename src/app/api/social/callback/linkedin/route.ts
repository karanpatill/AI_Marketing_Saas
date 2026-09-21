import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireWorkspaceAccess } from '@/backend/middlewares/auth';
import { consumeOAuthState } from '@/backend/utils/oauthState';
import { LinkedInPublisherService } from '@/backend/services/social/LinkedInPublisherService';
import { logger } from '@/backend/utils/logger';

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error || !code || !state) {
    logger.warn({ error }, 'LinkedIn OAuth callback missing code/state');
    return NextResponse.redirect(`${origin}/dashboard?linkedin_error=${encodeURIComponent(error || 'connection_failed')}`);
  }

  try {
    // The callback must come from the same signed-in user that started the flow,
    // and the state nonce must match the cookie we set for their chosen workspace.
    const user = await requireAuth();
    const workspaceId = await consumeOAuthState('linkedin', state);
    await requireWorkspaceAccess(user.id, workspaceId);

    const redirectUri = `${origin}/api/social/callback/linkedin`;
    const { accessToken, memberUrn, name } = await LinkedInPublisherService.exchangeCodeForToken(code, redirectUri);
    await LinkedInPublisherService.saveConnection(workspaceId, name, memberUrn, accessToken);

    return NextResponse.redirect(`${origin}/dashboard?linkedin_success=connected`);
  } catch (err) {
    logger.error({ err }, 'LinkedIn token exchange failed');
    return NextResponse.redirect(`${origin}/dashboard?linkedin_error=${encodeURIComponent((err instanceof Error && err.message) || 'token_exchange_failed')}`);
  }
}
