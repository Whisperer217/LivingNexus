# Living Nexus Archive - Chrome Extension

A Chrome extension for migrating files from Google Drive and Microsoft OneDrive to local storage.

## 🏗️ Project Structure

```
extension/
├── manifest.json           # Chrome Extension configuration
├── popup.html             # Extension popup UI (from Bolt.new)
├── src/
│   ├── background/
│   │   └── service-worker.ts    # Background service worker
│   ├── api/
│   │   ├── google-drive.ts      # Google Drive API integration
│   │   └── onedrive.ts          # OneDrive API integration
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   └── utils/
│       └── (utility functions)
└── public/
    ├── icons/                   # Extension icons
    └── _locales/               # Internationalization
```

## 🚀 Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Chrome browser
- Google Cloud Project (for Google Drive API)
- Microsoft Azure App Registration (for OneDrive API)

### 2. API Configuration

#### Google Drive API:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://<extension-id>.chromiumapp.org/`
6. Copy the Client ID and update `manifest.json`

#### Microsoft OneDrive API:

1. Go to [Azure Portal](https://portal.azure.com/)
2. Register a new application
3. Add redirect URI: `https://<extension-id>.chromiumapp.org/`
4. Grant permissions: `Files.Read.All`
5. Copy the Client ID and update `src/api/onedrive.ts`

### 3. Build the Extension

```bash
# Install dependencies
npm install

# Build TypeScript files
npm run build

# Or watch for changes during development
npm run watch
```

### 4. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension/` directory
5. The extension will appear in your toolbar

## 🔧 Development

### Building

```bash
# Build once
npm run build

# Watch mode (rebuilds on file changes)
npm run watch

# Type check
npm run type-check
```

### Testing

```bash
# Run tests
npm test

# Test specific API
npm test -- google-drive
```

## 📦 Packaging for Distribution

```bash
# Create production build
npm run build:prod

# Package extension
npm run package
```

This creates a `.zip` file ready for Chrome Web Store submission.

## 🔐 Security Notes

- API keys and client IDs should be stored securely
- Never commit real API credentials to Git
- Use environment variables for sensitive data
- The extension uses OAuth 2.0 for secure authentication

## 📝 Configuration

### Extension Settings

Users can configure:

- **Download Location**: Where to save migrated files
- **Organize by Type**: Auto-categorize files (Photos, Documents, etc.)
- **Preserve Folder Structure**: Maintain original folder hierarchy
- **Skip Duplicates**: Avoid downloading files that already exist locally
- **Delete After Migration**: Remove files from cloud after successful migration

### Storage

The extension uses Chrome's `storage.local` API to persist:

- Authentication tokens
- User settings
- Migration history
- File metadata

## 🐛 Troubleshooting

### Authentication Issues

- Make sure redirect URIs are correctly configured
- Check that API permissions are granted
- Clear cached tokens: `chrome.storage.local.clear()`

### Download Failures

- Check Chrome's download settings
- Ensure sufficient disk space
- Verify file permissions

### API Rate Limits

- Google Drive: 1,000 requests per 100 seconds per user
- OneDrive: 10,000 requests per hour per user

## 📚 API Documentation

- [Google Drive API v3](https://developers.google.com/drive/api/v3/reference)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/api/resources/onedrive)
- [Chrome Extension APIs](https://developer.chrome.com/docs/extensions/reference/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Living Nexus Archive Website](https://livingnexusarchive.com)
- [GitHub Repository](https://github.com/Whisperer217/LivingNexus)
- [Chrome Web Store](#) (coming soon)

---

**Built with ❤️ for digital sovereignty**

