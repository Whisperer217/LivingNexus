# Living Nexus Archive - Installation Guide

## ✅ Quick Install (3 Steps)

### Step 1: Open Chrome Extensions
1. Open Chrome browser
2. Go to: `chrome://extensions/`
3. Toggle **"Developer mode"** ON (top right corner)

### Step 2: Load This Extension
1. Click **"Load unpacked"** button
2. Select **THIS FOLDER** (the one containing this INSTALL.md file)
3. Click "Select Folder"

### Step 3: Done!
- The extension icon should appear in your toolbar
- Click it to open the popup
- Go to any AI platform (ChatGPT, Claude, Gemini, Perplexity)
- Click "💾 Save Current Conversation" to test it

---

## 🔧 Troubleshooting

### Error: "Could not load manifest"
- Make sure you selected the correct folder (this one)
- This folder should contain `manifest.json`

### Error: "Cannot use import statement"
- You selected the wrong folder
- Make sure you're loading THIS folder, not a parent folder

### Extension not working?
1. Open console (F12) on AI platform
2. Look for: `[LNA] AI Interceptor active on: [Platform]`
3. If you don't see it, reload the extension

---

## 📁 Folder Structure

```
LNA-Extension-Install/          ← LOAD THIS FOLDER
├── INSTALL.md                  ← You are here
├── manifest.json               ← Extension config
├── popup.html                  ← Extension popup UI
├── popup.js                    ← Popup logic
├── src/
│   ├── background/
│   │   └── service-worker.js   ← Background script
│   └── content/
│       ├── ai-interceptor.js   ← AI conversation capture
│       └── manual-scraper.js   ← Manual save feature
└── public/
    └── icons/                  ← Extension icons
```

---

## ✨ Features

- ✅ Manual "Save Current Conversation" button
- ✅ Works on ChatGPT, Claude, Gemini, Perplexity
- ✅ Local storage (IndexedDB)
- ✅ Markdown export
- ✅ Privacy-first (no cloud)

---

## 🚀 Usage

1. Visit any AI platform
2. Have a conversation
3. Click extension icon
4. Click "💾 Save Current Conversation"
5. Conversation saved to IndexedDB + Downloads folder

---

## 📧 Support

Issues? Visit: https://github.com/Whisperer217/LivingNexus/issues

