import { NextResponse } from 'next/server';
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
export async function GET(request: Request) {
  const protocol = request.headers.get('x-forwarded-proto') || (request.url.startsWith('https') ? 'https' : 'http');
  const host = request.headers.get('host') || 'localhost:3000';
  const origin = `${protocol}://${host}`;

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const workspaceId = searchParams.get('state');
  const error = searchParams.get('error');

  if (error || !code || !workspaceId) {
    console.error('[Facebook OAuth Callback Error]:', error || 'Missing code/state');
    return NextResponse.redirect(
      `${origin}/dashboard?facebook_error=${encodeURIComponent(error || 'connection_failed')}&settingsTab=integrations`
    );
  }

  try {
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
  } catch (err: any) {
    console.error('[Facebook Token Exchange Failed]:', err);
    return NextResponse.redirect(
      `${origin}/dashboard?facebook_error=${encodeURIComponent(err.message || 'token_exchange_failed')}&settingsTab=integrations`
    );
  }
}
