/**
 * AI Conversation Logger
 * 
 * Automatically captures and saves AI conversations from ChatGPT, Claude, Gemini
 * to local storage as searchable markdown files.
 * 
 * This is the "killer feature" of Living Nexus Archive.
 */

import { AIConversation, AIMessage, AIPlatform } from '../types';

export class AIConversationLogger {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'LNA_Conversations';
  private readonly DB_VERSION = 1;

  constructor() {
    this.initDatabase();
  }

  /**
   * Initialize IndexedDB for storing conversations
   */
  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create conversations store
        if (!db.objectStoreNames.contains('conversations')) {
          const store = db.createObjectStore('conversations', { keyPath: 'id' });
          store.createIndex('platform', 'platform', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }
      };
    });
  }

  /**
   * Detect which AI platform is being used
   */
  detectPlatform(url: string): AIPlatform | null {
    if (url.includes('chat.openai.com') || url.includes('api.openai.com')) {
      return 'ChatGPT';
    }
    if (url.includes('claude.ai')) {
      return 'Claude';
    }
    if (url.includes('gemini.google.com') || url.includes('generativelanguage.googleapis.com')) {
      return 'Gemini';
    }
    if (url.includes('perplexity.ai')) {
      return 'Perplexity';
    }
    return null;
  }

  /**
   * Parse conversation from API response
   */
  parseConversation(response: any, platform: AIPlatform): AIMessage[] {
    const messages: AIMessage[] = [];

    switch (platform) {
      case 'ChatGPT':
        // OpenAI API format
        if (response.choices && Array.isArray(response.choices)) {
          response.choices.forEach((choice: any) => {
            if (choice.message) {
              messages.push({
                role: choice.message.role,
                content: choice.message.content,
                timestamp: Date.now()
              });
            }
          });
        }
        break;

      case 'Claude':
        // Anthropic API format
        if (response.content && Array.isArray(response.content)) {
          response.content.forEach((item: any) => {
            if (item.type === 'text') {
              messages.push({
                role: response.role || 'assistant',
                content: item.text,
                timestamp: Date.now()
              });
            }
          });
        }
        break;

      case 'Gemini':
        // Google Gemini API format
        if (response.candidates && Array.isArray(response.candidates)) {
          response.candidates.forEach((candidate: any) => {
            if (candidate.content && candidate.content.parts) {
              candidate.content.parts.forEach((part: any) => {
                if (part.text) {
                  messages.push({
                    role: 'assistant',
                    content: part.text,
                    timestamp: Date.now()
                  });
                }
              });
            }
          });
        }
        break;

      case 'Perplexity':
        // Perplexity API format (similar to OpenAI)
        if (response.choices && Array.isArray(response.choices)) {
          response.choices.forEach((choice: any) => {
            if (choice.message) {
              messages.push({
                role: choice.message.role,
                content: choice.message.content,
                timestamp: Date.now()
              });
            }
          });
        }
        break;
    }

    return messages;
  }

  /**
   * Generate a smart title from the conversation
   */
  generateTitle(messages: AIMessage[]): string {
    if (messages.length === 0) return 'Untitled Conversation';

    // Use the first user message as the title
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (!firstUserMessage) return 'Untitled Conversation';

    // Take first 60 characters, clean up
    let title = firstUserMessage.content
      .trim()
      .replace(/\n/g, ' ')
      .substring(0, 60);

    if (firstUserMessage.content.length > 60) {
      title += '...';
    }

    return title;
  }

  /**
   * Auto-generate tags based on content
   */
  autoTag(messages: AIMessage[]): string[] {
    const tags: Set<string> = new Set();
    const content = messages.map(m => m.content).join(' ').toLowerCase();

    // Programming languages
    const languages = ['javascript', 'python', 'typescript', 'java', 'rust', 'go', 'c++', 'ruby', 'php'];
    languages.forEach(lang => {
      if (content.includes(lang)) tags.add(lang);
    });

    // Common topics
    const topics = [
      { keywords: ['react', 'vue', 'angular', 'svelte'], tag: 'frontend' },
      { keywords: ['node', 'express', 'fastapi', 'django'], tag: 'backend' },
      { keywords: ['database', 'sql', 'postgres', 'mongodb'], tag: 'database' },
      { keywords: ['design', 'ui', 'ux', 'interface'], tag: 'design' },
      { keywords: ['story', 'character', 'plot', 'narrative'], tag: 'writing' },
      { keywords: ['business', 'strategy', 'market', 'revenue'], tag: 'business' },
      { keywords: ['debug', 'error', 'bug', 'fix'], tag: 'debugging' },
      { keywords: ['learn', 'tutorial', 'explain', 'how to'], tag: 'learning' },
      { keywords: ['idea', 'brainstorm', 'concept', 'think'], tag: 'ideation' }
    ];

    topics.forEach(({ keywords, tag }) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        tags.add(tag);
      }
    });

    return Array.from(tags);
  }

  /**
   * Calculate word count
   */
  calculateWordCount(messages: AIMessage[]): number {
    return messages.reduce((count, message) => {
      return count + message.content.split(/\s+/).length;
    }, 0);
  }

  /**
   * Convert conversation to markdown format
   */
  toMarkdown(conversation: AIConversation): string {
    const lines: string[] = [];

    // Header
    lines.push(`# ${conversation.title}`);
    lines.push('');
    lines.push(`**Date:** ${new Date(conversation.timestamp).toLocaleString()}`);
    lines.push(`**Platform:** ${conversation.platform}`);
    if (conversation.tags.length > 0) {
      lines.push(`**Tags:** ${conversation.tags.map(t => `#${t}`).join(' ')}`);
    }
    lines.push(`**Word Count:** ${conversation.wordCount.toLocaleString()}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    // Messages
    conversation.messages.forEach(message => {
      const role = message.role === 'user' ? 'User' : 'Assistant';
      lines.push(`## ${role}`);
      lines.push('');
      lines.push(message.content);
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Save conversation to IndexedDB
   */
  async saveConversation(conversation: AIConversation): Promise<void> {
    if (!this.db) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['conversations'], 'readwrite');
      const store = transaction.objectStore('conversations');
      const request = store.put(conversation);

      request.onsuccess = () => {
        console.log('[LNA] Conversation saved:', conversation.id);
        
        // Also save as markdown file for easy access
        this.saveAsMarkdownFile(conversation);
        
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save conversation as markdown file to Downloads
   */
  private async saveAsMarkdownFile(conversation: AIConversation): Promise<void> {
    const markdown = this.toMarkdown(conversation);
    const filename = this.generateFilename(conversation);

    // Create blob
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    // Trigger download using Chrome Downloads API
    if (chrome.downloads) {
      chrome.downloads.download({
        url: url,
        filename: `LivingNexusArchive/AI_Conversations/${filename}`,
        saveAs: false // Auto-save to Downloads folder
      }, (downloadId) => {
        console.log('[LNA] Markdown file saved:', filename);
        URL.revokeObjectURL(url);
      });
    }
  }

  /**
   * Generate filename for markdown file
   */
  private generateFilename(conversation: AIConversation): string {
    const date = new Date(conversation.timestamp);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Sanitize title for filename
    const sanitizedTitle = conversation.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);

    return `${dateStr}_${sanitizedTitle}.md`;
  }

  /**
   * Log a new conversation
   */
  async logConversation(
    platform: AIPlatform,
    messages: AIMessage[],
    metadata?: Partial<AIConversation>
  ): Promise<AIConversation> {
    const conversation: AIConversation = {
      id: this.generateId(),
      platform,
      messages,
      title: metadata?.title || this.generateTitle(messages),
      tags: metadata?.tags || this.autoTag(messages),
      timestamp: Date.now(),
      wordCount: this.calculateWordCount(messages),
      ...metadata
    };

    await this.saveConversation(conversation);
    return conversation;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get all conversations
   */
  async getAllConversations(): Promise<AIConversation[]> {
    if (!this.db) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['conversations'], 'readonly');
      const store = transaction.objectStore('conversations');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Search conversations
   */
  async searchConversations(query: string): Promise<AIConversation[]> {
    const allConversations = await this.getAllConversations();
    const lowerQuery = query.toLowerCase();

    return allConversations.filter(conv => {
      // Search in title
      if (conv.title.toLowerCase().includes(lowerQuery)) return true;

      // Search in tags
      if (conv.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) return true;

      // Search in message content
      if (conv.messages.some(msg => msg.content.toLowerCase().includes(lowerQuery))) return true;

      return false;
    });
  }

  /**
   * Get conversations by platform
   */
  async getConversationsByPlatform(platform: AIPlatform): Promise<AIConversation[]> {
    if (!this.db) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['conversations'], 'readonly');
      const store = transaction.objectStore('conversations');
      const index = store.index('platform');
      const request = index.getAll(platform);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get conversations by tag
   */
  async getConversationsByTag(tag: string): Promise<AIConversation[]> {
    if (!this.db) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['conversations'], 'readonly');
      const store = transaction.objectStore('conversations');
      const index = store.index('tags');
      const request = index.getAll(tag);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Export conversation as markdown
   */
  async exportConversation(conversationId: string): Promise<string> {
    if (!this.db) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['conversations'], 'readonly');
      const store = transaction.objectStore('conversations');
      const request = store.get(conversationId);

      request.onsuccess = () => {
        if (request.result) {
          resolve(this.toMarkdown(request.result));
        } else {
          reject(new Error('Conversation not found'));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    if (!this.db) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['conversations'], 'readwrite');
      const store = transaction.objectStore('conversations');
      const request = store.delete(conversationId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get statistics
   */
  async getStatistics(): Promise<{
    totalConversations: number;
    totalWordCount: number;
    conversationsByPlatform: Record<AIPlatform, number>;
    conversationsByTag: Record<string, number>;
  }> {
    const conversations = await this.getAllConversations();

    const stats = {
      totalConversations: conversations.length,
      totalWordCount: conversations.reduce((sum, conv) => sum + conv.wordCount, 0),
      conversationsByPlatform: {} as Record<AIPlatform, number>,
      conversationsByTag: {} as Record<string, number>
    };

    // Count by platform
    conversations.forEach(conv => {
      stats.conversationsByPlatform[conv.platform] = 
        (stats.conversationsByPlatform[conv.platform] || 0) + 1;
    });

    // Count by tag
    conversations.forEach(conv => {
      conv.tags.forEach(tag => {
        stats.conversationsByTag[tag] = (stats.conversationsByTag[tag] || 0) + 1;
      });
    });

    return stats;
  }
}

// Export singleton instance
export const aiLogger = new AIConversationLogger();

