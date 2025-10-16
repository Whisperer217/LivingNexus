# Living Nexus Archive - Technical Architecture

**Version:** 1.0  
**Date:** October 16, 2025  
**Status:** Architecture Definition Phase

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Component Architecture](#component-architecture)
4. [Database Schema](#database-schema)
5. [API Specifications](#api-specifications)
6. [File Organization Logic](#file-organization-logic)
7. [Security & Privacy](#security--privacy)
8. [Technology Stack](#technology-stack)
9. [Development Roadmap](#development-roadmap)

---

## Executive Summary

**Living Nexus Archive (LNA)** is a data sovereignty platform that enables families to migrate their files from cloud storage services (Google Drive, Dropbox, iCloud, OneDrive) to local, encrypted storage on hardware they own and control.

### Core Value Proposition

> "Your Family's Digital DNA. Migrate from the cloud. Own your data. One purchase. Forever."

### Key Features

- **Cloud Migration:** One-click migration from Google Drive, Dropbox, iCloud, OneDrive
- **Local Storage:** All files stored on user's hardware (desktop, external drive)
- **AI Organization:** Automatic categorization and tagging using local AI
- **Network Hub:** Access files from any device on local network
- **Zero Subscriptions:** One-time purchase, no monthly fees
- **Complete Privacy:** No data ever sent to cloud services (except during initial migration)

---

## System Overview

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLOUD SERVICES                           │
│   (Google Drive, Dropbox, OneDrive, iCloud)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (One-time migration)
┌─────────────────────────────────────────────────────────────┐
│               BROWSER EXTENSION (LNA Migrator)               │
│  • Authenticates with cloud services                         │
│  • Downloads all files                                       │
│  • Sends to Desktop App via WebSocket                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (File transfer)
┌─────────────────────────────────────────────────────────────┐
│            DESKTOP APP (LNA Core - Electron)                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Frontend (React + TypeScript)                      │    │
│  │  • File Browser UI                                  │    │
│  │  • Migration Wizard                                 │    │
│  │  • Settings Panel                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Backend (Node.js + Express)                        │    │
│  │  • File Receiver (from Extension)                   │    │
│  │  • File Organizer (AI-powered)                      │    │
│  │  • Database Manager (SQLite)                        │    │
│  │  • Network Hub Server                               │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Storage Layer                                      │    │
│  │  • Local Filesystem (user-selected directory)       │    │
│  │  • SQLite Database (file index)                     │    │
│  │  • Encryption Layer (AES-256)                       │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (Serves files via HTTP/WebSocket)
┌─────────────────────────────────────────────────────────────┐
│              NETWORK HUB (Local Web Server)                  │
│  • Runs on http://192.168.x.x:8080                          │
│  • REST API for file operations                             │
│  • WebSocket for real-time sync                             │
│  • Device authentication (QR code pairing)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬────────────┐
        ↓            ↓            ↓            ↓
   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
   │ Phone  │  │ Tablet │  │ Laptop │  │  Web   │
   │ (App)  │  │ (App)  │  │(Browser)│ │(Browser)│
   └────────┘  └────────┘  └────────┘  └────────┘
```

### Data Flow

1. **Migration Phase:**
   - User installs Browser Extension
   - Extension authenticates with cloud service (OAuth)
   - Extension downloads files and sends to Desktop App
   - Desktop App organizes files and indexes in database

2. **Daily Use Phase:**
   - User accesses files via Desktop App or Network Hub
   - Files are served from local storage
   - New files can be uploaded from any device
   - All changes synced across devices on local network

---

## Component Architecture

### 1. Browser Extension (LNA Migrator)

**Platform:** Chrome Extension (Manifest V3), compatible with Edge, Brave

**Purpose:** Download files from cloud services and transfer to Desktop App

**Key Features:**
- OAuth authentication with Google, Dropbox, Microsoft, Apple
- Bulk file download with progress tracking
- WebSocket connection to Desktop App
- Pause/resume functionality
- Error handling and retry logic

**Technology:**
- JavaScript/TypeScript
- Chrome Extension API
- Google Drive API v3
- Dropbox API v2
- Microsoft Graph API (OneDrive)
- iCloud API (if accessible)

**File Structure:**
```
extension/
├── manifest.json
├── background/
│   ├── service-worker.ts
│   └── api-clients/
│       ├── google-drive.ts
│       ├── dropbox.ts
│       ├── onedrive.ts
│       └── icloud.ts
├── popup/
│   ├── popup.html
│   ├── popup.ts
│   └── popup.css
└── content/
    └── injected-scripts.ts
```

---

### 2. Desktop App (LNA Core)

**Platform:** Electron (Windows, macOS, Linux)

**Purpose:** Central hub for file storage, organization, and network serving

**Key Features:**
- File receiver (from Extension)
- AI-powered file organization
- SQLite database for file indexing
- File browser UI
- Network Hub server
- Settings and configuration

**Technology:**
- Electron 28+
- React 18 + TypeScript
- Node.js 20+
- Express.js (for Network Hub)
- SQLite3 (for database)
- TensorFlow.js or ONNX Runtime (for local AI)

**File Structure:**
```
desktop/
├── electron/
│   ├── main.ts (Main process)
│   ├── preload.ts (Bridge)
│   └── ipc-handlers.ts (IPC communication)
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── FileBrowser.tsx
│   │   ├── MigrationWizard.tsx
│   │   ├── Settings.tsx
│   │   └── Dashboard.tsx
│   ├── services/
│   │   ├── file-receiver.ts
│   │   ├── file-organizer.ts
│   │   ├── database.ts
│   │   └── network-hub.ts
│   └── utils/
│       ├── encryption.ts
│       ├── ai-tagger.ts
│       └── file-utils.ts
├── server/
│   ├── index.ts (Express server)
│   ├── routes/
│   │   ├── files.ts
│   │   ├── search.ts
│   │   └── devices.ts
│   └── middleware/
│       ├── auth.ts
│       └── cors.ts
└── database/
    ├── schema.sql
    └── migrations/
```

---

### 3. Network Hub (Local Web Server)

**Platform:** Express.js server running inside Desktop App

**Purpose:** Serve files to other devices on local network

**Key Features:**
- REST API for file operations
- WebSocket for real-time sync
- Device authentication (QR code pairing)
- CORS configuration for local network
- Optional: Tailscale/ZeroTier for remote access

**API Endpoints:**

```
GET    /api/files              # List all files
GET    /api/files/:id          # Get file metadata
GET    /api/files/:id/download # Download file
POST   /api/files/upload       # Upload file
DELETE /api/files/:id          # Delete file
GET    /api/search?q=query     # Search files
POST   /api/devices/pair       # Pair new device (QR code)
GET    /api/devices            # List paired devices
```

**WebSocket Events:**

```
file:uploaded    # Notify when new file uploaded
file:deleted     # Notify when file deleted
file:updated     # Notify when file metadata updated
sync:start       # Start sync operation
sync:complete    # Sync operation complete
```

---

## Database Schema

**Database:** SQLite3

**Location:** `~/.living-nexus-archive/index.db` (or user-configured)

### Tables

#### 1. `files`

Stores metadata for all files in the archive.

```sql
CREATE TABLE files (
    id TEXT PRIMARY KEY,              -- UUID
    original_path TEXT NOT NULL,      -- Path in cloud service
    local_path TEXT NOT NULL UNIQUE,  -- Path on local filesystem
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,          -- MIME type
    file_size INTEGER NOT NULL,       -- Bytes
    category TEXT,                    -- Auto-categorized (photos, documents, videos, etc.)
    tags TEXT,                        -- JSON array of tags
    source TEXT NOT NULL,             -- 'google_drive', 'dropbox', 'manual_upload', etc.
    created_at DATETIME NOT NULL,
    modified_at DATETIME NOT NULL,
    migrated_at DATETIME NOT NULL,
    checksum TEXT NOT NULL,           -- SHA-256 hash for integrity
    encrypted BOOLEAN DEFAULT 0,
    metadata TEXT                     -- JSON blob for additional metadata
);

CREATE INDEX idx_files_category ON files(category);
CREATE INDEX idx_files_file_type ON files(file_type);
CREATE INDEX idx_files_created_at ON files(created_at);
CREATE INDEX idx_files_source ON files(source);
```

#### 2. `devices`

Stores information about paired devices.

```sql
CREATE TABLE devices (
    id TEXT PRIMARY KEY,              -- UUID
    name TEXT NOT NULL,               -- User-friendly name
    type TEXT NOT NULL,               -- 'phone', 'tablet', 'laptop', 'web'
    last_seen DATETIME NOT NULL,
    paired_at DATETIME NOT NULL,
    auth_token TEXT NOT NULL UNIQUE,  -- For authentication
    ip_address TEXT
);
```

#### 3. `migrations`

Tracks migration jobs from cloud services.

```sql
CREATE TABLE migrations (
    id TEXT PRIMARY KEY,              -- UUID
    source TEXT NOT NULL,             -- 'google_drive', 'dropbox', etc.
    status TEXT NOT NULL,             -- 'pending', 'in_progress', 'completed', 'failed'
    total_files INTEGER,
    files_migrated INTEGER DEFAULT 0,
    total_size INTEGER,
    bytes_migrated INTEGER DEFAULT 0,
    started_at DATETIME,
    completed_at DATETIME,
    error_message TEXT
);
```

#### 4. `tags`

Stores unique tags for fast autocomplete.

```sql
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag TEXT NOT NULL UNIQUE,
    usage_count INTEGER DEFAULT 1
);

CREATE INDEX idx_tags_tag ON tags(tag);
```

---

## API Specifications

### Extension ↔ Desktop App Communication

**Protocol:** WebSocket

**Connection:** `ws://localhost:9876`

**Authentication:** Shared secret token (generated on first connection)

#### Messages (Extension → Desktop App)

**1. File Transfer**

```json
{
  "type": "file:transfer",
  "data": {
    "migrationId": "uuid",
    "file": {
      "originalPath": "/My Drive/Photos/vacation.jpg",
      "filename": "vacation.jpg",
      "mimeType": "image/jpeg",
      "size": 2048576,
      "content": "base64_encoded_content",
      "checksum": "sha256_hash",
      "source": "google_drive",
      "createdAt": "2024-01-15T10:30:00Z",
      "modifiedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

**2. Migration Progress**

```json
{
  "type": "migration:progress",
  "data": {
    "migrationId": "uuid",
    "totalFiles": 1247,
    "filesMigrated": 523,
    "totalSize": 5368709120,
    "bytesMigrated": 2147483648
  }
}
```

**3. Migration Complete**

```json
{
  "type": "migration:complete",
  "data": {
    "migrationId": "uuid",
    "totalFiles": 1247,
    "totalSize": 5368709120,
    "duration": 1800
  }
}
```

#### Messages (Desktop App → Extension)

**1. Acknowledgment**

```json
{
  "type": "file:received",
  "data": {
    "fileId": "uuid",
    "status": "success"
  }
}
```

**2. Error**

```json
{
  "type": "error",
  "data": {
    "message": "Failed to save file",
    "code": "DISK_FULL"
  }
}
```

---

### Network Hub REST API

**Base URL:** `http://192.168.x.x:8080/api`

**Authentication:** Bearer token (obtained via QR code pairing)

#### Endpoints

**1. List Files**

```
GET /api/files?category=photos&limit=50&offset=0
```

Response:
```json
{
  "files": [
    {
      "id": "uuid",
      "filename": "vacation.jpg",
      "fileType": "image/jpeg",
      "fileSize": 2048576,
      "category": "photos",
      "tags": ["vacation", "beach", "2024"],
      "createdAt": "2024-01-15T10:30:00Z",
      "thumbnailUrl": "/api/files/uuid/thumbnail"
    }
  ],
  "total": 1247,
  "limit": 50,
  "offset": 0
}
```

**2. Download File**

```
GET /api/files/:id/download
```

Response: File stream with appropriate headers

**3. Upload File**

```
POST /api/files/upload
Content-Type: multipart/form-data
```

Body:
```
file: <binary>
category: "photos" (optional)
tags: ["tag1", "tag2"] (optional)
```

Response:
```json
{
  "id": "uuid",
  "filename": "photo.jpg",
  "status": "uploaded"
}
```

**4. Search Files**

```
GET /api/search?q=vacation&type=image
```

Response:
```json
{
  "results": [
    {
      "id": "uuid",
      "filename": "vacation.jpg",
      "relevance": 0.95
    }
  ],
  "total": 15
}
```

---

## File Organization Logic

### Automatic Categorization

Files are automatically categorized based on MIME type and content analysis:

| Category | MIME Types | Examples |
|:---------|:-----------|:---------|
| **Photos** | image/jpeg, image/png, image/heic | vacation.jpg, screenshot.png |
| **Videos** | video/mp4, video/mov, video/avi | family_video.mp4 |
| **Documents** | application/pdf, text/*, application/msword | report.pdf, notes.txt |
| **Music** | audio/mp3, audio/wav, audio/flac | song.mp3 |
| **Archives** | application/zip, application/x-rar | backup.zip |
| **Code** | text/x-python, text/x-java, application/json | script.py, config.json |
| **Other** | * | Any uncategorized file |

### Directory Structure

Files are organized on disk as follows:

```
/LivingNexusArchive/
├── Photos/
│   ├── 2024/
│   │   ├── January/
│   │   ├── February/
│   │   └── ...
│   └── 2025/
├── Videos/
│   └── 2024/
├── Documents/
│   ├── Work/
│   ├── Personal/
│   └── Receipts/
├── Music/
├── Archives/
├── Code/
└── Other/
```

### AI-Powered Tagging

A local AI model (TensorFlow.js or ONNX Runtime) analyzes files and generates tags:

- **Images:** Object detection (e.g., "beach", "sunset", "people")
- **Documents:** Keyword extraction (e.g., "invoice", "contract", "meeting notes")
- **Videos:** Scene detection (future feature)

**Model:** MobileNet (for images), DistilBERT (for text)

---

## Security & Privacy

### Encryption

- **At Rest:** All files encrypted with AES-256 (optional, user-configurable)
- **In Transit:** TLS 1.3 for Network Hub (self-signed cert for local network)
- **Database:** SQLite database encrypted with SQLCipher (optional)

### Authentication

- **Device Pairing:** QR code generates a unique auth token
- **Token Storage:** Tokens stored in SQLite, hashed with bcrypt
- **Session Management:** JWT tokens with 30-day expiration

### Privacy Guarantees

1. **No Cloud Dependency:** After migration, no data sent to cloud services
2. **No Telemetry:** No usage data collected or sent
3. **No Third-Party Services:** All AI processing happens locally
4. **Open Source:** Core components will be open-sourced for audit

---

## Technology Stack

### Browser Extension

| Component | Technology |
|:----------|:-----------|
| Language | TypeScript |
| Build Tool | Webpack |
| API Clients | Axios |
| Storage | Chrome Storage API |

### Desktop App

| Component | Technology |
|:----------|:-----------|
| Framework | Electron 28+ |
| Frontend | React 18 + TypeScript |
| UI Library | Tailwind CSS + Lucide Icons |
| State Management | React Context + Hooks |
| Database | SQLite3 (better-sqlite3) |
| Server | Express.js |
| WebSocket | ws library |
| AI | TensorFlow.js or ONNX Runtime |
| Encryption | crypto (Node.js built-in) |
| Build Tool | Vite + electron-builder |

### Network Hub

| Component | Technology |
|:----------|:-----------|
| Server | Express.js |
| WebSocket | ws library |
| Authentication | JWT (jsonwebtoken) |
| File Serving | express.static + send |

### Development Tools

| Tool | Purpose |
|:-----|:--------|
| ESLint | Code linting |
| Prettier | Code formatting |
| Jest | Unit testing |
| Playwright | E2E testing |
| GitHub Actions | CI/CD |

---

## Development Roadmap

### Phase 1: Technical Architecture (Week 1)
- ✅ Define system architecture
- ✅ Design database schema
- ✅ Specify APIs
- ✅ Choose technology stack

### Phase 2: UI Design (Week 2)
- Design File Browser UI
- Design Migration Wizard UI
- Design Settings Panel UI
- Create mobile app mockups

### Phase 3: Browser Extension (Week 3-5)
- Set up Chrome Extension project
- Implement Google Drive API integration
- Implement Dropbox API integration
- Implement file download logic
- Implement WebSocket communication with Desktop App
- Add progress tracking and error handling

### Phase 4: Desktop App - Core (Week 6-8)
- Set up Electron project
- Implement file receiver (WebSocket server)
- Implement file organizer (categorization logic)
- Implement SQLite database layer
- Implement encryption layer

### Phase 5: Desktop App - UI (Week 9-10)
- Build File Browser component
- Build Migration Wizard component
- Build Settings Panel component
- Integrate with backend services

### Phase 6: Network Hub (Week 11)
- Implement Express.js server
- Implement REST API endpoints
- Implement WebSocket for real-time sync
- Implement device pairing (QR code)

### Phase 7: Integration & Testing (Week 12)
- End-to-end testing (Extension → Desktop → Network Hub)
- Bug fixes and optimization
- Performance testing (large file sets)
- Security audit

### Phase 8: Documentation & Packaging (Week 13)
- Write user manual
- Create demo video
- Build installers (Windows .exe, macOS .dmg)
- Package extension for Chrome Web Store
- Prepare for launch

---

## Next Steps

1. **Review this architecture document** and provide feedback
2. **Start Phase 2: UI Design** - Create mockups for File Browser and Migration Wizard
3. **Set up development environment** - Install tools and dependencies
4. **Begin Phase 3: Browser Extension** - Start building the migration tool

---

**Document Version:** 1.0  
**Last Updated:** October 16, 2025  
**Author:** Living Nexus Archive Team  
**Status:** Ready for Implementation

