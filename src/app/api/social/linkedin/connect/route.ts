import { NextResponse } from 'next/server';
import { LinkedInPublisherService } from '@/backend/services/social/LinkedInPublisherService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || 'default_ws';
    const origin = new URL(request.url).origin;
    const redirectUri = `${origin}/api/social/callback/linkedin`;

    const authUrl = LinkedInPublisherService.getAuthUrl(workspaceId, redirectUri);

    // Direct HTTP 302 Redirect to LinkedIn OAuth Authorization Page
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('[LinkedIn Connect Error]:', error);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/dashboard?linkedin_error=${encodeURIComponent(error.message || 'auth_url_failed')}`);
  }
}
