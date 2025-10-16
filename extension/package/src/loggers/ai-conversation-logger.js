class AIConversationLogger {
  constructor() {
    this.db = null;
    this.DB_NAME = "LNA_Conversations";
    this.DB_VERSION = 1;
    this.initDatabase();
  }
  /**
   * Initialize IndexedDB for storing conversations
   */
  async initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("conversations")) {
          const store = db.createObjectStore("conversations", { keyPath: "id" });
          store.createIndex("platform", "platform", { unique: false });
          store.createIndex("timestamp", "timestamp", { unique: false });
          store.createIndex("tags", "tags", { unique: false, multiEntry: true });
        }
      };
    });
  }
  /**
   * Detect which AI platform is being used
   */
  detectPlatform(url) {
    if (url.includes("chat.openai.com") || url.includes("api.openai.com")) {
      return "ChatGPT";
    }
    if (url.includes("claude.ai")) {
      return "Claude";
    }
    if (url.includes("gemini.google.com") || url.includes("generativelanguage.googleapis.com")) {
      return "Gemini";
    }
    if (url.includes("perplexity.ai")) {
      return "Perplexity";
    }
    return null;
  }
  /**
   * Parse conversation from API response
   */
  parseConversation(response, platform) {
    const messages = [];
    switch (platform) {
      case "ChatGPT":
        if (response.choices && Array.isArray(response.choices)) {
          response.choices.forEach((choice) => {
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
      case "Claude":
        if (response.content && Array.isArray(response.content)) {
          response.content.forEach((item) => {
            if (item.type === "text") {
              messages.push({
                role: response.role || "assistant",
                content: item.text,
                timestamp: Date.now()
              });
            }
          });
        }
        break;
      case "Gemini":
        if (response.candidates && Array.isArray(response.candidates)) {
          response.candidates.forEach((candidate) => {
            if (candidate.content && candidate.content.parts) {
              candidate.content.parts.forEach((part) => {
                if (part.text) {
                  messages.push({
                    role: "assistant",
                    content: part.text,
                    timestamp: Date.now()
                  });
                }
              });
            }
          });
        }
        break;
      case "Perplexity":
        if (response.choices && Array.isArray(response.choices)) {
          response.choices.forEach((choice) => {
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
  generateTitle(messages) {
    if (messages.length === 0) return "Untitled Conversation";
    const firstUserMessage = messages.find((m) => m.role === "user");
    if (!firstUserMessage) return "Untitled Conversation";
    let title = firstUserMessage.content.trim().replace(/\n/g, " ").substring(0, 60);
    if (firstUserMessage.content.length > 60) {
      title += "...";
    }
    return title;
  }
  /**
   * Auto-generate tags based on content
   */
  autoTag(messages) {
    const tags = /* @__PURE__ */ new Set();
    const content = messages.map((m) => m.content).join(" ").toLowerCase();
    const languages = ["javascript", "python", "typescript", "java", "rust", "go", "c++", "ruby", "php"];
    languages.forEach((lang) => {
      if (content.includes(lang)) tags.add(lang);
    });
    const topics = [
      { keywords: ["react", "vue", "angular", "svelte"], tag: "frontend" },
      { keywords: ["node", "express", "fastapi", "django"], tag: "backend" },
      { keywords: ["database", "sql", "postgres", "mongodb"], tag: "database" },
      { keywords: ["design", "ui", "ux", "interface"], tag: "design" },
      { keywords: ["story", "character", "plot", "narrative"], tag: "writing" },
      { keywords: ["business", "strategy", "market", "revenue"], tag: "business" },
      { keywords: ["debug", "error", "bug", "fix"], tag: "debugging" },
      { keywords: ["learn", "tutorial", "explain", "how to"], tag: "learning" },
      { keywords: ["idea", "brainstorm", "concept", "think"], tag: "ideation" }
    ];
    topics.forEach(({ keywords, tag }) => {
      if (keywords.some((keyword) => content.includes(keyword))) {
        tags.add(tag);
      }
    });
    return Array.from(tags);
  }
  /**
   * Calculate word count
   */
  calculateWordCount(messages) {
    return messages.reduce((count, message) => {
      return count + message.content.split(/\s+/).length;
    }, 0);
  }
  /**
   * Convert conversation to markdown format
   */
  toMarkdown(conversation) {
    const lines = [];
    lines.push(`# ${conversation.title}`);
    lines.push("");
    lines.push(`**Date:** ${new Date(conversation.timestamp).toLocaleString()}`);
    lines.push(`**Platform:** ${conversation.platform}`);
    if (conversation.tags.length > 0) {
      lines.push(`**Tags:** ${conversation.tags.map((t) => `#${t}`).join(" ")}`);
    }
    lines.push(`**Word Count:** ${conversation.wordCount.toLocaleString()}`);
    lines.push("");
    lines.push("---");
    lines.push("");
    conversation.messages.forEach((message) => {
      const role = message.role === "user" ? "User" : "Assistant";
      lines.push(`## ${role}`);
      lines.push("");
      lines.push(message.content);
      lines.push("");
    });
    return lines.join("\n");
  }
  /**
   * Save conversation to IndexedDB
   */
  async saveConversation(conversation) {
    if (!this.db) {
      await this.initDatabase();
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["conversations"], "readwrite");
      const store = transaction.objectStore("conversations");
      const request = store.put(conversation);
      request.onsuccess = () => {
        console.log("[LNA] Conversation saved:", conversation.id);
        this.saveAsMarkdownFile(conversation);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }
  /**
   * Save conversation as markdown file to Downloads
   */
  async saveAsMarkdownFile(conversation) {
    const markdown = this.toMarkdown(conversation);
    const filename = this.generateFilename(conversation);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    if (chrome.downloads) {
      chrome.downloads.download({
        url,
        filename: `LivingNexusArchive/AI_Conversations/${filename}`,
        saveAs: false
        // Auto-save to Downloads folder
      }, (downloadId) => {
        console.log("[LNA] Markdown file saved:", filename);
        URL.revokeObjectURL(url);
      });
    }
  }
  /**
   * Generate filename for markdown file
   */
  generateFilename(conversation) {
    const date = new Date(conversation.timestamp);
    const dateStr = date.toISOString().split("T")[0];
    const sanitizedTitle = conversation.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 50);
    return `${dateStr}_${sanitizedTitle}.md`;
  }
  /**
   * Log a new conversation
   */
  async logConversation(platform, messages, metadata) {
    const conversation = {
      id: this.generateId(),
      platform,
      messages,
      title: (metadata == null ? void 0 : metadata.title) || this.generateTitle(messages),
      tags: (metadata == null ? void 0 : metadata.tags) || this.autoTag(messages),
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
  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  /**
   * Get all conversations
   */
  async getAllConversations() {
    if (!this.db) {
      await this.initDatabase();
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["conversations"], "readonly");
      const store = transaction.objectStore("conversations");
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  /**
   * Search conversations
   */
  async searchConversations(query) {
    const allConversations = await this.getAllConversations();
    const lowerQuery = query.toLowerCase();
    return allConversations.filter((conv) => {
      if (conv.title.toLowerCase().includes(lowerQuery)) return true;
      if (conv.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))) return true;
      if (conv.messages.some((msg) => msg.content.toLowerCase().includes(lowerQuery))) return true;
      return false;
    });
  }
  /**
   * Get conversations by platform
   */
  async getConversationsByPlatform(platform) {
    if (!this.db) {
      await this.initDatabase();
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["conversations"], "readonly");
      const store = transaction.objectStore("conversations");
      const index = store.index("platform");
      const request = index.getAll(platform);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  /**
   * Get conversations by tag
   */
  async getConversationsByTag(tag) {
    if (!this.db) {
      await this.initDatabase();
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["conversations"], "readonly");
      const store = transaction.objectStore("conversations");
      const index = store.index("tags");
      const request = index.getAll(tag);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  /**
   * Export conversation as markdown
   */
  async exportConversation(conversationId) {
    if (!this.db) {
      await this.initDatabase();
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["conversations"], "readonly");
      const store = transaction.objectStore("conversations");
      const request = store.get(conversationId);
      request.onsuccess = () => {
        if (request.result) {
          resolve(this.toMarkdown(request.result));
        } else {
          reject(new Error("Conversation not found"));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
  /**
   * Delete conversation
   */
  async deleteConversation(conversationId) {
    if (!this.db) {
      await this.initDatabase();
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["conversations"], "readwrite");
      const store = transaction.objectStore("conversations");
      const request = store.delete(conversationId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  /**
   * Get statistics
   */
  async getStatistics() {
    const conversations = await this.getAllConversations();
    const stats = {
      totalConversations: conversations.length,
      totalWordCount: conversations.reduce((sum, conv) => sum + conv.wordCount, 0),
      conversationsByPlatform: {},
      conversationsByTag: {}
    };
    conversations.forEach((conv) => {
      stats.conversationsByPlatform[conv.platform] = (stats.conversationsByPlatform[conv.platform] || 0) + 1;
    });
    conversations.forEach((conv) => {
      conv.tags.forEach((tag) => {
        stats.conversationsByTag[tag] = (stats.conversationsByTag[tag] || 0) + 1;
      });
    });
    return stats;
  }
}
const aiLogger = new AIConversationLogger();
export {
  aiLogger as a
};
//# sourceMappingURL=ai-conversation-logger.js.map
