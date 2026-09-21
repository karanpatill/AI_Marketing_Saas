/**
 * Strips credential fields from a social connection before it is returned to the browser.
 * The UI only needs identity/status fields; tokens stay server-side.
 */
export function redactConnection<T extends object | null | undefined>(connection: T): T {
  if (!connection) return connection;
  const { accessToken, userAccessToken, refreshToken, ...safe } = connection as Record<string, unknown>;
  void accessToken; void userAccessToken; void refreshToken;
  return safe as T;
}
