import { NextResponse } from 'next/server';
import { LinkedInPublisherService } from '@/backend/services/social/LinkedInPublisherService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const action = searchParams.get('action');

    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
    }

    if (action === 'get_auth_url') {
      const origin = new URL(request.url).origin;
      const redirectUri = `${origin}/api/social/callback/linkedin`;
      const authUrl = LinkedInPublisherService.getAuthUrl(workspaceId, redirectUri);
      return NextResponse.json({ authUrl });
    }

    const connection = await LinkedInPublisherService.getConnection(workspaceId);
    return NextResponse.json({ connection });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, workspaceId, caption, imageUrl, accountHandle, memberUrn, accessToken } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
    }

    if (action === 'set_org_id') {
      const { organizationId } = body;
      const success = await LinkedInPublisherService.setOrganizationId(workspaceId, organizationId || '');
      return NextResponse.json({ success });
    }

    if (action === 'connect_manual') {
      const connection = await LinkedInPublisherService.saveConnection(
        workspaceId,
        accountHandle || '@linkedin_user',
        memberUrn || `urn:li:person:manual_${Date.now()}`,
        accessToken || `li_access_${Date.now()}`
      );
      return NextResponse.json({ success: true, connection });
    }

    if (action === 'publish') {
      if (!caption) {
        return NextResponse.json({ error: 'Missing caption for publishing' }, { status: 400 });
      }

      const result = await LinkedInPublisherService.publishPost(
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
