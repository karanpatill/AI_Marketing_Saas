import { NextResponse } from 'next/server';
import { FacebookPublisherService } from '@/backend/services/social/FacebookPublisherService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId');

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
  }

  const protocol = request.headers.get('x-forwarded-proto') || (request.url.startsWith('https') ? 'https' : 'http');
  const host = request.headers.get('host') || 'localhost:3000';
  const redirectUri = `${protocol}://${host}/api/social/callback/instagram`;

  const url = FacebookPublisherService.getInstagramAuthUrl(workspaceId, redirectUri);
  return NextResponse.redirect(url);
}
