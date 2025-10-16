/**
 * Living Nexus Archive - Google Drive API Integration
 */

import type { CloudFile, AuthToken } from '../types';

const GOOGLE_DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

export class GoogleDriveAPI {
  private accessToken: string | null = null;

  /**
   * Authenticate with Google Drive using Chrome Identity API
   */
  async authenticate(): Promise<AuthToken> {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError || !token) {
          reject(new Error(chrome.runtime.lastError?.message || 'Authentication failed'));
          return;
        }

        this.accessToken = token;
        
        resolve({
          provider: 'google-drive',
          accessToken: token,
          expiresAt: Date.now() + 3600000 // 1 hour
        });
      });
    });
  }

  /**
   * Get all files from Google Drive
   */
  async getAllFiles(): Promise<CloudFile[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }

    const files: CloudFile[] = [];
    let pageToken: string | undefined;

    do {
      const response = await this.fetchFiles(pageToken);
      files.push(...response.files);
      pageToken = response.nextPageToken;
    } while (pageToken);

    return files;
  }

  /**
   * Fetch a page of files from Google Drive
   */
  private async fetchFiles(pageToken?: string): Promise<{ files: CloudFile[]; nextPageToken?: string }> {
    const params = new URLSearchParams({
      pageSize: '1000',
      fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, thumbnailLink, parents)',
      q: "trashed = false"
    });

    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    const response = await fetch(`${GOOGLE_DRIVE_API_BASE}/files?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Google Drive API error: ${response.statusText}`);
    }

    const data = await response.json();

    const files: CloudFile[] = data.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: parseInt(file.size || '0'),
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink,
      thumbnailLink: file.thumbnailLink,
      parents: file.parents,
      path: '', // Will be calculated later
      provider: 'google-drive' as const
    }));

    return {
      files,
      nextPageToken: data.nextPageToken
    };
  }

  /**
   * Download a file from Google Drive
   */
  async downloadFile(fileId: string): Promise<Blob> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${GOOGLE_DRIVE_API_BASE}/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    return await response.blob();
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<CloudFile> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${GOOGLE_DRIVE_API_BASE}/files/${fileId}?fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink,thumbnailLink,parents`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get file metadata: ${response.statusText}`);
    }

    const file = await response.json();

    return {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: parseInt(file.size || '0'),
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink,
      thumbnailLink: file.thumbnailLink,
      parents: file.parents,
      path: '',
      provider: 'google-drive'
    };
  }

  /**
   * Build full file paths by traversing parent folders
   */
  async buildFilePaths(files: CloudFile[]): Promise<CloudFile[]> {
    // Create a map of folder IDs to folder names
    const folderMap = new Map<string, string>();
    
    // First pass: collect all folders
    for (const file of files) {
      if (file.mimeType === 'application/vnd.google-apps.folder') {
        folderMap.set(file.id, file.name);
      }
    }

    // Second pass: build paths
    const buildPath = (file: CloudFile): string => {
      if (!file.parents || file.parents.length === 0) {
        return file.name;
      }

      const parentId = file.parents[0];
      const parentName = folderMap.get(parentId);

      if (!parentName) {
        return file.name;
      }

      // Recursively build path (simplified - doesn't handle deep nesting)
      return `${parentName}/${file.name}`;
    };

    return files.map(file => ({
      ...file,
      path: buildPath(file)
    }));
  }

  /**
   * Revoke authentication token
   */
  async revokeAuth(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.accessToken) {
        resolve();
        return;
      }

      chrome.identity.removeCachedAuthToken({ token: this.accessToken }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        this.accessToken = null;
        resolve();
      });
    });
  }
}

// Export singleton instance
export const googleDriveAPI = new GoogleDriveAPI();

