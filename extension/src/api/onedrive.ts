/**
 * Living Nexus Archive - Microsoft OneDrive API Integration
 */

import type { CloudFile, AuthToken } from '../types';

const ONEDRIVE_API_BASE = 'https://graph.microsoft.com/v1.0';
const MICROSOFT_AUTH_ENDPOINT = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const MICROSOFT_TOKEN_ENDPOINT = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

export class OneDriveAPI {
  private accessToken: string | null = null;
  private clientId: string = 'YOUR_MICROSOFT_CLIENT_ID'; // Will be configured

  /**
   * Authenticate with Microsoft OneDrive using OAuth 2.0
   */
  async authenticate(): Promise<AuthToken> {
    const redirectUri = chrome.identity.getRedirectURL();
    
    const authUrl = new URL(MICROSOFT_AUTH_ENDPOINT);
    authUrl.searchParams.append('client_id', this.clientId);
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', 'Files.Read.All offline_access');

    return new Promise((resolve, reject) => {
      chrome.identity.launchWebAuthFlow(
        {
          url: authUrl.toString(),
          interactive: true
        },
        (responseUrl) => {
          if (chrome.runtime.lastError || !responseUrl) {
            reject(new Error(chrome.runtime.lastError?.message || 'Authentication failed'));
            return;
          }

          // Parse access token from URL fragment
          const params = new URLSearchParams(responseUrl.split('#')[1]);
          const accessToken = params.get('access_token');
          const expiresIn = parseInt(params.get('expires_in') || '3600');

          if (!accessToken) {
            reject(new Error('No access token received'));
            return;
          }

          this.accessToken = accessToken;

          resolve({
            provider: 'onedrive',
            accessToken,
            expiresAt: Date.now() + expiresIn * 1000
          });
        }
      );
    });
  }

  /**
   * Get all files from OneDrive
   */
  async getAllFiles(): Promise<CloudFile[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }

    const files: CloudFile[] = [];
    let nextLink: string | undefined = `${ONEDRIVE_API_BASE}/me/drive/root/children`;

    do {
      const response = await this.fetchFiles(nextLink);
      files.push(...response.files);
      nextLink = response.nextLink;
    } while (nextLink);

    return files;
  }

  /**
   * Fetch a page of files from OneDrive
   */
  private async fetchFiles(url: string): Promise<{ files: CloudFile[]; nextLink?: string }> {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`OneDrive API error: ${response.statusText}`);
    }

    const data = await response.json();

    const files: CloudFile[] = data.value.map((item: any) => ({
      id: item.id,
      name: item.name,
      mimeType: item.file?.mimeType || 'application/vnd.ms-folder',
      size: item.size || 0,
      createdTime: item.createdDateTime,
      modifiedTime: item.lastModifiedDateTime,
      webViewLink: item.webUrl,
      thumbnailLink: item.thumbnails?.[0]?.large?.url,
      parents: item.parentReference ? [item.parentReference.id] : [],
      path: item.parentReference?.path || '',
      provider: 'onedrive' as const
    }));

    return {
      files,
      nextLink: data['@odata.nextLink']
    };
  }

  /**
   * Download a file from OneDrive
   */
  async downloadFile(fileId: string): Promise<Blob> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    // Get download URL
    const metadataResponse = await fetch(
      `${ONEDRIVE_API_BASE}/me/drive/items/${fileId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );

    if (!metadataResponse.ok) {
      throw new Error(`Failed to get file metadata: ${metadataResponse.statusText}`);
    }

    const metadata = await metadataResponse.json();
    const downloadUrl = metadata['@microsoft.graph.downloadUrl'];

    if (!downloadUrl) {
      throw new Error('No download URL available');
    }

    // Download file
    const fileResponse = await fetch(downloadUrl);

    if (!fileResponse.ok) {
      throw new Error(`Failed to download file: ${fileResponse.statusText}`);
    }

    return await fileResponse.blob();
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<CloudFile> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${ONEDRIVE_API_BASE}/me/drive/items/${fileId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get file metadata: ${response.statusText}`);
    }

    const item = await response.json();

    return {
      id: item.id,
      name: item.name,
      mimeType: item.file?.mimeType || 'application/vnd.ms-folder',
      size: item.size || 0,
      createdTime: item.createdDateTime,
      modifiedTime: item.lastModifiedDateTime,
      webViewLink: item.webUrl,
      thumbnailLink: item.thumbnails?.[0]?.large?.url,
      parents: item.parentReference ? [item.parentReference.id] : [],
      path: item.parentReference?.path || '',
      provider: 'onedrive'
    };
  }

  /**
   * Recursively get all files including nested folders
   */
  async getAllFilesRecursive(folderId: string = 'root', basePath: string = ''): Promise<CloudFile[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const files: CloudFile[] = [];
    const url = `${ONEDRIVE_API_BASE}/me/drive/items/${folderId}/children`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`OneDrive API error: ${response.statusText}`);
    }

    const data = await response.json();

    for (const item of data.value) {
      const file: CloudFile = {
        id: item.id,
        name: item.name,
        mimeType: item.file?.mimeType || 'application/vnd.ms-folder',
        size: item.size || 0,
        createdTime: item.createdDateTime,
        modifiedTime: item.lastModifiedDateTime,
        webViewLink: item.webUrl,
        thumbnailLink: item.thumbnails?.[0]?.large?.url,
        parents: [folderId],
        path: basePath ? `${basePath}/${item.name}` : item.name,
        provider: 'onedrive'
      };

      files.push(file);

      // If it's a folder, recursively get its contents
      if (item.folder) {
        const subFiles = await this.getAllFilesRecursive(item.id, file.path);
        files.push(...subFiles);
      }
    }

    return files;
  }

  /**
   * Clear authentication
   */
  clearAuth(): void {
    this.accessToken = null;
  }
}

// Export singleton instance
export const oneDriveAPI = new OneDriveAPI();

