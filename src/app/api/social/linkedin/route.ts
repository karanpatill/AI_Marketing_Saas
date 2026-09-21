import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiWrapper } from '@/backend/middlewares/apiWrapper';
import { requireAuth, requireWorkspaceAccess } from '@/backend/middlewares/auth';
import { createOAuthState } from '@/backend/utils/oauthState';
import { LinkedInPublisherService } from '@/backend/services/social/LinkedInPublisherService';
import { redactConnection } from '@/backend/services/social/redact';

const postSchema = z.object({
  workspaceId: z.string().uuid(),
  action: z.enum(['disconnect', 'set_org_id', 'publish']),
  organizationId: z.string().optional(),
  caption: z.string().max(3000).optional(),
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
    const state = await createOAuthState('linkedin', workspaceId);
    const redirectUri = `${request.nextUrl.origin}/api/social/callback/linkedin`;
    const authUrl = LinkedInPublisherService.getAuthUrl(state, redirectUri);
    return NextResponse.json({ authUrl });
  }

  const connection = await LinkedInPublisherService.getConnection(workspaceId);
  return NextResponse.json({ connection: redactConnection(connection) });
});

export const POST = withApiWrapper(async (request: NextRequest) => {
  const user = await requireAuth();
  const body = postSchema.parse(await request.json());
  const { workspaceId, action } = body;

  await requireWorkspaceAccess(user.id, workspaceId);

  if (action === 'disconnect') {
    await LinkedInPublisherService.disconnect(workspaceId);
    return NextResponse.json({ success: true });
  }

  if (action === 'set_org_id') {
    const success = await LinkedInPublisherService.setOrganizationId(workspaceId, body.organizationId || '');
    return NextResponse.json({ success });
  }

  // publish
  if (!body.caption) {
    return NextResponse.json({ error: 'Missing caption for publishing' }, { status: 400 });
  }
  const result = body.videoUrl
    ? await LinkedInPublisherService.publishVideo(workspaceId, body.caption, body.videoUrl)
    : await LinkedInPublisherService.publishPost(workspaceId, body.caption, body.imageBase64 || body.imageUrl);
  return NextResponse.json(result);
});
