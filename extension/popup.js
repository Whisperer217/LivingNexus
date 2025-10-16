/**
 * Living Nexus Archive - Popup UI Script
 * Handles the extension popup interface and user interactions
 */

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    // Update active tab
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Update active content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    
    // Load content for the tab
    if (tabName === 'conversations') {
      loadConversations();
    }
  });
});

// Load dashboard stats
async function loadDashboardStats() {
  try {
    // Open IndexedDB
    const db = await openDatabase();
    
    // Get all conversations
    const conversations = await getAllConversations(db);
    
    // Calculate stats
    const totalConversations = conversations.length;
    const totalWords = conversations.reduce((sum, conv) => sum + conv.wordCount, 0);
    
    // Estimate storage (rough calculation)
    const storageUsed = Math.round(
      conversations.reduce((sum, conv) => {
        return sum + JSON.stringify(conv).length;
      }, 0) / 1024
    );
    
    // Update UI
    document.getElementById('total-conversations').textContent = totalConversations;
    document.getElementById('total-words').textContent = totalWords.toLocaleString();
    document.getElementById('storage-used').textContent = `${storageUsed} KB`;
    
  } catch (error) {
    console.error('[LNA Popup] Error loading stats:', error);
  }
}

// Load conversations list
async function loadConversations() {
  try {
    const db = await openDatabase();
    const conversations = await getAllConversations(db);
    
    const listContainer = document.getElementById('conversations-list');
    
    if (conversations.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💬</div>
          <div class="empty-state-text">
            No conversations yet.<br>
            Visit ChatGPT, Claude, or Gemini to start logging!
          </div>
        </div>
      `;
      return;
    }
    
    // Sort by timestamp (newest first)
    conversations.sort((a, b) => b.timestamp - a.timestamp);
    
    // Render conversations
    listContainer.innerHTML = conversations.map(conv => {
      const date = new Date(conv.timestamp).toLocaleDateString();
      const platformClass = `platform-${conv.platform.toLowerCase()}`;
      
      return `
        <div class="conversation-item" data-id="${conv.id}">
          <div class="conversation-title">${conv.title}</div>
          <div class="conversation-meta">
            <span class="platform-badge ${platformClass}">${conv.platform}</span>
            <span>${date}</span>
            <span>${conv.wordCount} words</span>
          </div>
        </div>
      `;
    }).join('');
    
    // Add click handlers
    document.querySelectorAll('.conversation-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        openConversation(id);
      });
    });
    
  } catch (error) {
    console.error('[LNA Popup] Error loading conversations:', error);
  }
}

// Open conversation in new tab
async function openConversation(id) {
  try {
    const db = await openDatabase();
    const conversation = await getConversation(db, id);
    
    if (!conversation) {
      alert('Conversation not found');
      return;
    }
    
    // Create markdown content
    const markdown = conversationToMarkdown(conversation);
    
    // Create blob and download
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: `LivingNexusArchive/conversation_${id}.md`,
      saveAs: true
    }, () => {
      URL.revokeObjectURL(url);
    });
    
  } catch (error) {
    console.error('[LNA Popup] Error opening conversation:', error);
    alert('Error opening conversation');
  }
}

// Convert conversation to markdown
function conversationToMarkdown(conversation) {
  const lines = [];
  
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
  
  conversation.messages.forEach(message => {
    const role = message.role === 'user' ? 'User' : 'Assistant';
    lines.push(`## ${role}`);
    lines.push('');
    lines.push(message.content);
    lines.push('');
  });
  
  return lines.join('\n');
}

// Button handlers
document.getElementById('view-files').addEventListener('click', () => {
  chrome.downloads.showDefaultFolder();
});

document.getElementById('export-all').addEventListener('click', async () => {
  try {
    const db = await openDatabase();
    const conversations = await getAllConversations(db);
    
    if (conversations.length === 0) {
      alert('No conversations to export');
      return;
    }
    
    // Create JSON export
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      conversations: conversations
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: `LivingNexusArchive/export_${Date.now()}.json`,
      saveAs: true
    }, () => {
      URL.revokeObjectURL(url);
      alert('Export complete!');
    });
    
  } catch (error) {
    console.error('[LNA Popup] Error exporting:', error);
    alert('Error exporting data');
  }
});

document.getElementById('clear-data').addEventListener('click', async () => {
  if (!confirm('Are you sure you want to delete all saved conversations? This cannot be undone.')) {
    return;
  }
  
  try {
    const db = await openDatabase();
    await clearAllConversations(db);
    
    alert('All data cleared');
    loadDashboardStats();
    
  } catch (error) {
    console.error('[LNA Popup] Error clearing data:', error);
    alert('Error clearing data');
  }
});

// Settings handlers
document.getElementById('auto-save').addEventListener('change', (e) => {
  chrome.storage.sync.set({ autoSave: e.target.checked });
});

document.getElementById('auto-tag').addEventListener('change', (e) => {
  chrome.storage.sync.set({ autoTag: e.target.checked });
});

document.getElementById('notifications').addEventListener('change', (e) => {
  chrome.storage.sync.set({ notifications: e.target.checked });
});

// External links
document.getElementById('help-link').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: 'https://github.com/Whisperer217/LivingNexus#readme' });
});

document.getElementById('privacy-link').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: 'https://github.com/Whisperer217/LivingNexus/blob/main/PRIVACY.md' });
});

document.getElementById('github-link').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: 'https://github.com/Whisperer217/LivingNexus' });
});

// IndexedDB helper functions
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('LNA_Conversations', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('conversations')) {
        const store = db.createObjectStore('conversations', { keyPath: 'id' });
        store.createIndex('platform', 'platform', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
      }
    };
  });
}

function getAllConversations(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['conversations'], 'readonly');
    const store = transaction.objectStore('conversations');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getConversation(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['conversations'], 'readonly');
    const store = transaction.objectStore('conversations');
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function clearAllConversations(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['conversations'], 'readwrite');
    const store = transaction.objectStore('conversations');
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Load settings on startup
chrome.storage.sync.get(['autoSave', 'autoTag', 'notifications'], (result) => {
  document.getElementById('auto-save').checked = result.autoSave !== false;
  document.getElementById('auto-tag').checked = result.autoTag !== false;
  document.getElementById('notifications').checked = result.notifications !== false;
});

// Initialize dashboard
loadDashboardStats();

// Refresh stats every 5 seconds when popup is open
setInterval(loadDashboardStats, 5000);

