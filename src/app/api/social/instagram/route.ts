import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiWrapper } from '@/backend/middlewares/apiWrapper';
import { requireAuth, requireWorkspaceAccess } from '@/backend/middlewares/auth';
import { InstagramPublisherService } from '@/backend/services/social/InstagramPublisherService';
import { redactConnection } from '@/backend/services/social/redact';

const postSchema = z.object({
  workspaceId: z.string().uuid(),
  action: z.enum(['connect', 'publish']),
  accountHandle: z.string().optional(),
  instagramAccountId: z.string().optional(),
  accessToken: z.string().optional(),
  imageUrl: z.string().url().optional(),
  caption: z.string().max(2200).optional(),
});

export const GET = withApiWrapper(async (request: NextRequest) => {
  const user = await requireAuth();
  const workspaceId = request.nextUrl.searchParams.get('workspaceId');

  if (!workspaceId) {
    return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
  }
  await requireWorkspaceAccess(user.id, workspaceId);

  const connection = await InstagramPublisherService.getConnection(workspaceId);
  return NextResponse.json({ connection: redactConnection(connection) });
});

export const POST = withApiWrapper(async (request: NextRequest) => {
  const user = await requireAuth();
  const body = postSchema.parse(await request.json());
  const { workspaceId, action } = body;

  await requireWorkspaceAccess(user.id, workspaceId);

  if (action === 'connect') {
    // Called after OAuth when the user picks one of several IG accounts
    if (!body.accountHandle || !body.instagramAccountId || !body.accessToken) {
      return NextResponse.json({ error: 'Missing account credentials' }, { status: 400 });
    }
    const formattedHandle = body.accountHandle.startsWith('@') ? body.accountHandle : `@${body.accountHandle}`;
    const connection = await InstagramPublisherService.saveConnection(
      workspaceId,
      formattedHandle,
      body.instagramAccountId,
      body.accessToken
    );
    return NextResponse.json({
      success: true,
      connection: redactConnection(connection),
      message: `Successfully connected ${formattedHandle} via Meta OAuth`,
    });
  }

  // publish
  if (!body.imageUrl || !body.caption) {
    return NextResponse.json({ error: 'Missing imageUrl or caption for publishing' }, { status: 400 });
  }
  const result = await InstagramPublisherService.publishSinglePost(workspaceId, body.imageUrl, body.caption);
  return NextResponse.json(result);
});
