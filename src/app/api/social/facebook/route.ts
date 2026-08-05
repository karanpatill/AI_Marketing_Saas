import { NextResponse } from 'next/server';
import { FacebookPublisherService } from '@/backend/services/social/FacebookPublisherService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const action = searchParams.get('action');

    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
    }

    if (action === 'get_auth_url') {
      const protocol = request.headers.get('x-forwarded-proto') || (request.url.startsWith('https') ? 'https' : 'http');
      const host = request.headers.get('host') || 'localhost:3000';
      const origin = `${protocol}://${host}`;
      const redirectUri = `${origin}/api/social/callback/facebook`;
      const authUrl = FacebookPublisherService.getAuthUrl(workspaceId, redirectUri);
      return NextResponse.json({ authUrl });
    }

    const connection = await FacebookPublisherService.getConnection(workspaceId);
    return NextResponse.json({ connection });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, workspaceId, caption, pageId, pageName, pageCategory, accessToken } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
    }

    if (action === 'disconnect') {
      await FacebookPublisherService.disconnect(workspaceId);
      return NextResponse.json({ success: true });
    }

    if (action === 'connect_manual') {
      if (!pageId || !accessToken) {
        return NextResponse.json({ error: 'pageId and accessToken are required' }, { status: 400 });
      }
      const connection = await FacebookPublisherService.saveConnection(
        workspaceId,
        pageId,
        pageName || 'Facebook Page',
        accessToken,
        pageCategory
      );
      return NextResponse.json({ success: true, connection });
    }

    if (action === 'connect_page') {
      // Called after OAuth when user picks a page from their managed pages list
      const { userAccessToken } = body;
      if (!pageId || !accessToken || !userAccessToken) {
        return NextResponse.json({ error: 'pageId, accessToken, and userAccessToken are required' }, { status: 400 });
      }
      const connection = await FacebookPublisherService.saveConnection(
        workspaceId,
        pageId,
        pageName || 'Facebook Page',
        accessToken,
        pageCategory,
        userAccessToken
      );
      return NextResponse.json({ success: true, connection });
    }

    if (action === 'publish') {
      if (!caption) {
        return NextResponse.json({ error: 'Missing caption for publishing' }, { status: 400 });
      }
      const result = await FacebookPublisherService.publishPost(
        workspaceId,
        caption,
        body.imageBase64 || body.imageUrl
      );
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
