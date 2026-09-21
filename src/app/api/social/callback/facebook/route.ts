import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireWorkspaceAccess } from '@/backend/middlewares/auth';
import { consumeOAuthState } from '@/backend/utils/oauthState';
import { logger } from '@/backend/utils/logger';
import { FacebookPublisherService } from '@/backend/services/social/FacebookPublisherService';

/**
 * GET /api/social/callback/facebook
 *
 * Facebook OAuth callback. After the user authorizes the app:
 * 1. Exchanges code for long-lived user access token
 * 2. Fetches managed Pages
 * 3. If user manages exactly 1 page → auto-connects it
 * 4. If multiple pages → redirects to dashboard with page list for user to pick
 */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error || !code || !state) {
    logger.warn({ error }, 'Facebook OAuth Callback Error');
    return NextResponse.redirect(
      `${origin}/dashboard?facebook_error=${encodeURIComponent(error || 'connection_failed')}&settingsTab=integrations`
    );
  }

  try {
    // The callback must come from the same signed-in user that started the flow,
    // and the state nonce must match the cookie we set for their chosen workspace.
    const user = await requireAuth();
    const workspaceId = await consumeOAuthState('facebook', state);
    await requireWorkspaceAccess(user.id, workspaceId);

    const redirectUri = `${origin}/api/social/callback/facebook`;

    // 1. Exchange code for user access token (long-lived)
    const { userAccessToken } = await FacebookPublisherService.exchangeCodeForToken(code, redirectUri);

    // 2. Fetch pages managed by this user
    const pages = await FacebookPublisherService.fetchUserPages(userAccessToken);

    if (pages.length === 0) {
      // No pages found — user probably doesn't manage any Facebook Page
      return NextResponse.redirect(
        `${origin}/dashboard?facebook_error=${encodeURIComponent('no_pages_found')}&settingsTab=integrations`
      );
    }

    if (pages.length === 1) {
      // Auto-connect the only page
      const page = pages[0];
      await FacebookPublisherService.saveConnection(
        workspaceId,
        page.id,
        page.name,
        page.access_token, // Page-level access token (permanent)
        page.category,
        userAccessToken
      );
      return NextResponse.redirect(
        `${origin}/dashboard?facebook_success=connected&settingsTab=integrations`
      );
    }

    // Multiple pages — pass them to the dashboard to let the user pick
    const pagesEncoded = encodeURIComponent(JSON.stringify(
      pages.map(p => ({ id: p.id, name: p.name, category: p.category, access_token: p.access_token }))
    ));
    return NextResponse.redirect(
      `${origin}/dashboard?facebook_pages=${pagesEncoded}&facebook_user_token=${encodeURIComponent(userAccessToken)}&facebook_workspace=${workspaceId}&settingsTab=integrations`
    );
  } catch (err) {
    logger.error({ err }, 'Facebook Token Exchange Failed');
    return NextResponse.redirect(
      `${origin}/dashboard?facebook_error=${encodeURIComponent((err instanceof Error && err.message) || 'token_exchange_failed')}&settingsTab=integrations`
    );
  }
}
