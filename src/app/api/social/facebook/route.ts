import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiWrapper } from '@/backend/middlewares/apiWrapper';
import { requireAuth, requireWorkspaceAccess } from '@/backend/middlewares/auth';
import { createOAuthState } from '@/backend/utils/oauthState';
import { FacebookPublisherService } from '@/backend/services/social/FacebookPublisherService';
import { redactConnection } from '@/backend/services/social/redact';

const postSchema = z.object({
  workspaceId: z.string().uuid(),
  action: z.enum(['disconnect', 'connect_page', 'publish']),
  pageId: z.string().optional(),
  pageName: z.string().optional(),
  pageCategory: z.string().optional(),
  accessToken: z.string().optional(),
  userAccessToken: z.string().optional(),
  caption: z.string().max(5000).optional(),
  videoUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  imageBase64: z.string().optional(),
});

export const GET = withApiWrapper(async (request: NextRequest) => {
  const user = await requireAuth();
  const { searchParams } = request.nextUrl;
  const workspaceId = searchParams.get('workspaceId');
  const action = searchParams.get('action');

  if (!workspaceId) {
    return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
  }
  await requireWorkspaceAccess(user.id, workspaceId);

  if (action === 'get_auth_url') {
    const state = await createOAuthState('facebook', workspaceId);
    const redirectUri = `${request.nextUrl.origin}/api/social/callback/facebook`;
    const authUrl = FacebookPublisherService.getAuthUrl(state, redirectUri);
    return NextResponse.json({ authUrl });
  }

  const connection = await FacebookPublisherService.getConnection(workspaceId);
  return NextResponse.json({ connection: redactConnection(connection) });
});

export const POST = withApiWrapper(async (request: NextRequest) => {
  const user = await requireAuth();
  const body = postSchema.parse(await request.json());
  const { workspaceId, action } = body;

  await requireWorkspaceAccess(user.id, workspaceId);

  if (action === 'disconnect') {
    await FacebookPublisherService.disconnect(workspaceId);
    return NextResponse.json({ success: true });
  }

  if (action === 'connect_page') {
    // Called after OAuth when the user picks one of several managed pages
    if (!body.pageId || !body.accessToken || !body.userAccessToken) {
      return NextResponse.json({ error: 'pageId, accessToken, and userAccessToken are required' }, { status: 400 });
    }
    const connection = await FacebookPublisherService.saveConnection(
      workspaceId,
      body.pageId,
      body.pageName || 'Facebook Page',
      body.accessToken,
      body.pageCategory,
      body.userAccessToken
    );
    return NextResponse.json({ success: true, connection: redactConnection(connection) });
  }

  // publish
  if (!body.caption) {
    return NextResponse.json({ error: 'Missing caption for publishing' }, { status: 400 });
  }
  const result = body.videoUrl
    ? await FacebookPublisherService.publishVideo(workspaceId, body.caption, body.videoUrl)
    : await FacebookPublisherService.publishPost(workspaceId, body.caption, body.imageBase64 || body.imageUrl);
  return NextResponse.json(result);
});
