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

    const connection = await FacebookPublisherService.getConnection(workspaceId);
    return NextResponse.json({ connection });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, workspaceId, caption, pageId, pageName, accessToken } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
    }

    if (action === 'connect_manual') {
      const connection = await FacebookPublisherService.saveConnection(
        workspaceId,
        pageId,
        pageName || 'Facebook Page',
        accessToken
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
