# Living Nexus Archive - Testing Guide

## Installation

### Method 1: Load Unpacked (Recommended for Testing)

1. **Build and package the extension:**
   ```bash
   cd /home/ubuntu/LivingNexus/extension
   npm run build
   ./package-extension.sh
   ```

2. **Open Chrome Extensions page:**
   - Navigate to `chrome://extensions/`
   - Or: Menu → More Tools → Extensions

3. **Enable Developer Mode:**
   - Toggle the "Developer mode" switch in the top right

4. **Load the extension:**
   - Click "Load unpacked"
   - Navigate to `/home/ubuntu/LivingNexus/extension/package`
   - Click "Select Folder"

5. **Verify installation:**
   - You should see "Living Nexus Archive - AI Conversation Logger" in your extensions list
   - The extension icon (green folder) should appear in your toolbar

### Method 2: Install from ZIP

1. Use the generated ZIP file: `living-nexus-archive-v1.0.0.zip`
2. Unzip it to a folder
3. Follow steps 2-5 from Method 1

---

## Testing the AI Conversation Logger

### Test 1: ChatGPT Integration

1. **Navigate to ChatGPT:**
   - Go to https://chat.openai.com/
   - Log in if needed

2. **Start a conversation:**
   - Type: "Explain quantum computing in simple terms"
   - Wait for the response

3. **Verify logging:**
   - Look for a green notification in the bottom-right: "🗄️ LNA: Conversation saved"
   - Click the extension icon
   - Check the Dashboard tab - "Conversations Saved" should be 1

4. **Check the saved file:**
   - Open your Downloads folder
   - Navigate to `LivingNexusArchive/AI_Conversations/`
   - You should see a markdown file with today's date

5. **Verify content:**
   - Open the markdown file
   - It should contain:
     - Title (your question)
     - Date, platform (ChatGPT), tags, word count
     - Your message
     - ChatGPT's response

### Test 2: Claude Integration

1. **Navigate to Claude:**
   - Go to https://claude.ai/
   - Log in if needed

2. **Start a conversation:**
   - Type: "Write a haiku about data sovereignty"
   - Wait for the response

3. **Verify logging:**
   - Look for the LNA notification
   - Check extension popup - should now show 2 conversations
   - Check Downloads folder for new markdown file

### Test 3: Gemini Integration

1. **Navigate to Gemini:**
   - Go to https://gemini.google.com/
   - Log in if needed

2. **Start a conversation:**
   - Type: "What are the benefits of local-first software?"
   - Wait for the response

3. **Verify logging:**
   - Same verification steps as above

### Test 4: Extension Popup UI

1. **Click the extension icon** to open the popup

2. **Dashboard Tab:**
   - Verify "Conversations Saved" count
   - Verify "Total Words" count
   - Verify "Storage Used" shows KB
   - All 4 platforms should show "Active" badge

3. **Conversations Tab:**
   - Click the "Conversations" tab
   - You should see a list of saved conversations
   - Each should show:
     - Title (truncated)
     - Platform badge (color-coded)
     - Date
     - Word count
   - Click a conversation to download it as markdown

4. **Settings Tab:**
   - Click the "Settings" tab
   - Toggle checkboxes (they should save to Chrome storage)
   - Test "Clear All Data" button (with confirmation)

5. **Test buttons:**
   - "Open Saved Conversations" → should open Downloads folder
   - "Export All Data" → should download a JSON file

### Test 5: Auto-Tagging

1. **Test programming conversation:**
   - Ask ChatGPT: "How do I write a React component with TypeScript?"
   - Check the saved markdown file
   - Tags should include: `#typescript`, `#react`, `#frontend`

2. **Test writing conversation:**
   - Ask Claude: "Help me develop a character for my story"
   - Tags should include: `#writing`, `#character`

3. **Test business conversation:**
   - Ask Gemini: "What's a good go-to-market strategy for a SaaS product?"
   - Tags should include: `#business`, `#strategy`

### Test 6: Multi-Turn Conversations

1. **Start a conversation on ChatGPT:**
   - "What is React?"
   - Wait for response

2. **Continue the conversation:**
   - "How does it compare to Vue?"
   - Wait for response

3. **Continue again:**
   - "Show me a code example"
   - Wait for response

4. **Check the saved file:**
   - Should contain all 3 exchanges (6 messages total)
   - Should show cumulative word count
   - Title should be based on first question

---

## Troubleshooting

### Extension doesn't appear in toolbar

- Check `chrome://extensions/` to verify it's installed and enabled
- Look for any error messages in red
- Try reloading the extension (click the refresh icon)

### Conversations not being saved

1. **Check console for errors:**
   - Right-click the extension icon → "Inspect popup"
   - Check Console tab for errors

2. **Check content script injection:**
   - On ChatGPT/Claude/Gemini page, press F12
   - Go to Console tab
   - Look for: `[LNA] AI Interceptor active on: [Platform]`
   - If not present, content script isn't injecting

3. **Verify permissions:**
   - Go to `chrome://extensions/`
   - Click "Details" on Living Nexus Archive
   - Check "Site access" - should have access to AI platforms

### Notifications not showing

- Check Settings tab in popup
- Ensure "Show Notifications" is checked
- Check Chrome notification permissions

### Files not downloading

1. **Check Downloads permission:**
   - Extension needs `downloads` permission
   - Verify in manifest.json

2. **Check Chrome download settings:**
   - Chrome Settings → Downloads
   - Ensure "Ask where to save each file" is OFF

3. **Check folder creation:**
   - Manually check if `Downloads/LivingNexusArchive/AI_Conversations/` exists

### IndexedDB errors

1. **Clear extension data:**
   - `chrome://extensions/`
   - Click "Details" on Living Nexus Archive
   - Scroll down to "Site data"
   - Click "Remove"

2. **Check storage quota:**
   - Press F12 on popup
   - Console: `navigator.storage.estimate()`
   - Verify sufficient space

---

## Development Testing

### Hot Reload During Development

1. **Make code changes**

2. **Rebuild:**
   ```bash
   npm run build
   ./package-extension.sh
   ```

3. **Reload extension:**
   - Go to `chrome://extensions/`
   - Click the refresh icon on Living Nexus Archive
   - Or: Remove and re-add the extension

### Testing Content Script Changes

- Content scripts require page reload after extension reload
- After reloading extension, refresh the ChatGPT/Claude/Gemini page

### Debugging

**Service Worker:**
```
chrome://extensions/ → Details → Inspect views: service worker
```

**Content Script:**
```
On AI platform page → F12 → Console
```

**Popup:**
```
Right-click extension icon → Inspect popup
```

### Viewing IndexedDB

1. **Open popup inspector** (right-click icon → Inspect popup)
2. **Go to Application tab**
3. **Expand IndexedDB → LNA_Conversations**
4. **Click "conversations" to view stored data**

---

## Performance Testing

### Test with Large Conversations

1. Have a very long conversation (20+ exchanges)
2. Verify:
   - No lag in UI
   - File saves successfully
   - Word count is accurate
   - Markdown formatting is correct

### Test with Multiple Platforms

1. Open ChatGPT, Claude, and Gemini in different tabs
2. Have conversations in all three simultaneously
3. Verify:
   - All conversations save correctly
   - No conflicts or race conditions
   - Platform detection works correctly

### Storage Limits

1. Generate 100+ conversations
2. Check "Storage Used" in dashboard
3. Verify IndexedDB doesn't exceed quota

---

## Edge Cases

### Empty Messages
- Send an empty message (if platform allows)
- Verify it doesn't crash the logger

### Special Characters
- Use messages with emojis, code blocks, markdown
- Verify they're saved correctly

### Network Interruptions
- Start a conversation
- Disconnect internet mid-response
- Verify graceful handling

### Rapid Conversations
- Send 10 messages in quick succession
- Verify all are captured

---

## Success Criteria

✅ Extension loads without errors  
✅ Popup UI displays correctly  
✅ Content scripts inject on all AI platforms  
✅ Conversations are captured automatically  
✅ Markdown files are saved to Downloads  
✅ IndexedDB stores conversations  
✅ Auto-tagging works  
✅ Search functionality works  
✅ Export functionality works  
✅ Settings persist  
✅ No console errors  
✅ Performance is smooth  

---

## Reporting Issues

If you find bugs, please report with:

1. **Chrome version:** `chrome://version/`
2. **Extension version:** Check manifest.json
3. **Steps to reproduce**
4. **Expected vs actual behavior**
5. **Console errors** (F12 → Console)
6. **Screenshots** (if UI issue)

Report to: https://github.com/Whisperer217/LivingNexus/issues

