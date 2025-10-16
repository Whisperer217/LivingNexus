import { a as aiLogger } from "../loggers/ai-conversation-logger.js";
class AIInterceptor {
  constructor() {
    this.platform = null;
    this.currentConversation = [];
    this.conversationId = null;
    this.platform = aiLogger.detectPlatform(window.location.href);
    if (this.platform) {
      console.log("[LNA] AI Interceptor active on:", this.platform);
      this.init();
    }
  }
  /**
   * Initialize interceptor based on platform
   */
  init() {
    switch (this.platform) {
      case "ChatGPT":
        this.interceptChatGPT();
        break;
      case "Claude":
        this.interceptClaude();
        break;
      case "Gemini":
        this.interceptGemini();
        break;
      case "Perplexity":
        this.interceptPerplexity();
        break;
    }
  }
  /**
   * Intercept ChatGPT conversations
   */
  interceptChatGPT() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const url = args[0].toString();
      if (url.includes("api.openai.com/v1/chat/completions") || url.includes("chat.openai.com/backend-api/conversation")) {
        const clonedResponse = response.clone();
        try {
          const data = await clonedResponse.json();
          this.handleChatGPTResponse(data);
        } catch (error) {
          console.error("[LNA] Error parsing ChatGPT response:", error);
        }
      }
      return response;
    };
    this.observeChatGPTDOM();
  }
  /**
   * Observe ChatGPT DOM for new messages
   */
  observeChatGPTDOM() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            if (element.matches("[data-message-author-role]") || element.querySelector("[data-message-author-role]")) {
              this.extractChatGPTMessage(element);
            }
          }
        });
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  /**
   * Extract message from ChatGPT DOM element
   */
  extractChatGPTMessage(element) {
    var _a, _b;
    const role = element.getAttribute("data-message-author-role") || ((_a = element.querySelector("[data-message-author-role]")) == null ? void 0 : _a.getAttribute("data-message-author-role"));
    const contentElement = element.querySelector(".markdown, .whitespace-pre-wrap");
    const content = (_b = contentElement == null ? void 0 : contentElement.textContent) == null ? void 0 : _b.trim();
    if (role && content) {
      this.addMessage({
        role,
        content,
        timestamp: Date.now()
      });
    }
  }
  /**
   * Handle ChatGPT API response
   */
  handleChatGPTResponse(data) {
    const messages = aiLogger.parseConversation(data, "ChatGPT");
    messages.forEach((msg) => this.addMessage(msg));
  }
  /**
   * Intercept Claude conversations
   */
  interceptClaude() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const url = args[0].toString();
      if (url.includes("claude.ai/api")) {
        const clonedResponse = response.clone();
        try {
          const data = await clonedResponse.json();
          this.handleClaudeResponse(data);
        } catch (error) {
          console.error("[LNA] Error parsing Claude response:", error);
        }
      }
      return response;
    };
    this.observeClaudeDOM();
  }
  /**
   * Observe Claude DOM for new messages
   */
  observeClaudeDOM() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            if (element.matches('[class*="message"]') || element.querySelector('[class*="message"]')) {
              this.extractClaudeMessage(element);
            }
          }
        });
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  /**
   * Extract message from Claude DOM element
   */
  extractClaudeMessage(element) {
    var _a;
    const isUserMessage = element.classList.contains("user") || element.querySelector('[class*="user"]');
    const isAssistantMessage = element.classList.contains("assistant") || element.querySelector('[class*="assistant"]');
    if (isUserMessage || isAssistantMessage) {
      const content = (_a = element.textContent) == null ? void 0 : _a.trim();
      if (content) {
        this.addMessage({
          role: isUserMessage ? "user" : "assistant",
          content,
          timestamp: Date.now()
        });
      }
    }
  }
  /**
   * Handle Claude API response
   */
  handleClaudeResponse(data) {
    const messages = aiLogger.parseConversation(data, "Claude");
    messages.forEach((msg) => this.addMessage(msg));
  }
  /**
   * Intercept Gemini conversations
   */
  interceptGemini() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const url = args[0].toString();
      if (url.includes("generativelanguage.googleapis.com")) {
        const clonedResponse = response.clone();
        try {
          const data = await clonedResponse.json();
          this.handleGeminiResponse(data);
        } catch (error) {
          console.error("[LNA] Error parsing Gemini response:", error);
        }
      }
      return response;
    };
    this.observeGeminiDOM();
  }
  /**
   * Observe Gemini DOM for new messages
   */
  observeGeminiDOM() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            this.extractGeminiMessage(element);
          }
        });
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  /**
   * Extract message from Gemini DOM element
   */
  extractGeminiMessage(element) {
    const messageElements = element.querySelectorAll('[class*="message"]');
    messageElements.forEach((msgElement) => {
      var _a;
      const content = (_a = msgElement.textContent) == null ? void 0 : _a.trim();
      if (content) {
        const role = msgElement.classList.contains("user-message") ? "user" : "assistant";
        this.addMessage({
          role,
          content,
          timestamp: Date.now()
        });
      }
    });
  }
  /**
   * Handle Gemini API response
   */
  handleGeminiResponse(data) {
    const messages = aiLogger.parseConversation(data, "Gemini");
    messages.forEach((msg) => this.addMessage(msg));
  }
  /**
   * Intercept Perplexity conversations
   */
  interceptPerplexity() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const url = args[0].toString();
      if (url.includes("perplexity.ai/api")) {
        const clonedResponse = response.clone();
        try {
          const data = await clonedResponse.json();
          this.handlePerplexityResponse(data);
        } catch (error) {
          console.error("[LNA] Error parsing Perplexity response:", error);
        }
      }
      return response;
    };
  }
  /**
   * Handle Perplexity API response
   */
  handlePerplexityResponse(data) {
    const messages = aiLogger.parseConversation(data, "Perplexity");
    messages.forEach((msg) => this.addMessage(msg));
  }
  /**
   * Add message to current conversation
   */
  addMessage(message) {
    this.currentConversation.push(message);
    if (this.shouldSaveConversation()) {
      this.saveCurrentConversation();
    }
  }
  /**
   * Determine if conversation should be saved
   */
  shouldSaveConversation() {
    const lastTwoMessages = this.currentConversation.slice(-2);
    if (lastTwoMessages.length === 2) {
      return lastTwoMessages[0].role === "user" && lastTwoMessages[1].role === "assistant";
    }
    return false;
  }
  /**
   * Save current conversation
   */
  async saveCurrentConversation() {
    if (this.currentConversation.length === 0 || !this.platform) return;
    try {
      const conversation = await aiLogger.logConversation(
        this.platform,
        [...this.currentConversation]
        // Clone array
      );
      console.log("[LNA] Conversation saved:", conversation.id);
      this.showNotification(`Conversation saved: ${conversation.title}`);
      this.conversationId = conversation.id;
    } catch (error) {
      console.error("[LNA] Error saving conversation:", error);
    }
  }
  /**
   * Show notification to user
   */
  showNotification(message) {
    const notification = document.createElement("div");
    notification.textContent = `🗄️ LNA: ${message}`;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = "slideIn 0.3s ease-out reverse";
      setTimeout(() => notification.remove(), 300);
    }, 3e3);
  }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new AIInterceptor();
  });
} else {
  new AIInterceptor();
}
//# sourceMappingURL=ai-interceptor.js.map
