/**
 * Manual Conversation Scraper
 * Scrapes AI conversations from the current page when user clicks "Save"
 */

interface ScrapedMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

interface ScrapedConversation {
  platform: 'ChatGPT' | 'Claude' | 'Gemini' | 'Perplexity' | 'Unknown';
  title: string;
  messages: ScrapedMessage[];
  url: string;
  timestamp: number;
}

class ManualConversationScraper {
  /**
   * Detect which AI platform we're on
   */
  private detectPlatform(): ScrapedConversation['platform'] {
    const hostname = window.location.hostname;
    
    if (hostname.includes('chatgpt.com') || hostname.includes('openai.com')) {
      return 'ChatGPT';
    } else if (hostname.includes('claude.ai') || hostname.includes('anthropic.com')) {
      return 'Claude';
    } else if (hostname.includes('gemini.google.com')) {
      return 'Gemini';
    } else if (hostname.includes('perplexity.ai')) {
      return 'Perplexity';
    }
    
    return 'Unknown';
  }

  /**
   * Scrape ChatGPT conversation
   */
  private scrapeChatGPT(): ScrapedMessage[] {
    const messages: ScrapedMessage[] = [];
    
    // ChatGPT uses article elements for messages
    const messageElements = document.querySelectorAll('[data-message-author-role]');
    
    messageElements.forEach((element) => {
      const role = element.getAttribute('data-message-author-role');
      const contentElement = element.querySelector('.markdown, .whitespace-pre-wrap');
      
      if (contentElement && (role === 'user' || role === 'assistant')) {
        messages.push({
          role: role as 'user' | 'assistant',
          content: contentElement.textContent?.trim() || '',
          timestamp: Date.now()
        });
      }
    });
    
    return messages;
  }

  /**
   * Scrape Claude conversation
   */
  private scrapeClaude(): ScrapedMessage[] {
    const messages: ScrapedMessage[] = [];
    
    // Claude uses specific class names for messages
    const userMessages = document.querySelectorAll('[class*="user"], [class*="Human"]');
    const assistantMessages = document.querySelectorAll('[class*="assistant"], [class*="Claude"]');
    
    // Try to interleave messages in order
    const allMessages = Array.from(document.querySelectorAll('[class*="message"]'));
    
    allMessages.forEach((element) => {
      const text = element.textContent?.trim();
      if (!text) return;
      
      // Heuristic: Determine role based on position or class
      const isUser = element.className.toLowerCase().includes('user') || 
                     element.className.toLowerCase().includes('human');
      
      messages.push({
        role: isUser ? 'user' : 'assistant',
        content: text,
        timestamp: Date.now()
      });
    });
    
    return messages;
  }

  /**
   * Scrape Gemini conversation
   */
  private scrapeGemini(): ScrapedMessage[] {
    const messages: ScrapedMessage[] = [];
    
    // Gemini uses message-content class
    const messageElements = document.querySelectorAll('.message-content, [class*="query"], [class*="response"]');
    
    messageElements.forEach((element, index) => {
      const text = element.textContent?.trim();
      if (!text) return;
      
      // Alternate between user and assistant
      messages.push({
        role: index % 2 === 0 ? 'user' : 'assistant',
        content: text,
        timestamp: Date.now()
      });
    });
    
    return messages;
  }

  /**
   * Scrape Perplexity conversation
   */
  private scrapePerplexity(): ScrapedMessage[] {
    const messages: ScrapedMessage[] = [];
    
    // Perplexity structure
    const queryElements = document.querySelectorAll('[class*="query"], input[type="text"]');
    const answerElements = document.querySelectorAll('[class*="answer"], [class*="response"]');
    
    // Get the main query
    const mainQuery = document.querySelector('input[type="text"], textarea');
    if (mainQuery && mainQuery.textContent) {
      messages.push({
        role: 'user',
        content: mainQuery.textContent.trim(),
        timestamp: Date.now()
      });
    }
    
    // Get the answer
    const mainAnswer = document.querySelector('[class*="answer"]');
    if (mainAnswer && mainAnswer.textContent) {
      messages.push({
        role: 'assistant',
        content: mainAnswer.textContent.trim(),
        timestamp: Date.now()
      });
    }
    
    return messages;
  }

  /**
   * Generic scraper for unknown platforms
   */
  private scrapeGeneric(): ScrapedMessage[] {
    const messages: ScrapedMessage[] = [];
    
    // Try to find any conversation-like structure
    const possibleMessages = document.querySelectorAll('p, div[class*="message"], article');
    
    possibleMessages.forEach((element, index) => {
      const text = element.textContent?.trim();
      if (text && text.length > 20) { // Filter out short snippets
        messages.push({
          role: index % 2 === 0 ? 'user' : 'assistant',
          content: text,
          timestamp: Date.now()
        });
      }
    });
    
    return messages;
  }

  /**
   * Generate conversation title from first user message
   */
  private generateTitle(messages: ScrapedMessage[]): string {
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (!firstUserMessage) return 'Untitled Conversation';
    
    // Take first 50 chars of first message
    const title = firstUserMessage.content.substring(0, 50);
    return title + (firstUserMessage.content.length > 50 ? '...' : '');
  }

  /**
   * Main scraping function
   */
  public scrapeCurrentPage(): ScrapedConversation | null {
    const platform = this.detectPlatform();
    let messages: ScrapedMessage[] = [];
    
    console.log('[LNA Manual Scraper] Scraping platform:', platform);
    
    switch (platform) {
      case 'ChatGPT':
        messages = this.scrapeChatGPT();
        break;
      case 'Claude':
        messages = this.scrapeClaude();
        break;
      case 'Gemini':
        messages = this.scrapeGemini();
        break;
      case 'Perplexity':
        messages = this.scrapePerplexity();
        break;
      default:
        messages = this.scrapeGeneric();
    }
    
    if (messages.length === 0) {
      console.warn('[LNA Manual Scraper] No messages found on page');
      return null;
    }
    
    const conversation: ScrapedConversation = {
      platform,
      title: this.generateTitle(messages),
      messages,
      url: window.location.href,
      timestamp: Date.now()
    };
    
    console.log('[LNA Manual Scraper] Scraped conversation:', conversation);
    
    return conversation;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeConversation') {
    const scraper = new ManualConversationScraper();
    const conversation = scraper.scrapeCurrentPage();
    
    if (conversation) {
      sendResponse({ success: true, conversation });
    } else {
      sendResponse({ success: false, error: 'No conversation found on this page' });
    }
  }
  
  return true; // Keep message channel open for async response
});

console.log('[LNA Manual Scraper] Content script loaded');

