import { createAdminClient } from '@/lib/supabaseServer';

export interface FacebookConnection {
  pageId: string;
  pageName: string;
  accessToken: string; // The long-lived page access token
  isConnected: boolean;
  connectedAt?: string;
}

export interface FacebookPublishResult {
  success: boolean;
  postId?: string;
  permalink?: string;
  error?: string;
}

export class FacebookPublisherService {
  /**
   * Fetches the saved Facebook connection for a workspace (with fallback to latest workspace)
   */
  public static async getConnection(workspaceId?: string): Promise<FacebookConnection | null> {
    const supabase = createAdminClient();

    try {
      if (workspaceId && workspaceId !== "00000000-0000-0000-0000-000000000000") {
        const { data: ws } = await supabase
          .from('workspaces')
          .select('settings_json')
          .eq('id', workspaceId)
          .single();

        if (ws?.settings_json?.socials?.facebook) {
          return ws.settings_json.socials.facebook;
        }
      }

      // Fallback
      const { data: latestWs } = await supabase
        .from('workspaces')
        .select('settings_json')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latestWs?.settings_json?.socials?.facebook) {
        return latestWs.settings_json.socials.facebook;
      }

      const { data: anyWs } = await supabase.from('workspaces').select('settings_json');
      if (anyWs) {
        for (const w of anyWs) {
          if (w.settings_json?.socials?.facebook?.isConnected) {
            return w.settings_json.socials.facebook;
          }
        }
      }
    } catch (err) {
      console.error("[FacebookPublisherService.getConnection]:", err);
    }

    return null;
  }

  /**
   * Saves or updates Facebook connection credentials across workspace settings
   */
  public static async saveConnection(
    workspaceId: string,
    pageId: string,
    pageName: string,
    accessToken: string
  ): Promise<FacebookConnection> {
    const supabase = createAdminClient();

    const facebookConfig: FacebookConnection = {
      pageId,
      pageName,
      accessToken,
      isConnected: true,
      connectedAt: new Date().toISOString()
    };

    try {
      const { data: allWorkspaces } = await supabase.from('workspaces').select('id, settings_json');
      if (allWorkspaces && allWorkspaces.length > 0) {
        for (const wsItem of allWorkspaces) {
          const existingSettings = wsItem.settings_json || {};
          const existingSocials = existingSettings.socials || {};
          const updatedSettings = {
            ...existingSettings,
            socials: {
              ...existingSocials,
              facebook: facebookConfig
            }
          };
          await supabase.from('workspaces').update({ settings_json: updatedSettings }).eq('id', wsItem.id);
        }
      }
    } catch (err) {
      console.error("[FacebookPublisherService.saveConnection Error]:", err);
    }

    return facebookConfig;
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

      // Upload image to Facebook Page if provided
      if (imageBase64) {
        endpoint = `https://graph.facebook.com/v19.0/${connection.pageId}/photos`;
        const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
        const imageBuffer = Buffer.from(cleanBase64, 'base64');
        const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
        
        formData.append('source', blob, 'image.jpeg');
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: data.error?.message || "Failed to publish post to Facebook."
        };
      }

      // data.post_id is returned for photos, data.id for text posts
      const postId = data.post_id || data.id;

      return {
        success: true,
        postId: postId,
        permalink: `https://facebook.com/${postId}` // Approximate permalink
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Network error while publishing to Facebook."
      };
    }
  }
}
