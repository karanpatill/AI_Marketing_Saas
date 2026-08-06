import { NextResponse } from 'next/server';
import { FacebookPublisherService } from '@/backend/services/social/FacebookPublisherService';
import { InstagramPublisherService } from '@/backend/services/social/InstagramPublisherService';

export async function GET(request: Request) {
  const protocol = request.headers.get('x-forwarded-proto') || (request.url.startsWith('https') ? 'https' : 'http');
  const host = request.headers.get('host') || 'localhost:3000';
  const origin = `${protocol}://${host}`;

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const workspaceId = searchParams.get('state');
  const error = searchParams.get('error');

  if (error || !code || !workspaceId) {
    console.error('[Instagram OAuth Callback Error]:', error || 'Missing code/state');
    return NextResponse.redirect(
      `${origin}/dashboard?instagram_error=${encodeURIComponent(error || 'connection_failed')}&settingsTab=integrations`
    );
  }

  try {
    const redirectUri = `${origin}/api/social/callback/instagram`;

    // 1. Exchange code for user access token (long-lived)
    const { userAccessToken } = await FacebookPublisherService.exchangeCodeForToken(code, redirectUri);

    // 2. Fetch Instagram accounts linked to this user's pages
    const igAccounts = await FacebookPublisherService.fetchInstagramAccounts(userAccessToken);

    if (igAccounts.length === 0) {
      // No IG accounts found — user probably doesn't have an IG Professional account linked to their FB page
      return NextResponse.redirect(
        `${origin}/dashboard?instagram_error=${encodeURIComponent('no_ig_accounts_found')}&settingsTab=integrations`
      );
    }

    if (igAccounts.length === 1) {
      // Auto-connect the only IG account
      const ig = igAccounts[0];
      await InstagramPublisherService.saveConnection(
        workspaceId,
        ig.handle,
        ig.id,
        ig.accessToken // This is the Facebook Page access token which has permission for the IG account
      );
      return NextResponse.redirect(
        `${origin}/dashboard?instagram_success=connected&settingsTab=integrations`
      );
    }

    // Pass them to the dashboard to let the user pick
    const igEncoded = encodeURIComponent(JSON.stringify(
      igAccounts.map(ig => ({ id: ig.id, handle: ig.handle, pageId: ig.pageId, pageName: ig.pageName, access_token: ig.accessToken }))
    ));
    return NextResponse.redirect(
      `${origin}/dashboard?instagram_accounts=${igEncoded}&instagram_user_token=${encodeURIComponent(userAccessToken)}&instagram_workspace=${workspaceId}&settingsTab=integrations`
    );
  } catch (err: any) {
    console.error('[Instagram Token Exchange Failed]:', err);
    return NextResponse.redirect(
      `${origin}/dashboard?instagram_error=${encodeURIComponent(err.message || 'token_exchange_failed')}&settingsTab=integrations`
    );
  }
}
