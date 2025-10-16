/**
 * AI Conversation Interceptor
 * 
 * Content script that runs on AI platform pages (ChatGPT, Claude, Gemini)
 * and intercepts conversations to log them locally.
 */

import { aiLogger } from '../loggers/ai-conversation-logger';
import { AIMessage, AIPlatform } from '../types';

class AIInterceptor {
  private platform: AIPlatform | null = null;
  private currentConversation: AIMessage[] = [];
  private conversationId: string | null = null;

  constructor() {
    this.platform = aiLogger.detectPlatform(window.location.href);
    if (this.platform) {
      console.log('[LNA] AI Interceptor active on:', this.platform);
      this.init();
    }
  }

  /**
   * Initialize interceptor based on platform
   */
  private init(): void {
    switch (this.platform) {
      case 'ChatGPT':
        this.interceptChatGPT();
        break;
      case 'Claude':
        this.interceptClaude();
        break;
      case 'Gemini':
        this.interceptGemini();
        break;
      case 'Perplexity':
        this.interceptPerplexity();
        break;
    }
  }

  /**
   * Intercept ChatGPT conversations
   */
  private interceptChatGPT(): void {
    // Method 1: Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Check if this is a ChatGPT API call
      const url = args[0].toString();
      if (url.includes('api.openai.com/v1/chat/completions') || 
          url.includes('chat.openai.com/backend-api/conversation')) {
        
        // Clone response to read it
        const clonedResponse = response.clone();
        try {
          const data = await clonedResponse.json();
          this.handleChatGPTResponse(data);
        } catch (error) {
          console.error('[LNA] Error parsing ChatGPT response:', error);
        }
      }
      
      return response;
    };

    // Method 2: Observe DOM changes
    this.observeChatGPTDOM();
  }

  /**
   * Observe ChatGPT DOM for new messages
   */
  private observeChatGPTDOM(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Look for message containers
            if (element.matches('[data-message-author-role]') || 
                element.querySelector('[data-message-author-role]')) {
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
  private extractChatGPTMessage(element: Element): void {
    const role = element.getAttribute('data-message-author-role') || 
                 element.querySelector('[data-message-author-role]')?.getAttribute('data-message-author-role');
    
    const contentElement = element.querySelector('.markdown, .whitespace-pre-wrap');
    const content = contentElement?.textContent?.trim();

    if (role && content) {
      this.addMessage({
        role: role as 'user' | 'assistant',
        content,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle ChatGPT API response
   */
  private handleChatGPTResponse(data: any): void {
    const messages = aiLogger.parseConversation(data, 'ChatGPT');
    messages.forEach(msg => this.addMessage(msg));
  }

  /**
   * Intercept Claude conversations
   */
  private interceptClaude(): void {
    // Method 1: Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      const url = args[0].toString();
      if (url.includes('claude.ai/api')) {
        const clonedResponse = response.clone();
        try {
          const data = await clonedResponse.json();
          this.handleClaudeResponse(data);
        } catch (error) {
          console.error('[LNA] Error parsing Claude response:', error);
        }
      }
      
      return response;
    };

    // Method 2: Observe DOM changes
    this.observeClaudeDOM();
  }

  /**
   * Observe Claude DOM for new messages
   */
  private observeClaudeDOM(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Look for message containers (Claude uses different class names)
            if (element.matches('[class*="message"]') || 
                element.querySelector('[class*="message"]')) {
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
  private extractClaudeMessage(element: Element): void {
    // Claude's DOM structure varies, so we use heuristics
    const isUserMessage = element.classList.contains('user') || 
                          element.querySelector('[class*="user"]');
    const isAssistantMessage = element.classList.contains('assistant') || 
                               element.querySelector('[class*="assistant"]');

    if (isUserMessage || isAssistantMessage) {
      const content = element.textContent?.trim();
      if (content) {
        this.addMessage({
          role: isUserMessage ? 'user' : 'assistant',
          content,
          timestamp: Date.now()
        });
      }
    }
  }

  /**
   * Handle Claude API response
   */
  private handleClaudeResponse(data: any): void {
    const messages = aiLogger.parseConversation(data, 'Claude');
    messages.forEach(msg => this.addMessage(msg));
  }

  /**
   * Intercept Gemini conversations
   */
  private interceptGemini(): void {
    // Similar approach to ChatGPT and Claude
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      const url = args[0].toString();
      if (url.includes('generativelanguage.googleapis.com')) {
        const clonedResponse = response.clone();
        try {
          const data = await clonedResponse.json();
          this.handleGeminiResponse(data);
        } catch (error) {
          console.error('[LNA] Error parsing Gemini response:', error);
        }
      }
      
      return response;
    };

    this.observeGeminiDOM();
  }

  /**
   * Observe Gemini DOM for new messages
   */
  private observeGeminiDOM(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
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
  private extractGeminiMessage(element: Element): void {
    // Gemini-specific selectors
    const messageElements = element.querySelectorAll('[class*="message"]');
    messageElements.forEach(msgElement => {
      const content = msgElement.textContent?.trim();
      if (content) {
        // Determine role based on element attributes or position
        const role = msgElement.classList.contains('user-message') ? 'user' : 'assistant';
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
  private handleGeminiResponse(data: any): void {
    const messages = aiLogger.parseConversation(data, 'Gemini');
    messages.forEach(msg => this.addMessage(msg));
  }

  /**
   * Intercept Perplexity conversations
   */
  private interceptPerplexity(): void {
    // Similar to ChatGPT (Perplexity uses similar API structure)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      const url = args[0].toString();
      if (url.includes('perplexity.ai/api')) {
        const clonedResponse = response.clone();
        try {
          const data = await clonedResponse.json();
          this.handlePerplexityResponse(data);
        } catch (error) {
          console.error('[LNA] Error parsing Perplexity response:', error);
        }
      }
      
      return response;
    };
  }

  /**
   * Handle Perplexity API response
   */
  private handlePerplexityResponse(data: any): void {
    const messages = aiLogger.parseConversation(data, 'Perplexity');
    messages.forEach(msg => this.addMessage(msg));
  }

  /**
   * Add message to current conversation
   */
  private addMessage(message: AIMessage): void {
    this.currentConversation.push(message);
    
    // Save conversation after each exchange (user + assistant)
    if (this.shouldSaveConversation()) {
      this.saveCurrentConversation();
    }
  }

  /**
   * Determine if conversation should be saved
   */
  private shouldSaveConversation(): boolean {
    // Save after every complete exchange (user message + assistant response)
    const lastTwoMessages = this.currentConversation.slice(-2);
    if (lastTwoMessages.length === 2) {
      return lastTwoMessages[0].role === 'user' && lastTwoMessages[1].role === 'assistant';
    }
    return false;
  }

  /**
   * Save current conversation
   */
  private async saveCurrentConversation(): Promise<void> {
    if (this.currentConversation.length === 0 || !this.platform) return;

    try {
      const conversation = await aiLogger.logConversation(
        this.platform,
        [...this.currentConversation] // Clone array
      );

      console.log('[LNA] Conversation saved:', conversation.id);
      
      // Show notification
      this.showNotification(`Conversation saved: ${conversation.title}`);
      
      // Update conversation ID
      this.conversationId = conversation.id;
    } catch (error) {
      console.error('[LNA] Error saving conversation:', error);
    }
  }

  /**
   * Show notification to user
   */
  private showNotification(message: string): void {
    // Create notification element
    const notification = document.createElement('div');
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

    // Add animation
    const style = document.createElement('style');
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

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize interceptor when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AIInterceptor();
  });
} else {
  new AIInterceptor();
}

export default AIInterceptor;

