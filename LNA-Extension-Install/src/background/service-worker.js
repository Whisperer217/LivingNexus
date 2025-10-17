const GOOGLE_DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
class GoogleDriveAPI {
  constructor() {
    this.accessToken = null;
  }
  /**
   * Authenticate with Google Drive using Chrome Identity API
   */
  async authenticate() {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        var _a;
        if (chrome.runtime.lastError || !token) {
          reject(new Error(((_a = chrome.runtime.lastError) == null ? void 0 : _a.message) || "Authentication failed"));
          return;
        }
        this.accessToken = token;
        resolve({
          provider: "google-drive",
          accessToken: token,
          expiresAt: Date.now() + 36e5
          // 1 hour
        });
      });
    });
  }
  /**
   * Get all files from Google Drive
   */
  async getAllFiles() {
    if (!this.accessToken) {
      throw new Error("Not authenticated. Call authenticate() first.");
    }
    const files = [];
    let pageToken;
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
  async fetchFiles(pageToken) {
    const params = new URLSearchParams({
      pageSize: "1000",
      fields: "nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, thumbnailLink, parents)",
      q: "trashed = false"
    });
    if (pageToken) {
      params.append("pageToken", pageToken);
    }
    const response = await fetch(`${GOOGLE_DRIVE_API_BASE}/files?${params}`, {
      headers: {
        "Authorization": `Bearer ${this.accessToken}`
      }
    });
    if (!response.ok) {
      throw new Error(`Google Drive API error: ${response.statusText}`);
    }
    const data = await response.json();
    const files = data.files.map((file) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: parseInt(file.size || "0"),
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink,
      thumbnailLink: file.thumbnailLink,
      parents: file.parents,
      path: "",
      // Will be calculated later
      provider: "google-drive"
    }));
    return {
      files,
      nextPageToken: data.nextPageToken
    };
  }
  /**
   * Download a file from Google Drive
   */
  async downloadFile(fileId) {
    if (!this.accessToken) {
      throw new Error("Not authenticated");
    }
    const response = await fetch(`${GOOGLE_DRIVE_API_BASE}/files/${fileId}?alt=media`, {
      headers: {
        "Authorization": `Bearer ${this.accessToken}`
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
  async getFileMetadata(fileId) {
    if (!this.accessToken) {
      throw new Error("Not authenticated");
    }
    const response = await fetch(
      `${GOOGLE_DRIVE_API_BASE}/files/${fileId}?fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink,thumbnailLink,parents`,
      {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`
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
      size: parseInt(file.size || "0"),
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink,
      thumbnailLink: file.thumbnailLink,
      parents: file.parents,
      path: "",
      provider: "google-drive"
    };
  }
  /**
   * Build full file paths by traversing parent folders
   */
  async buildFilePaths(files) {
    const folderMap = /* @__PURE__ */ new Map();
    for (const file of files) {
      if (file.mimeType === "application/vnd.google-apps.folder") {
        folderMap.set(file.id, file.name);
      }
    }
    const buildPath = (file) => {
      if (!file.parents || file.parents.length === 0) {
        return file.name;
      }
      const parentId = file.parents[0];
      const parentName = folderMap.get(parentId);
      if (!parentName) {
        return file.name;
      }
      return `${parentName}/${file.name}`;
    };
    return files.map((file) => ({
      ...file,
      path: buildPath(file)
    }));
  }
  /**
   * Revoke authentication token
   */
  async revokeAuth() {
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
const googleDriveAPI = new GoogleDriveAPI();
const ONEDRIVE_API_BASE = "https://graph.microsoft.com/v1.0";
const MICROSOFT_AUTH_ENDPOINT = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
class OneDriveAPI {
  constructor() {
    this.accessToken = null;
    this.clientId = "YOUR_MICROSOFT_CLIENT_ID";
  }
  // Will be configured
  /**
   * Authenticate with Microsoft OneDrive using OAuth 2.0
   */
  async authenticate() {
    const redirectUri = chrome.identity.getRedirectURL();
    const authUrl = new URL(MICROSOFT_AUTH_ENDPOINT);
    authUrl.searchParams.append("client_id", this.clientId);
    authUrl.searchParams.append("response_type", "token");
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", "Files.Read.All offline_access");
    return new Promise((resolve, reject) => {
      chrome.identity.launchWebAuthFlow(
        {
          url: authUrl.toString(),
          interactive: true
        },
        (responseUrl) => {
          var _a;
          if (chrome.runtime.lastError || !responseUrl) {
            reject(new Error(((_a = chrome.runtime.lastError) == null ? void 0 : _a.message) || "Authentication failed"));
            return;
          }
          const params = new URLSearchParams(responseUrl.split("#")[1]);
          const accessToken = params.get("access_token");
          const expiresIn = parseInt(params.get("expires_in") || "3600");
          if (!accessToken) {
            reject(new Error("No access token received"));
            return;
          }
          this.accessToken = accessToken;
          resolve({
            provider: "onedrive",
            accessToken,
            expiresAt: Date.now() + expiresIn * 1e3
          });
        }
      );
    });
  }
  /**
   * Get all files from OneDrive
   */
  async getAllFiles() {
    if (!this.accessToken) {
      throw new Error("Not authenticated. Call authenticate() first.");
    }
    const files = [];
    let nextLink = `${ONEDRIVE_API_BASE}/me/drive/root/children`;
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
  async fetchFiles(url) {
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${this.accessToken}`
      }
    });
    if (!response.ok) {
      throw new Error(`OneDrive API error: ${response.statusText}`);
    }
    const data = await response.json();
    const files = data.value.map((item) => {
      var _a, _b, _c, _d, _e;
      return {
        id: item.id,
        name: item.name,
        mimeType: ((_a = item.file) == null ? void 0 : _a.mimeType) || "application/vnd.ms-folder",
        size: item.size || 0,
        createdTime: item.createdDateTime,
        modifiedTime: item.lastModifiedDateTime,
        webViewLink: item.webUrl,
        thumbnailLink: (_d = (_c = (_b = item.thumbnails) == null ? void 0 : _b[0]) == null ? void 0 : _c.large) == null ? void 0 : _d.url,
        parents: item.parentReference ? [item.parentReference.id] : [],
        path: ((_e = item.parentReference) == null ? void 0 : _e.path) || "",
        provider: "onedrive"
      };
    });
    return {
      files,
      nextLink: data["@odata.nextLink"]
    };
  }
  /**
   * Download a file from OneDrive
   */
  async downloadFile(fileId) {
    if (!this.accessToken) {
      throw new Error("Not authenticated");
    }
    const metadataResponse = await fetch(
      `${ONEDRIVE_API_BASE}/me/drive/items/${fileId}`,
      {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`
        }
      }
    );
    if (!metadataResponse.ok) {
      throw new Error(`Failed to get file metadata: ${metadataResponse.statusText}`);
    }
    const metadata = await metadataResponse.json();
    const downloadUrl = metadata["@microsoft.graph.downloadUrl"];
    if (!downloadUrl) {
      throw new Error("No download URL available");
    }
    const fileResponse = await fetch(downloadUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to download file: ${fileResponse.statusText}`);
    }
    return await fileResponse.blob();
  }
  /**
   * Get file metadata
   */
  async getFileMetadata(fileId) {
    var _a, _b, _c, _d, _e;
    if (!this.accessToken) {
      throw new Error("Not authenticated");
    }
    const response = await fetch(
      `${ONEDRIVE_API_BASE}/me/drive/items/${fileId}`,
      {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`
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
      mimeType: ((_a = item.file) == null ? void 0 : _a.mimeType) || "application/vnd.ms-folder",
      size: item.size || 0,
      createdTime: item.createdDateTime,
      modifiedTime: item.lastModifiedDateTime,
      webViewLink: item.webUrl,
      thumbnailLink: (_d = (_c = (_b = item.thumbnails) == null ? void 0 : _b[0]) == null ? void 0 : _c.large) == null ? void 0 : _d.url,
      parents: item.parentReference ? [item.parentReference.id] : [],
      path: ((_e = item.parentReference) == null ? void 0 : _e.path) || "",
      provider: "onedrive"
    };
  }
  /**
   * Recursively get all files including nested folders
   */
  async getAllFilesRecursive(folderId = "root", basePath = "") {
    var _a, _b, _c, _d;
    if (!this.accessToken) {
      throw new Error("Not authenticated");
    }
    const files = [];
    const url = `${ONEDRIVE_API_BASE}/me/drive/items/${folderId}/children`;
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${this.accessToken}`
      }
    });
    if (!response.ok) {
      throw new Error(`OneDrive API error: ${response.statusText}`);
    }
    const data = await response.json();
    for (const item of data.value) {
      const file = {
        id: item.id,
        name: item.name,
        mimeType: ((_a = item.file) == null ? void 0 : _a.mimeType) || "application/vnd.ms-folder",
        size: item.size || 0,
        createdTime: item.createdDateTime,
        modifiedTime: item.lastModifiedDateTime,
        webViewLink: item.webUrl,
        thumbnailLink: (_d = (_c = (_b = item.thumbnails) == null ? void 0 : _b[0]) == null ? void 0 : _c.large) == null ? void 0 : _d.url,
        parents: [folderId],
        path: basePath ? `${basePath}/${item.name}` : item.name,
        provider: "onedrive"
      };
      files.push(file);
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
  clearAuth() {
    this.accessToken = null;
  }
}
const oneDriveAPI = new OneDriveAPI();
const activeSessions = /* @__PURE__ */ new Map();
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message).then(sendResponse);
  return true;
});
async function handleMessage(message) {
  try {
    switch (message.type) {
      case "AUTHENTICATE":
        return await handleAuthenticate(message.payload.provider);
      case "GET_FILES":
        return await handleGetFiles(message.payload.provider);
      case "START_MIGRATION":
        return await handleStartMigration(message.payload);
      case "PAUSE_MIGRATION":
        return await handlePauseMigration(message.payload.sessionId);
      case "RESUME_MIGRATION":
        return await handleResumeMigration(message.payload.sessionId);
      case "CANCEL_MIGRATION":
        return await handleCancelMigration(message.payload.sessionId);
      case "GET_STATS":
        return await handleGetStats();
      default:
        return {
          success: false,
          error: `Unknown message type: ${message.type}`
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function handleAuthenticate(provider) {
  try {
    let authToken;
    if (provider === "google-drive") {
      authToken = await googleDriveAPI.authenticate();
    } else if (provider === "onedrive") {
      authToken = await oneDriveAPI.authenticate();
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }
    await chrome.storage.local.set({
      [`auth_${provider}`]: authToken
    });
    return {
      success: true,
      data: { provider, authenticated: true }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed"
    };
  }
}
async function handleGetFiles(provider) {
  try {
    let files;
    if (provider === "google-drive") {
      files = await googleDriveAPI.getAllFiles();
      files = await googleDriveAPI.buildFilePaths(files);
    } else if (provider === "onedrive") {
      files = await oneDriveAPI.getAllFilesRecursive();
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }
    return {
      success: true,
      data: { files, count: files.length }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get files"
    };
  }
}
async function handleStartMigration(payload) {
  try {
    const sessionId = generateSessionId();
    const session = {
      id: sessionId,
      provider: payload.provider,
      status: "scanning",
      totalFiles: payload.files.length,
      completedFiles: 0,
      failedFiles: 0,
      totalSize: payload.files.reduce((sum, f) => sum + f.size, 0),
      downloadedSize: 0,
      startTime: Date.now(),
      tasks: payload.files.map((file) => ({
        id: generateTaskId(),
        file,
        status: "idle",
        progress: 0,
        startTime: Date.now()
      }))
    };
    activeSessions.set(sessionId, session);
    startMigrationProcess(session, payload.settings);
    return {
      success: true,
      data: { sessionId, session }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to start migration"
    };
  }
}
async function startMigrationProcess(session, settings) {
  session.status = "downloading";
  for (const task of session.tasks) {
    if (session.status !== "downloading") {
      break;
    }
    try {
      await downloadAndSaveFile(task, session, settings);
      session.completedFiles++;
    } catch (error) {
      task.status = "error";
      task.error = error instanceof Error ? error.message : "Download failed";
      session.failedFiles++;
    }
    chrome.runtime.sendMessage({
      type: "UPDATE_PROGRESS",
      payload: { sessionId: session.id, session }
    });
  }
  session.status = session.failedFiles > 0 ? "error" : "complete";
  session.endTime = Date.now();
  chrome.runtime.sendMessage({
    type: "MIGRATION_COMPLETE",
    payload: { sessionId: session.id, session }
  });
}
async function downloadAndSaveFile(task, session, settings) {
  task.status = "downloading";
  let blob;
  if (session.provider === "google-drive") {
    blob = await googleDriveAPI.downloadFile(task.file.id);
  } else if (session.provider === "onedrive") {
    blob = await oneDriveAPI.downloadFile(task.file.id);
  } else {
    throw new Error(`Unsupported provider: ${session.provider}`);
  }
  const localPath = determineLocalPath(task.file, settings);
  const url = URL.createObjectURL(blob);
  const downloadId = await chrome.downloads.download({
    url,
    filename: localPath,
    saveAs: false
  });
  await waitForDownload(downloadId);
  task.status = "complete";
  task.progress = 100;
  task.endTime = Date.now();
  task.localPath = localPath;
  session.downloadedSize += task.file.size;
  URL.revokeObjectURL(url);
}
function determineLocalPath(file, settings) {
  const baseDir = settings.downloadLocation || "LivingNexusArchive";
  if (settings.organizeByType) {
    const category = categorizeFile(file.mimeType);
    return `${baseDir}/${category}/${file.name}`;
  }
  if (settings.preserveFolderStructure) {
    return `${baseDir}/${file.path}`;
  }
  return `${baseDir}/${file.name}`;
}
function categorizeFile(mimeType) {
  if (mimeType.startsWith("image/")) return "Photos";
  if (mimeType.startsWith("video/")) return "Videos";
  if (mimeType.startsWith("audio/")) return "Music";
  if (mimeType.includes("pdf") || mimeType.includes("document")) return "Documents";
  if (mimeType.includes("zip") || mimeType.includes("archive")) return "Archives";
  return "Other";
}
function waitForDownload(downloadId) {
  return new Promise((resolve, reject) => {
    const listener = (delta) => {
      var _a, _b;
      if (delta.id !== downloadId) return;
      if (((_a = delta.state) == null ? void 0 : _a.current) === "complete") {
        chrome.downloads.onChanged.removeListener(listener);
        resolve();
      } else if (((_b = delta.state) == null ? void 0 : _b.current) === "interrupted") {
        chrome.downloads.onChanged.removeListener(listener);
        reject(new Error("Download interrupted"));
      }
    };
    chrome.downloads.onChanged.addListener(listener);
  });
}
async function handlePauseMigration(sessionId) {
  const session = activeSessions.get(sessionId);
  if (!session) {
    return { success: false, error: "Session not found" };
  }
  session.status = "paused";
  return { success: true, data: { session } };
}
async function handleResumeMigration(sessionId) {
  const session = activeSessions.get(sessionId);
  if (!session) {
    return { success: false, error: "Session not found" };
  }
  session.status = "downloading";
  const settings = await chrome.storage.local.get("settings");
  startMigrationProcess(session, settings.settings);
  return { success: true, data: { session } };
}
async function handleCancelMigration(sessionId) {
  const session = activeSessions.get(sessionId);
  if (!session) {
    return { success: false, error: "Session not found" };
  }
  session.status = "error";
  session.endTime = Date.now();
  activeSessions.delete(sessionId);
  return { success: true, data: { session } };
}
async function handleGetStats() {
  const data = await chrome.storage.local.get(["cloudStats", "localStats"]);
  return {
    success: true,
    data: {
      cloud: data.cloudStats || {},
      local: data.localStats || {}
    }
  };
}
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
function generateTaskId() {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
console.log("Living Nexus Archive - Service Worker loaded");
//# sourceMappingURL=service-worker.js.map
