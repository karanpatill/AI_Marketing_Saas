import { NextResponse } from 'next/server';
import { LinkedInPublisherService } from '@/backend/services/social/LinkedInPublisherService';

export async function GET(request: Request) {
  const protocol = request.headers.get('x-forwarded-proto') || (request.url.startsWith('https') ? 'https' : 'http');
  const host = request.headers.get('host') || 'localhost:3000';
  const origin = `${protocol}://${host}`;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const workspaceId = searchParams.get('state');
  const error = searchParams.get('error');

  if (error || !code || !workspaceId) {
    console.error('[LinkedIn OAuth Callback Error]:', error || 'Missing code/state');
    return NextResponse.redirect(`${origin}/dashboard?linkedin_error=${encodeURIComponent(error || 'connection_failed')}`);
  }

  try {
    const redirectUri = `${origin}/api/social/callback/linkedin`;
    const { accessToken, memberUrn, name } = await LinkedInPublisherService.exchangeCodeForToken(code, redirectUri);

    await LinkedInPublisherService.saveConnection(
      workspaceId,
      name,
      memberUrn,
      accessToken
    );

    return NextResponse.redirect(`${origin}/dashboard?linkedin_success=connected`);
  } catch (err: any) {
    console.error('[LinkedIn Token Exchange Failed]:', err);
    return NextResponse.redirect(`${origin}/dashboard?linkedin_error=${encodeURIComponent(err.message || 'token_exchange_failed')}`);
  }
}
