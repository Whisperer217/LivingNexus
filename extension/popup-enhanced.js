// Enhanced popup with manual save functionality

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    // Update active tab
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Update active content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
  });
});

// Load and display stats
async function loadStats() {
  const stats = await chrome.storage.local.get(['conversations', 'settings']);
  const conversations = stats.conversations || [];
  const settings = stats.settings || { autoSave: true, autoTag: true, showNotifications: true };
  
  // Update dashboard stats
  document.getElementById('conversation-count').textContent = conversations.length;
  
  const totalWords = conversations.reduce((sum, conv) => {
    const words = conv.messages?.reduce((msgSum, msg) => {
      return msgSum + (msg.content?.split(' ').length || 0);
    }, 0) || 0;
    return sum + words;
  }, 0);
  document.getElementById('total-words').textContent = totalWords.toLocaleString();
  
  // Estimate storage (rough calculation)
  const storageKB = Math.round(JSON.stringify(conversations).length / 1024);
  document.getElementById('storage-used').textContent = `${storageKB} KB`;
  
  // Update settings checkboxes
  document.getElementById('auto-save').checked = settings.autoSave;
  document.getElementById('auto-tag').checked = settings.autoTag;
  document.getElementById('show-notifications').checked = settings.showNotifications;
  
  // Load conversations list
  loadConversations(conversations);
}

// Load conversations into the list
function loadConversations(conversations) {
  const container = document.getElementById('conversations-list');
  container.innerHTML = '';
  
  if (conversations.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No conversations saved yet. Click "Save Current Conversation" to get started!</p>';
    return;
  }
  
  conversations.reverse().forEach((conv, index) => {
    const item = document.createElement('div');
    item.className = 'conversation-item';
    
    const date = new Date(conv.timestamp).toLocaleString();
    const wordCount = conv.messages?.reduce((sum, msg) => sum + (msg.content?.split(' ').length || 0), 0) || 0;
    
    item.innerHTML = `
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 4px;">${conv.title || 'Untitled'}</div>
        <div style="font-size: 0.875rem; color: #64748b;">
          ${conv.platform || 'Unknown'} • ${date} • ${wordCount} words
        </div>
      </div>
      <button class="download-btn" data-index="${conversations.length - 1 - index}">
        💾 Download
      </button>
    `;
    
    container.appendChild(item);
  });
  
  // Add download button listeners
  document.querySelectorAll('.download-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      downloadConversation(conversations[index]);
    });
  });
}

// Download conversation as markdown
function downloadConversation(conversation) {
  const markdown = generateMarkdown(conversation);
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  
  const filename = `${new Date(conversation.timestamp).toISOString().split('T')[0]}_${conversation.title?.substring(0, 30).replace(/[^a-z0-9]/gi, '-') || 'conversation'}.md`;
  
  chrome.downloads.download({
    url: url,
    filename: `LivingNexusArchive/AI_Conversations/${filename}`,
    saveAs: false
  });
}

// Generate markdown from conversation
function generateMarkdown(conversation) {
  const date = new Date(conversation.timestamp).toLocaleString();
  const wordCount = conversation.messages?.reduce((sum, msg) => sum + (msg.content?.split(' ').length || 0), 0) || 0;
  
  let markdown = `# ${conversation.title || 'Untitled Conversation'}\n\n`;
  markdown += `**Date:** ${date}\n`;
  markdown += `**Platform:** ${conversation.platform || 'Unknown'}\n`;
  markdown += `**URL:** ${conversation.url || 'N/A'}\n`;
  markdown += `**Word Count:** ${wordCount}\n\n`;
  markdown += `---\n\n`;
  
  conversation.messages?.forEach(msg => {
    const role = msg.role === 'user' ? 'User' : 'Assistant';
    markdown += `## ${role}\n\n`;
    markdown += `${msg.content}\n\n`;
  });
  
  markdown += `---\n\n`;
  markdown += `*Saved by Living Nexus Archive*\n`;
  
  return markdown;
}

// Manual save current conversation
async function saveCurrentConversation() {
  const saveBtn = document.getElementById('save-current-btn');
  const statusDiv = document.getElementById('save-status');
  
  saveBtn.disabled = true;
  saveBtn.textContent = '⏳ Saving...';
  statusDiv.textContent = 'Scraping conversation...';
  statusDiv.className = 'save-status';
  
  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.id) {
      throw new Error('No active tab found');
    }
    
    // Send message to content script to scrape conversation
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'scrapeConversation' });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to scrape conversation');
    }
    
    const conversation = response.conversation;
    
    // Save to storage
    const { conversations = [] } = await chrome.storage.local.get(['conversations']);
    conversations.push(conversation);
    await chrome.storage.local.set({ conversations });
    
    // Download as markdown
    downloadConversation(conversation);
    
    // Show success
    statusDiv.textContent = `✅ Saved! "${conversation.title}"`;
    statusDiv.className = 'save-status success';
    
    // Reload stats
    setTimeout(() => {
      loadStats();
      statusDiv.textContent = '';
    }, 3000);
    
  } catch (error) {
    console.error('Error saving conversation:', error);
    statusDiv.textContent = `❌ Error: ${error.message}`;
    statusDiv.className = 'save-status error';
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = '💾 Save Current Conversation';
  }
}

// Settings handlers
document.getElementById('auto-save').addEventListener('change', async (e) => {
  const settings = await chrome.storage.local.get(['settings']);
  await chrome.storage.local.set({
    settings: { ...settings.settings, autoSave: e.target.checked }
  });
});

document.getElementById('auto-tag').addEventListener('change', async (e) => {
  const settings = await chrome.storage.local.get(['settings']);
  await chrome.storage.local.set({
    settings: { ...settings.settings, autoTag: e.target.checked }
  });
});

document.getElementById('show-notifications').addEventListener('change', async (e) => {
  const settings = await chrome.storage.local.get(['settings']);
  await chrome.storage.local.set({
    settings: { ...settings.settings, showNotifications: e.target.checked }
  });
});

document.getElementById('clear-data').addEventListener('click', async () => {
  if (confirm('Are you sure you want to delete all saved conversations? This cannot be undone.')) {
    await chrome.storage.local.set({ conversations: [] });
    loadStats();
    alert('All data cleared!');
  }
});

// Manual save button
document.getElementById('save-current-btn').addEventListener('click', saveCurrentConversation);

// Load stats on popup open
loadStats();

