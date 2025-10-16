# Living Nexus Archive - AI Conversation Logger

**Own your AI conversations. Forever.**

A Chrome extension that automatically captures and saves your conversations with ChatGPT, Claude, Gemini, and Perplexity as searchable markdown files on your local machine.

---

## 🎯 The Problem

Every day, you have valuable conversations with AI assistants:
- 💡 Brilliant ideas and brainstorming sessions
- 📚 Learning and research
- 💻 Code solutions and debugging help
- ✍️ Writing and creative work
- 🧠 Problem-solving and decision-making

**But these conversations disappear into the void:**
- Locked in proprietary platforms
- Subject to deletion or data loss
- Not searchable across platforms
- Can't be backed up or archived
- You don't truly own them

---

## ✨ The Solution

**Living Nexus Archive** automatically saves every AI conversation as a markdown file on your computer. It's like having a personal archive of your digital thinking.

### Key Features

🗄️ **Automatic Logging**
- Captures conversations in real-time
- No manual copy-pasting required
- Works silently in the background

📝 **Markdown Export**
- Clean, readable format
- Easy to search and organize
- Compatible with any text editor
- Future-proof format

🏷️ **Smart Auto-Tagging**
- Automatically categorizes conversations
- Tags by topic (programming, writing, business, etc.)
- Tags by language (JavaScript, Python, etc.)
- Makes searching easy

🔍 **Search & Browse**
- Search across all conversations
- Filter by platform, date, or tags
- View statistics and insights

🔒 **Privacy-First**
- All data stored locally on your machine
- No cloud servers
- No tracking or analytics
- You own your data

🌐 **Multi-Platform Support**
- ChatGPT (OpenAI)
- Claude (Anthropic)
- Gemini (Google)
- Perplexity AI

---

## 🚀 Quick Start

### Installation

1. **Download the extension:**
   - Clone this repo or download the ZIP
   - Or download the latest release

2. **Install in Chrome:**
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `extension/package` folder

3. **Start using:**
   - Visit ChatGPT, Claude, or Gemini
   - Have a conversation
   - Watch the magic happen! 🎉

### Usage

1. **Have conversations** on any supported AI platform
2. **See notifications** when conversations are saved (bottom-right)
3. **Click the extension icon** to view your archive
4. **Find saved files** in `Downloads/LivingNexusArchive/AI_Conversations/`

---

## 📖 How It Works

### Architecture

```
┌─────────────────────────────────────┐
│   AI Platform (ChatGPT, Claude)     │
│                                     │
│   User ←→ AI Assistant              │
└──────────────┬──────────────────────┘
               │
               ↓ (Content Script intercepts)
┌─────────────────────────────────────┐
│   Living Nexus Archive Extension    │
│                                     │
│   • Captures messages               │
│   • Parses conversation             │
│   • Auto-tags content               │
│   • Generates markdown              │
└──────────────┬──────────────────────┘
               │
               ↓ (Saves locally)
┌─────────────────────────────────────┐
│   Your Computer                     │
│                                     │
│   • IndexedDB (browser storage)     │
│   • Markdown files (Downloads)      │
│   • Fully searchable                │
└─────────────────────────────────────┘
```

### Technical Details

**Content Script Injection:**
- Runs on AI platform pages
- Intercepts fetch/XHR requests
- Observes DOM for new messages
- Extracts conversation data

**Data Storage:**
- **IndexedDB:** Structured conversation data for search/browse
- **Markdown Files:** Human-readable backups in Downloads folder
- **Chrome Storage:** User settings and preferences

**Privacy:**
- No external API calls
- No data sent to servers
- All processing happens locally
- Open source and auditable

---

## 📁 File Organization

Saved conversations are organized by date:

```
Downloads/
└── LivingNexusArchive/
    └── AI_Conversations/
        ├── 2025-10-16_explain-quantum-computing-in-simple.md
        ├── 2025-10-16_write-a-haiku-about-data-sovereignty.md
        └── 2025-10-17_how-do-i-write-a-react-component-wit.md
```

### Markdown Format

Each file includes:
- **Title:** First user message (truncated)
- **Metadata:** Date, platform, tags, word count
- **Messages:** Full conversation with role labels

Example:

```markdown
# Explain quantum computing in simple terms

**Date:** 10/16/2025, 2:30:45 PM
**Platform:** ChatGPT
**Tags:** #learning #physics
**Word Count:** 342

---

## User

Explain quantum computing in simple terms

## Assistant

Quantum computing is a new type of computing that uses the principles of quantum mechanics...
```

---

## 🎨 Extension Popup

The extension popup provides a dashboard for managing your conversations:

### Dashboard Tab
- **Conversations Saved:** Total count
- **Total Words:** Cumulative word count
- **Storage Used:** IndexedDB size
- **Platform Status:** Active/Inactive indicators

### Conversations Tab
- Browse all saved conversations
- Click to download as markdown
- See platform, date, and word count

### Settings Tab
- **Auto-Save:** Enable/disable markdown file downloads
- **Auto-Tag:** Enable/disable automatic tagging
- **Show Notifications:** Enable/disable save notifications
- **Clear All Data:** Delete all saved conversations

---

## 🔧 Development

### Prerequisites

- Node.js 20+
- npm or pnpm
- Chrome/Chromium browser

### Setup

```bash
# Clone the repo
git clone https://github.com/Whisperer217/LivingNexus.git
cd LivingNexus/extension

# Install dependencies
npm install

# Build the extension
npm run build

# Package for installation
./package-extension.sh
```

### Project Structure

```
extension/
├── src/
│   ├── background/
│   │   └── service-worker.ts       # Background service worker
│   ├── content/
│   │   └── ai-interceptor.ts       # Content script for AI platforms
│   ├── loggers/
│   │   └── ai-conversation-logger.ts # Core logging logic
│   ├── api/
│   │   ├── google-drive.ts         # Google Drive API (future)
│   │   └── onedrive.ts             # OneDrive API (future)
│   └── types/
│       └── index.ts                # TypeScript definitions
├── public/
│   └── icons/                      # Extension icons
├── popup.html                      # Popup UI
├── popup.js                        # Popup logic
├── manifest.json                   # Extension manifest
├── vite.config.ts                  # Build configuration
└── package.json                    # Dependencies
```

### Building

```bash
# TypeScript compilation
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# Type checking only
npm run type-check
```

### Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

---

## 🗺️ Roadmap

### Phase 1: AI Conversation Logger ✅ (Current)
- [x] ChatGPT integration
- [x] Claude integration
- [x] Gemini integration
- [x] Perplexity integration
- [x] Auto-tagging
- [x] Markdown export
- [x] IndexedDB storage
- [x] Popup UI

### Phase 2: Enhanced Features (Q4 2025)
- [ ] Full-text search across all conversations
- [ ] Advanced filtering (date ranges, word count, etc.)
- [ ] Conversation threading (link related conversations)
- [ ] Export to PDF, HTML, or DOCX
- [ ] Sync across devices (optional, encrypted)
- [ ] Dark mode for popup

### Phase 3: File Migration (Q1 2026)
- [ ] Google Drive file migration
- [ ] OneDrive file migration
- [ ] Dropbox integration
- [ ] Local file organization
- [ ] Duplicate detection

### Phase 4: Desktop App (Q2 2026)
- [ ] Electron-based desktop app
- [ ] Local web server for network access
- [ ] Advanced file management
- [ ] AI-powered organization
- [ ] Family profiles

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Bugs
- Use GitHub Issues
- Include Chrome version, extension version, and steps to reproduce
- Attach console logs and screenshots

### Feature Requests
- Open a GitHub Issue with the "enhancement" label
- Describe the use case and expected behavior

### Code Contributions
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit (`git commit -m 'Add amazing feature'`)
6. Push (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add TypeScript types for all new code
- Test on all supported platforms
- Update documentation

---

## 📜 License

MIT License - see [LICENSE](../LICENSE) for details.

**TL;DR:** You can use, modify, and distribute this software freely. Just include the original copyright notice.

---

## 🙏 Acknowledgments

Built with:
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/)

Inspired by:
- The data sovereignty movement
- Local-first software principles
- The need for digital ownership

---

## 📞 Support

- **Documentation:** [GitHub Wiki](https://github.com/Whisperer217/LivingNexus/wiki)
- **Issues:** [GitHub Issues](https://github.com/Whisperer217/LivingNexus/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Whisperer217/LivingNexus/discussions)

---

## 🌟 Why "Living Nexus Archive"?

**Living:** Your conversations are living documents that grow over time  
**Nexus:** The connection point between you and AI assistants  
**Archive:** A permanent, searchable record you own forever

---

## 💡 Philosophy

We believe in:
- **Data sovereignty:** You should own your data
- **Local-first:** Your computer, your rules
- **Privacy by default:** No tracking, no cloud, no compromise
- **One-time purchase:** No subscriptions, no recurring fees
- **Open source:** Transparent, auditable, trustworthy

This extension is the first step in building a complete data sovereignty platform for families. Stay tuned for more!

---

**Made with ❤️ by the Living Nexus team**

*Taking back control of our digital lives, one conversation at a time.*

