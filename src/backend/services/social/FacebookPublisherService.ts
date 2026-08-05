import { createAdminClient } from '@/lib/supabaseServer';

export interface FacebookConnection {
  pageId: string;
  pageName: string;
  pageCategory?: string;
  accessToken: string; // The long-lived page access token
  userAccessToken?: string; // User-level token (used to get page token)
  isConnected: boolean;
  connectedAt?: string;
}

export interface FacebookPublishResult {
  success: boolean;
  postId?: string;
  permalink?: string;
  error?: string;
}

export interface FacebookPage {
  id: string;
  name: string;
  category: string;
  access_token: string;
}

export class FacebookPublisherService {
  /**
   * Generates Facebook OAuth Authorization URL
   */
  public static getAuthUrl(workspaceId: string, redirectUri: string): string {
    const appId = process.env.FACEBOOK_APP_ID;
    if (!appId) {
      throw new Error("FACEBOOK_APP_ID is not configured in .env.local");
    }

    const scopes = 'pages_show_list,pages_read_engagement,pages_manage_posts,publish_to_groups';
    const state = encodeURIComponent(workspaceId);

    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${state}&response_type=code`;
  }

  /**
   * Exchange OAuth code for user access token, then exchange for long-lived token
   */
  public static async exchangeCodeForToken(code: string, redirectUri: string): Promise<{ userAccessToken: string }> {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) {
      throw new Error("Facebook App credentials are missing in environment.");
    }

    // Exchange code for short-lived user access token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`
    );
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error?.message || 'Failed to exchange code for Facebook token');
    }

    const shortToken = tokenData.access_token;

    // Exchange for long-lived user access token (60 days)
    const longRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`
    );
    const longData = await longRes.json();
    const userAccessToken = longData.access_token || shortToken;

    return { userAccessToken };
  }

  /**
   * Fetches all Pages managed by the user (using their user access token)
   */
  public static async fetchUserPages(userAccessToken: string): Promise<FacebookPage[]> {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,category,access_token&access_token=${userAccessToken}`
      );
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        return data.data as FacebookPage[];
      }
    } catch (err) {
      console.error('[Facebook fetchUserPages error]:', err);
    }
    return [];
  }

  /**
   * Fetches the saved Facebook connection for a SPECIFIC workspace only.
   * NO cross-workspace fallback — each user/workspace has its own connection.
   */
  public static async getConnection(workspaceId?: string): Promise<FacebookConnection | null> {
    if (!workspaceId || workspaceId === "00000000-0000-0000-0000-000000000000") {
      return null;
    }

    const supabase = createAdminClient();

    try {
      const { data: ws } = await supabase
        .from('workspaces')
        .select('settings_json')
        .eq('id', workspaceId)
        .single();

      const conn = ws?.settings_json?.socials?.facebook;
      if (conn?.isConnected) {
        return conn as FacebookConnection;
      }
    } catch (err) {
      console.error("[FacebookPublisherService.getConnection]:", err);
    }

    return null;
  }

  /**
   * Saves Facebook connection credentials ONLY to the specified workspace.
   * Never touches other users' workspaces.
   */
  public static async saveConnection(
    workspaceId: string,
    pageId: string,
    pageName: string,
    accessToken: string,
    pageCategory?: string,
    userAccessToken?: string
  ): Promise<FacebookConnection> {
    const supabase = createAdminClient();

    const facebookConfig: FacebookConnection = {
      pageId,
      pageName,
      pageCategory,
      accessToken,
      userAccessToken,
      isConnected: true,
      connectedAt: new Date().toISOString()
    };

    try {
      const { data: ws } = await supabase
        .from('workspaces')
        .select('settings_json')
        .eq('id', workspaceId)
        .single();

      const existingSettings = ws?.settings_json || {};
      const updatedSettings = {
        ...existingSettings,
        socials: {
          ...(existingSettings.socials || {}),
          facebook: facebookConfig
        }
      };

      await supabase
        .from('workspaces')
        .update({ settings_json: updatedSettings })
        .eq('id', workspaceId);
    } catch (err) {
      console.error("[FacebookPublisherService.saveConnection Error]:", err);
    }

    return facebookConfig;
  }

  /**
   * Disconnects Facebook from a specific workspace only.
   */
  public static async disconnect(workspaceId: string): Promise<void> {
    const supabase = createAdminClient();
    try {
      const { data: ws } = await supabase
        .from('workspaces')
        .select('settings_json')
        .eq('id', workspaceId)
        .single();

      const existingSettings = ws?.settings_json || {};
      const updatedSettings = {
        ...existingSettings,
        socials: {
          ...(existingSettings.socials || {}),
          facebook: { isConnected: false }
        }
      };
      await supabase.from('workspaces').update({ settings_json: updatedSettings }).eq('id', workspaceId);
    } catch (err) {
      console.error("[Facebook disconnect error]:", err);
    }
  }

  /**
   * Publishes a post with optional image to Facebook Page
   */
  public static async publishPost(
    workspaceId: string,
    caption: string,
    imageBase64?: string
  ): Promise<FacebookPublishResult> {
    const connection = await this.getConnection(workspaceId);

    if (!connection || !connection.isConnected || !connection.accessToken || !connection.pageId) {
      return {
        success: false,
        error: "Facebook Page not connected for this workspace."
      };
    }

    try {
      let endpoint = `https://graph.facebook.com/v19.0/${connection.pageId}/feed`;
      let formData = new FormData();
      formData.append('message', caption);
      formData.append('access_token', connection.accessToken);

      if (imageBase64) {
        endpoint = `https://graph.facebook.com/v19.0/${connection.pageId}/photos`;
        const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
        const imageBuffer = Buffer.from(cleanBase64, 'base64');
        const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
        formData.append('source', blob, 'image.jpeg');
      }

      const res = await fetch(endpoint, { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error?.message || "Failed to publish post to Facebook." };
      }

      const postId = data.post_id || data.id;
      return {
        success: true,
        postId,
        permalink: `https://facebook.com/${postId}`
      };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error while publishing to Facebook." };
    }
  }
}
