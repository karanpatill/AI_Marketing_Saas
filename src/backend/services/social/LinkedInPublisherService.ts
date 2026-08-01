import { createAdminClient } from '@/lib/supabaseServer';

export interface LinkedInConnection {
  linkedinUrn: string;
  accountHandle: string;
  accessToken: string;
  isConnected: boolean;
  connectedAt?: string;
}

export interface PublishResult {
  success: boolean;
  postId?: string;
  permalink?: string;
  error?: string;
  isSandbox?: boolean;
}

export class LinkedInPublisherService {
  /**
   * Generates LinkedIn OAuth Authorization URL
   */
  public static getAuthUrl(workspaceId: string, redirectUri: string): string {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    if (!clientId) {
      throw new Error("LINKEDIN_CLIENT_ID is not configured in .env.local");
    }

    const scopes = encodeURIComponent('openid profile email w_member_social');
    const state = encodeURIComponent(workspaceId);

    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scopes}`;
  }

  /**
   * Exchanges Authorization Code for LinkedIn Access Token and Member Profile
   */
  public static async exchangeCodeForToken(code: string, redirectUri: string): Promise<{ accessToken: string; memberUrn: string; name: string }> {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("LinkedIn Client credentials are missing in environment.");
    }

    // 1. Token Exchange
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('redirect_uri', redirectUri);

    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.message || 'Failed to exchange authorization code for token');
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch User Profile Info (OpenID Connect userinfo)
    const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const userData = await userRes.json();
    const memberUrn = userData.sub ? `urn:li:person:${userData.sub}` : '';
    const name = userData.name || userData.given_name || 'LinkedIn User';

    return {
      accessToken,
      memberUrn,
      name
    };
  }

  /**
   * Fetches the saved LinkedIn connection for a workspace (with fallback to latest workspace)
   */
  public static async getConnection(workspaceId?: string): Promise<LinkedInConnection | null> {
    const supabase = createAdminClient();

    try {
      if (workspaceId && workspaceId !== "00000000-0000-0000-0000-000000000000") {
        const { data: ws } = await supabase
          .from('workspaces')
          .select('settings_json')
          .eq('id', workspaceId)
          .single();

        if (ws?.settings_json?.socials?.linkedin) {
          return ws.settings_json.socials.linkedin;
        }
      }

      const { data: latestWs } = await supabase
        .from('workspaces')
        .select('settings_json')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latestWs?.settings_json?.socials?.linkedin) {
        return latestWs.settings_json.socials.linkedin;
      }

      const { data: anyWs } = await supabase.from('workspaces').select('settings_json');
      if (anyWs) {
        for (const w of anyWs) {
          if (w.settings_json?.socials?.linkedin?.isConnected) {
            return w.settings_json.socials.linkedin;
          }
        }
      }
    } catch (err) {
      console.error("[LinkedInPublisherService.getConnection]:", err);
    }

    return null;
  }

  /**
   * Saves or updates LinkedIn connection credentials across workspace settings
   */
  public static async saveConnection(
    workspaceId: string,
    accountHandle: string,
    linkedinUrn: string,
    accessToken: string
  ): Promise<LinkedInConnection> {
    const supabase = createAdminClient();

    const linkedinConfig: LinkedInConnection = {
      linkedinUrn,
      accountHandle: accountHandle.startsWith('@') ? accountHandle : `@${accountHandle}`,
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
              linkedin: linkedinConfig
            }
          };
          await supabase.from('workspaces').update({ settings_json: updatedSettings }).eq('id', wsItem.id);
        }
      }
    } catch (err) {
      console.error("[LinkedInPublisherService.saveConnection Error]:", err);
    }

    return linkedinConfig;
  }

  /**
   * Publishes a post to LinkedIn on behalf of the member URN
   */
  /**
   * Publishes a post with optional image to LinkedIn on behalf of the member URN
   */
  public static async publishPost(
    workspaceId: string,
    caption: string,
    imageBase64?: string
  ): Promise<PublishResult> {
    const connection = await this.getConnection(workspaceId);

    if (!connection || !connection.isConnected || !connection.accessToken) {
      return {
        success: false,
        error: "LinkedIn account not connected for this workspace."
      };
    }

    try {
      const authorUrn = connection.linkedinUrn;
      let mediaAssetUrn: string | null = null;

      // Upload image to LinkedIn Digital Media Asset if provided
      if (imageBase64) {
        try {
          const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
          const imageBuffer = Buffer.from(cleanBase64, 'base64');

          // 1. Register Upload Request
          const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${connection.accessToken}`,
              'Content-Type': 'application/json',
              'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify({
              registerUploadRequest: {
                recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                owner: authorUrn,
                serviceRelationships: [
                  {
                    relationshipType: 'OWNER',
                    identifier: 'urn:li:userGeneratedContent'
                  }
                ]
              }
            })
          });

          const registerData = await registerRes.json();
          if (registerRes.ok && registerData.value) {
            const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
            mediaAssetUrn = registerData.value.asset;

            // 2. Upload binary image buffer to LinkedIn upload URL
            await fetch(uploadUrl, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${connection.accessToken}`,
                'Content-Type': 'image/jpeg'
              },
              body: imageBuffer
            });
          }
        } catch (imgErr) {
          console.error("[LinkedIn Image Upload Warning]:", imgErr);
        }
      }

      // Build UGC Post payload
      const shareMediaCategory = mediaAssetUrn ? "IMAGE" : "NONE";
      const media = mediaAssetUrn
        ? [
            {
              status: "READY",
              description: { text: caption.substring(0, 200) },
              media: mediaAssetUrn,
              title: { text: "Generated Visual" }
            }
          ]
        : undefined;

      const postBody: any = {
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: caption
            },
            shareMediaCategory,
            ...(media ? { media } : {})
          }
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
      };

      const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${connection.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(postBody)
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: data.message || "Failed to publish post to LinkedIn."
        };
      }

      return {
        success: true,
        postId: data.id,
        permalink: `https://www.linkedin.com/feed/update/${data.id}`
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Network error while publishing to LinkedIn."
      };
    }
  }
}
