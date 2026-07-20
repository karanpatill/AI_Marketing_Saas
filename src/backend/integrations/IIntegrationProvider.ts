export interface PublishPayload {
  content: string;
  mediaUrls?: string[];
  scheduledTime?: Date;
  metadata?: Record<string, any>;
}

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  platformPostUrl?: string;
  error?: string;
  rateLimited?: boolean;
}

export interface IntegrationHealth {
  status: 'healthy' | 'degraded' | 'expired' | 'error';
  message?: string;
}

export interface IIntegrationProvider {
  readonly providerName: string;

  /**
   * Generates the OAuth authorization URL for the user to connect their account.
   */
  getAuthorizationUrl(workspaceId: string, redirectUri: string): string;

  /**
   * Exchanges the OAuth code for access and refresh tokens.
   */
  handleCallback(code: string, redirectUri: string): Promise<{ accessToken: string, refreshToken?: string, accountId: string, accountName: string, expiresAt?: Date }>;

  /**
   * Validates if the current token is still valid.
   */
  checkHealth(accessToken: string): Promise<IntegrationHealth>;

  /**
   * Refreshes the OAuth token if expired.
   */
  refreshToken(refreshToken: string): Promise<{ accessToken: string, newRefreshToken?: string, expiresAt?: Date }>;

  /**
   * Publishes content directly to the external platform.
   */
  publish(accessToken: string, payload: PublishPayload): Promise<PublishResult>;
}
