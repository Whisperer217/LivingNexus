/**
 * Living Nexus Archive - Background Service Worker
 * Handles API calls, file downloads, and migration orchestration
 */

import { googleDriveAPI } from '../api/google-drive';
import { oneDriveAPI } from '../api/onedrive';
import type { 
  ExtensionMessage, 
  ExtensionResponse, 
  MigrationSession, 
  MigrationTask,
  CloudFile,
  CloudProvider
} from '../types';

// Active migration sessions
const activeSessions = new Map<string, MigrationSession>();

/**
 * Handle messages from popup/content scripts
 */
chrome.runtime.onMessage.addListener((
  message: ExtensionMessage,
  sender,
  sendResponse: (response: ExtensionResponse) => void
) => {
  handleMessage(message).then(sendResponse);
  return true; // Keep channel open for async response
});

/**
 * Main message handler
 */
async function handleMessage(message: ExtensionMessage): Promise<ExtensionResponse> {
  try {
    switch (message.type) {
      case 'AUTHENTICATE':
        return await handleAuthenticate(message.payload.provider);
      
      case 'GET_FILES':
        return await handleGetFiles(message.payload.provider);
      
      case 'START_MIGRATION':
        return await handleStartMigration(message.payload);
      
      case 'PAUSE_MIGRATION':
        return await handlePauseMigration(message.payload.sessionId);
      
      case 'RESUME_MIGRATION':
        return await handleResumeMigration(message.payload.sessionId);
      
      case 'CANCEL_MIGRATION':
        return await handleCancelMigration(message.payload.sessionId);
      
      case 'GET_STATS':
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
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Handle authentication request
 */
async function handleAuthenticate(provider: CloudProvider): Promise<ExtensionResponse> {
  try {
    let authToken;

    if (provider === 'google-drive') {
      authToken = await googleDriveAPI.authenticate();
    } else if (provider === 'onedrive') {
      authToken = await oneDriveAPI.authenticate();
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    // Store auth token
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
      error: error instanceof Error ? error.message : 'Authentication failed'
    };
  }
}

/**
 * Handle get files request
 */
async function handleGetFiles(provider: CloudProvider): Promise<ExtensionResponse> {
  try {
    let files: CloudFile[];

    if (provider === 'google-drive') {
      files = await googleDriveAPI.getAllFiles();
      files = await googleDriveAPI.buildFilePaths(files);
    } else if (provider === 'onedrive') {
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
      error: error instanceof Error ? error.message : 'Failed to get files'
    };
  }
}

/**
 * Handle start migration request
 */
async function handleStartMigration(payload: {
  provider: CloudProvider;
  files: CloudFile[];
  settings: any;
}): Promise<ExtensionResponse> {
  try {
    const sessionId = generateSessionId();
    
    const session: MigrationSession = {
      id: sessionId,
      provider: payload.provider,
      status: 'scanning',
      totalFiles: payload.files.length,
      completedFiles: 0,
      failedFiles: 0,
      totalSize: payload.files.reduce((sum, f) => sum + f.size, 0),
      downloadedSize: 0,
      startTime: Date.now(),
      tasks: payload.files.map(file => ({
        id: generateTaskId(),
        file,
        status: 'idle',
        progress: 0,
        startTime: Date.now()
      }))
    };

    activeSessions.set(sessionId, session);

    // Start migration in background
    startMigrationProcess(session, payload.settings);

    return {
      success: true,
      data: { sessionId, session }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start migration'
    };
  }
}

/**
 * Start the actual migration process
 */
async function startMigrationProcess(session: MigrationSession, settings: any) {
  session.status = 'downloading';

  for (const task of session.tasks) {
    if (session.status === 'paused' || session.status === 'error') {
      break;
    }

    try {
      await downloadAndSaveFile(task, session, settings);
      session.completedFiles++;
    } catch (error) {
      task.status = 'error';
      task.error = error instanceof Error ? error.message : 'Download failed';
      session.failedFiles++;
    }

    // Notify progress
    chrome.runtime.sendMessage({
      type: 'UPDATE_PROGRESS',
      payload: { sessionId: session.id, session }
    });
  }

  session.status = session.failedFiles > 0 ? 'error' : 'complete';
  session.endTime = Date.now();

  // Notify completion
  chrome.runtime.sendMessage({
    type: 'MIGRATION_COMPLETE',
    payload: { sessionId: session.id, session }
  });
}

/**
 * Download and save a single file
 */
async function downloadAndSaveFile(
  task: MigrationTask,
  session: MigrationSession,
  settings: any
) {
  task.status = 'downloading';

  let blob: Blob;

  // Download from cloud
  if (session.provider === 'google-drive') {
    blob = await googleDriveAPI.downloadFile(task.file.id);
  } else if (session.provider === 'onedrive') {
    blob = await oneDriveAPI.downloadFile(task.file.id);
  } else {
    throw new Error(`Unsupported provider: ${session.provider}`);
  }

  // Determine local path
  const localPath = determineLocalPath(task.file, settings);

  // Download using Chrome Downloads API
  const url = URL.createObjectURL(blob);
  
  const downloadId = await chrome.downloads.download({
    url,
    filename: localPath,
    saveAs: false
  });

  // Wait for download to complete
  await waitForDownload(downloadId);

  task.status = 'complete';
  task.progress = 100;
  task.endTime = Date.now();
  task.localPath = localPath;

  session.downloadedSize += task.file.size;

  // Clean up blob URL
  URL.revokeObjectURL(url);
}

/**
 * Determine local file path based on settings
 */
function determineLocalPath(file: CloudFile, settings: any): string {
  const baseDir = settings.downloadLocation || 'LivingNexusArchive';
  
  if (settings.organizeByType) {
    const category = categorizeFile(file.mimeType);
    return `${baseDir}/${category}/${file.name}`;
  }
  
  if (settings.preserveFolderStructure) {
    return `${baseDir}/${file.path}`;
  }
  
  return `${baseDir}/${file.name}`;
}

/**
 * Categorize file by MIME type
 */
function categorizeFile(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'Photos';
  if (mimeType.startsWith('video/')) return 'Videos';
  if (mimeType.startsWith('audio/')) return 'Music';
  if (mimeType.includes('pdf') || mimeType.includes('document')) return 'Documents';
  if (mimeType.includes('zip') || mimeType.includes('archive')) return 'Archives';
  return 'Other';
}

/**
 * Wait for a download to complete
 */
function waitForDownload(downloadId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const listener = (delta: chrome.downloads.DownloadDelta) => {
      if (delta.id !== downloadId) return;

      if (delta.state?.current === 'complete') {
        chrome.downloads.onChanged.removeListener(listener);
        resolve();
      } else if (delta.state?.current === 'interrupted') {
        chrome.downloads.onChanged.removeListener(listener);
        reject(new Error('Download interrupted'));
      }
    };

    chrome.downloads.onChanged.addListener(listener);
  });
}

/**
 * Handle pause migration
 */
async function handlePauseMigration(sessionId: string): Promise<ExtensionResponse> {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  session.status = 'paused';

  return { success: true, data: { session } };
}

/**
 * Handle resume migration
 */
async function handleResumeMigration(sessionId: string): Promise<ExtensionResponse> {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  session.status = 'downloading';
  
  // Resume migration process
  const settings = await chrome.storage.local.get('settings');
  startMigrationProcess(session, settings.settings);

  return { success: true, data: { session } };
}

/**
 * Handle cancel migration
 */
async function handleCancelMigration(sessionId: string): Promise<ExtensionResponse> {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  session.status = 'error';
  session.endTime = Date.now();
  activeSessions.delete(sessionId);

  return { success: true, data: { session } };
}

/**
 * Handle get stats request
 */
async function handleGetStats(): Promise<ExtensionResponse> {
  // Get stats from storage
  const data = await chrome.storage.local.get(['cloudStats', 'localStats']);

  return {
    success: true,
    data: {
      cloud: data.cloudStats || {},
      local: data.localStats || {}
    }
  };
}

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique task ID
 */
function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Log that service worker is loaded
console.log('Living Nexus Archive - Service Worker loaded');

