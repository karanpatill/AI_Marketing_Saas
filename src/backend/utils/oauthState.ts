import { cookies } from 'next/headers';
import { ForbiddenError } from './errors';

type OAuthProvider = 'linkedin' | 'facebook' | 'instagram';

const COOKIE_PREFIX = 'oauth_state_';
const MAX_AGE_SECONDS = 10 * 60;

/**
 * Creates a one-time OAuth `state` nonce bound to a workspace and stores it in an
 * httpOnly cookie. The nonce (not the workspace id) is what gets sent to the provider,
 * so a callback can only bind an account to the workspace the initiating user chose.
 */
export async function createOAuthState(provider: OAuthProvider, workspaceId: string): Promise<string> {
  const nonce = crypto.randomUUID();
  const cookieStore = await cookies();

  cookieStore.set(`${COOKIE_PREFIX}${provider}`, JSON.stringify({ nonce, workspaceId }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/social',
    maxAge: MAX_AGE_SECONDS,
  });

  return nonce;
}

/**
 * Validates the `state` returned by the provider against the stored cookie and
 * returns the workspace id it was bound to. The cookie is cleared either way.
 */
export async function consumeOAuthState(provider: OAuthProvider, state: string | null): Promise<string> {
  const cookieStore = await cookies();
  const name = `${COOKIE_PREFIX}${provider}`;
  const raw = cookieStore.get(name)?.value;
  cookieStore.delete(name);

  if (!raw || !state) {
    throw new ForbiddenError('OAuth state missing or expired. Please try connecting again.');
  }

  let parsed: { nonce?: string; workspaceId?: string };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ForbiddenError('OAuth state is malformed.');
  }

  if (!parsed.nonce || !parsed.workspaceId || parsed.nonce !== state) {
    throw new ForbiddenError('OAuth state mismatch.');
  }

  return parsed.workspaceId;
}
