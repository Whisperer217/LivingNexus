class ManualConversationScraper {
  /**
   * Detect which AI platform we're on
   */
  detectPlatform() {
    const hostname = window.location.hostname;
    if (hostname.includes("chatgpt.com") || hostname.includes("openai.com")) {
      return "ChatGPT";
    } else if (hostname.includes("claude.ai") || hostname.includes("anthropic.com")) {
      return "Claude";
    } else if (hostname.includes("gemini.google.com")) {
      return "Gemini";
    } else if (hostname.includes("perplexity.ai")) {
      return "Perplexity";
    }
    return "Unknown";
  }
  /**
   * Scrape ChatGPT conversation
   */
  scrapeChatGPT() {
    const messages = [];
    const messageElements = document.querySelectorAll("[data-message-author-role]");
    messageElements.forEach((element) => {
      var _a;
      const role = element.getAttribute("data-message-author-role");
      const contentElement = element.querySelector(".markdown, .whitespace-pre-wrap");
      if (contentElement && (role === "user" || role === "assistant")) {
        messages.push({
          role,
          content: ((_a = contentElement.textContent) == null ? void 0 : _a.trim()) || "",
          timestamp: Date.now()
        });
      }
    });
    return messages;
  }
  /**
   * Scrape Claude conversation
   */
  scrapeClaude() {
    const messages = [];
    document.querySelectorAll('[class*="user"], [class*="Human"]');
    document.querySelectorAll('[class*="assistant"], [class*="Claude"]');
    const allMessages = Array.from(document.querySelectorAll('[class*="message"]'));
    allMessages.forEach((element) => {
      var _a;
      const text = (_a = element.textContent) == null ? void 0 : _a.trim();
      if (!text) return;
      const isUser = element.className.toLowerCase().includes("user") || element.className.toLowerCase().includes("human");
      messages.push({
        role: isUser ? "user" : "assistant",
        content: text,
        timestamp: Date.now()
      });
    });
    return messages;
  }
  /**
   * Scrape Gemini conversation
   */
  scrapeGemini() {
    const messages = [];
    const messageElements = document.querySelectorAll('.message-content, [class*="query"], [class*="response"]');
    messageElements.forEach((element, index) => {
      var _a;
      const text = (_a = element.textContent) == null ? void 0 : _a.trim();
      if (!text) return;
      messages.push({
        role: index % 2 === 0 ? "user" : "assistant",
        content: text,
        timestamp: Date.now()
      });
    });
    return messages;
  }
  /**
   * Scrape Perplexity conversation
   */
  scrapePerplexity() {
    const messages = [];
    document.querySelectorAll('[class*="query"], input[type="text"]');
    document.querySelectorAll('[class*="answer"], [class*="response"]');
    const mainQuery = document.querySelector('input[type="text"], textarea');
    if (mainQuery && mainQuery.textContent) {
      messages.push({
        role: "user",
        content: mainQuery.textContent.trim(),
        timestamp: Date.now()
      });
    }
    const mainAnswer = document.querySelector('[class*="answer"]');
    if (mainAnswer && mainAnswer.textContent) {
      messages.push({
        role: "assistant",
        content: mainAnswer.textContent.trim(),
        timestamp: Date.now()
      });
    }
    return messages;
  }
  /**
   * Generic scraper for unknown platforms
   */
  scrapeGeneric() {
    const messages = [];
    const possibleMessages = document.querySelectorAll('p, div[class*="message"], article');
    possibleMessages.forEach((element, index) => {
      var _a;
      const text = (_a = element.textContent) == null ? void 0 : _a.trim();
      if (text && text.length > 20) {
        messages.push({
          role: index % 2 === 0 ? "user" : "assistant",
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
  generateTitle(messages) {
    const firstUserMessage = messages.find((m) => m.role === "user");
    if (!firstUserMessage) return "Untitled Conversation";
    const title = firstUserMessage.content.substring(0, 50);
    return title + (firstUserMessage.content.length > 50 ? "..." : "");
  }
  /**
   * Main scraping function
   */
  scrapeCurrentPage() {
    const platform = this.detectPlatform();
    let messages = [];
    console.log("[LNA Manual Scraper] Scraping platform:", platform);
    switch (platform) {
      case "ChatGPT":
        messages = this.scrapeChatGPT();
        break;
      case "Claude":
        messages = this.scrapeClaude();
        break;
      case "Gemini":
        messages = this.scrapeGemini();
        break;
      case "Perplexity":
        messages = this.scrapePerplexity();
        break;
      default:
        messages = this.scrapeGeneric();
    }
    if (messages.length === 0) {
      console.warn("[LNA Manual Scraper] No messages found on page");
      return null;
    }
    const conversation = {
      platform,
      title: this.generateTitle(messages),
      messages,
      url: window.location.href,
      timestamp: Date.now()
    };
    console.log("[LNA Manual Scraper] Scraped conversation:", conversation);
    return conversation;
  }
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapeConversation") {
    const scraper = new ManualConversationScraper();
    const conversation = scraper.scrapeCurrentPage();
    if (conversation) {
      sendResponse({ success: true, conversation });
    } else {
      sendResponse({ success: false, error: "No conversation found on this page" });
    }
  }
  return true;
});
console.log("[LNA Manual Scraper] Content script loaded");
//# sourceMappingURL=manual-scraper.js.map
