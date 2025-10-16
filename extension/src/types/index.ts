/**
 * Living Nexus Archive - Type Definitions
 * Chrome Extension Types
 */

export type FileStatus = 'synced' | 'cloud-only' | 'local-only' | 'conflict' | 'migrating';

export type FileCategory = 'photos' | 'documents' | 'videos' | 'music' | 'archives' | 'other';

export type CloudProvider = 'google-drive' | 'onedrive' | 'dropbox';

export type MigrationStatus = 'idle' | 'authenticating' | 'scanning' | 'downloading' | 'organizing' | 'complete' | 'error' | 'paused';

export interface CloudFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
  thumbnailLink?: string;
  parents?: string[];
  path: string;
  provider: CloudProvider;
}

export interface LocalFile {
  id: string;
  filename: string;
  type: string;
  size: number;
  date: string;
  category: FileCategory;
  localPath: string;
  checksum: string;
  source: CloudProvider | 'local-import';
  originalCloudId?: string;
}

export interface MigrationTask {
  id: string;
  file: CloudFile;
  status: MigrationStatus;
  progress: number;
  error?: string;
  startTime: number;
  endTime?: number;
  localPath?: string;
}

export interface MigrationSession {
  id: string;
  provider: CloudProvider;
  status: MigrationStatus;
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  totalSize: number;
  downloadedSize: number;
  startTime: number;
  endTime?: number;
  tasks: MigrationTask[];
}

export interface StorageStats {
  cloud: {
    provider: CloudProvider;
    totalSize: number;
    usedSize: number;
    fileCount: number;
  };
  local: {
    location: string;
    totalSize: number;
    usedSize: number;
    availableSize: number;
    fileCount: number;
  };
}

export interface AuthToken {
  provider: CloudProvider;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface ExtensionSettings {
  downloadLocation: string;
  organizeByType: boolean;
  preserveFolderStructure: boolean;
  skipDuplicates: boolean;
  deleteAfterMigration: boolean;
  theme: 'dark' | 'light' | 'minimalist';
}

// Chrome Extension Message Types
export type MessageType = 
  | 'START_MIGRATION'
  | 'PAUSE_MIGRATION'
  | 'RESUME_MIGRATION'
  | 'CANCEL_MIGRATION'
  | 'GET_FILES'
  | 'GET_STATS'
  | 'AUTHENTICATE'
  | 'DOWNLOAD_FILE'
  | 'UPDATE_PROGRESS';

export interface ExtensionMessage {
  type: MessageType;
  payload?: any;
}

export interface ExtensionResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// AI Conversation Logger Types
export type AIPlatform = 'ChatGPT' | 'Claude' | 'Gemini' | 'Perplexity';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AIConversation {
  id: string;
  platform: AIPlatform;
  messages: AIMessage[];
  title: string;
  tags: string[];
  timestamp: number;
  wordCount: number;
  metadata?: Record<string, any>;
}

