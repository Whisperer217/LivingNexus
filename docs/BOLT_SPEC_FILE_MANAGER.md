# Bolt.new Specification: Living Nexus Archive File Manager

**Project Name:** LNA File Manager  
**Purpose:** Unified file management UI showing cloud and local files side-by-side  
**Target:** Chrome Extension full-page interface

---

## 🎯 Project Overview

Build a beautiful, modern file management interface that displays both cloud files (Google Drive/OneDrive) and local files in a two-pane layout. Users can see what's in the cloud vs what's already migrated locally, and perform migrations with drag-and-drop or buttons.

---

## 🎨 Design Requirements

### **Visual Style:**
- **Theme:** Dark mode (matching Living Nexus brand)
- **Colors:**
  - Background: `#1a1f2e` (dark navy)
  - Secondary background: `#141821` (darker)
  - Accent: `#10b981` (emerald green)
  - Secondary accent: `#06b6d4` (cyan)
  - Text: `#ffffff` (white) and `#94a3b8` (gray)
  - Borders: `#374151` (dark gray)
- **Effects:** Glassmorphism (frosted glass cards), subtle shadows, smooth transitions
- **Icons:** Use Lucide React icons
- **Fonts:** Inter or similar modern sans-serif

---

## 📐 Layout Structure

### **Main Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Header (Top Bar)                                                │
├─────────────────────────────────────────────────────────────────┤
│  Tab Navigation                                                  │
├──────────────────────────┬──────────────────────────────────────┤
│  LEFT PANE               │  RIGHT PANE                          │
│  (Cloud Files)           │  (Local Files)                       │
│                          │                                      │
│  - Category Sidebar      │  - Category Sidebar                  │
│  - File Grid/List        │  - File Grid/List                    │
│  - Actions               │  - Actions                           │
│                          │                                      │
└──────────────────────────┴──────────────────────────────────────┘
```

---

## 🧩 Components to Build

### **1. Header Component**

```tsx
<Header>
  - Logo: "Living Nexus Archive" with database icon
  - Search bar (global search across cloud + local)
  - View toggle: Grid / List
  - Settings button
  - User profile button
</Header>
```

**Design:**
- Height: 64px
- Background: `#141821`
- Border bottom: 1px `#374151`
- Logo on left, search in center, buttons on right

---

### **2. Tab Navigation**

```tsx
<TabNav>
  - Tab 1: "File Manager" (active)
  - Tab 2: "Sync Status"
  - Tab 3: "Storage Stats"
</TabNav>
```

**Design:**
- Horizontal tabs below header
- Active tab: emerald green underline
- Smooth transition on hover

---

### **3. Two-Pane Layout**

```tsx
<TwoPaneLayout>
  <LeftPane title="Cloud Files" source="Google Drive">
    <CategorySidebar />
    <FileGrid />
  </LeftPane>
  
  <RightPane title="Local Files" location="D:\LivingNexusArchive">
    <CategorySidebar />
    <FileGrid />
  </RightPane>
</TwoPaneLayout>
```

**Design:**
- Split 50/50
- Vertical divider in center (draggable to resize)
- Each pane has its own header showing source/location

---

### **4. Category Sidebar**

```tsx
<CategorySidebar>
  - All Files (1,247)
  - Photos (823)
  - Documents (312)
  - Videos (89)
  - Music (23)
  - Archives (15)
  - Other (45)
</CategorySidebar>
```

**Design:**
- Width: 200px
- List of categories with icons
- Show file count in gray
- Active category highlighted in emerald
- Icons: Folder, Image, FileText, Video, Music, Archive, File

---

### **5. File Grid Component**

```tsx
<FileGrid view="grid"> // or "list"
  <FileCard 
    filename="vacation.jpg"
    type="image/jpeg"
    size="2.1 MB"
    date="Jan 15, 2024"
    thumbnail="/path/to/thumb.jpg"
    status="synced" // or "cloud-only" or "local-only"
    onSelect={handleSelect}
  />
</FileGrid>
```

**Grid View Design:**
- 4-5 columns (responsive)
- Card size: ~200px x 200px
- Thumbnail image at top
- Filename below (truncate with ellipsis)
- File size and date in smaller gray text
- Status badge (cloud icon, local icon, or both)
- Checkbox for selection (top-left corner)
- Hover effect: scale up slightly, show shadow

**List View Design:**
- Table layout
- Columns: Checkbox | Icon | Name | Type | Size | Date | Status | Actions
- Row height: 48px
- Alternating row backgrounds for readability

---

### **6. File Status Badges**

```tsx
<StatusBadge status="synced" />     // ☁️💾 (cloud + local)
<StatusBadge status="cloud-only" /> // ☁️ (cloud only)
<StatusBadge status="local-only" /> // 💾 (local only)
<StatusBadge status="conflict" />   // ⚠️ (versions differ)
```

**Design:**
- Small pill-shaped badges
- Icons from Lucide (Cloud, HardDrive, AlertTriangle)
- Color-coded:
  - Synced: emerald green
  - Cloud-only: cyan blue
  - Local-only: purple
  - Conflict: orange/yellow

---

### **7. Action Buttons**

```tsx
// In Left Pane (Cloud Files)
<ActionBar>
  <Button variant="primary">
    Migrate Selected → (5 files)
  </Button>
  <Button variant="secondary">
    Migrate All → (724 files)
  </Button>
</ActionBar>

// In Right Pane (Local Files)
<ActionBar>
  <Button variant="primary">
    ← Import from Folder
  </Button>
  <Button variant="secondary">
    Select All
  </Button>
</ActionBar>
```

**Design:**
- Fixed at bottom of each pane
- Primary button: emerald gradient
- Secondary button: dark with border
- Show count of selected/total files

---

### **8. Migration Progress Modal**

```tsx
<MigrationModal isOpen={isMigrating}>
  <ProgressBar value={42} max={100} />
  <StatusText>
    Migrating 523 of 1,247 files...
    Current: vacation_photo.jpg
    Speed: 15.2 MB/s
    Time remaining: 8 minutes
  </StatusText>
  <ActionButtons>
    <Button>Pause</Button>
    <Button>Cancel</Button>
  </ActionButtons>
</MigrationModal>
```

**Design:**
- Centered modal overlay
- Dark background with glassmorphism
- Animated progress bar (emerald green)
- Real-time stats updating
- Pause/Cancel buttons at bottom

---

### **9. Storage Stats Panel** (Tab 3)

```tsx
<StorageStats>
  <CloudStorage>
    <ProgressRing value={76} max={100} />
    <Label>15.2 GB / 20 GB used</Label>
    <Insight>⚠️ 724 files not yet migrated</Insight>
  </CloudStorage>
  
  <LocalStorage>
    <ProgressRing value={2} max={100} />
    <Label>8.7 GB / 500 GB used</Label>
    <Insight>✓ 523 files in archive</Insight>
  </LocalStorage>
  
  <SavingsCalculator>
    <Text>💡 Migrate all files and save $9.99/month</Text>
    <Text>Annual savings: $119.88</Text>
  </SavingsCalculator>
</StorageStats>
```

**Design:**
- Two large circular progress rings (donut charts)
- Cloud storage on left, local on right
- Color-coded (cloud = cyan, local = emerald)
- Insights below each ring
- Savings calculator at bottom

---

## 📊 Mock Data

Use this mock data to populate the UI:

### **Cloud Files (Google Drive):**

```javascript
const cloudFiles = [
  {
    id: '1',
    filename: 'vacation.jpg',
    type: 'image/jpeg',
    size: 2097152, // 2.1 MB
    date: '2024-01-15T10:30:00Z',
    category: 'photos',
    thumbnail: 'https://picsum.photos/200?random=1',
    status: 'synced' // exists in both cloud and local
  },
  {
    id: '2',
    filename: 'birthday.jpg',
    type: 'image/jpeg',
    size: 3407872, // 3.4 MB
    date: '2024-03-10T14:20:00Z',
    category: 'photos',
    thumbnail: 'https://picsum.photos/200?random=2',
    status: 'cloud-only' // only in cloud
  },
  {
    id: '3',
    filename: 'report.pdf',
    type: 'application/pdf',
    size: 524288, // 512 KB
    date: '2024-02-20T09:15:00Z',
    category: 'documents',
    thumbnail: null,
    status: 'synced'
  },
  {
    id: '4',
    filename: 'family_video.mp4',
    type: 'video/mp4',
    size: 52428800, // 50 MB
    date: '2024-04-05T16:45:00Z',
    category: 'videos',
    thumbnail: 'https://picsum.photos/200?random=4',
    status: 'cloud-only'
  },
  // Add 20-30 more files with variety
];
```

### **Local Files:**

```javascript
const localFiles = [
  {
    id: '1',
    filename: 'vacation.jpg',
    type: 'image/jpeg',
    size: 2097152,
    date: '2024-01-15T10:30:00Z',
    category: 'photos',
    thumbnail: 'https://picsum.photos/200?random=1',
    status: 'synced',
    localPath: 'D:\\LivingNexusArchive\\Photos\\2024\\January\\vacation.jpg'
  },
  {
    id: '5',
    filename: 'family.jpg',
    type: 'image/jpeg',
    size: 1835008, // 1.8 MB
    date: '2024-05-12T11:00:00Z',
    category: 'photos',
    thumbnail: 'https://picsum.photos/200?random=5',
    status: 'local-only', // only in local storage
    localPath: 'D:\\LivingNexusArchive\\Photos\\2024\\May\\family.jpg'
  },
  // Add 20-30 more files
];
```

---

## 🎬 Interactions & Behaviors

### **1. File Selection**
- Click checkbox to select file
- Shift+click to select range
- Ctrl+click to multi-select
- Selected files highlighted with emerald border
- Selection count shown in action buttons

### **2. Drag & Drop** (Optional for v1)
- Drag file from cloud pane → local pane = Migrate
- Drag file from local pane → cloud pane = Upload (future)
- Show drop zone highlight when dragging

### **3. Search**
- Global search bar in header
- Searches both cloud and local files
- Real-time filtering as you type
- Show results count

### **4. View Toggle**
- Switch between Grid and List view
- Preference saved in localStorage
- Smooth transition animation

### **5. Category Filter**
- Click category in sidebar to filter
- Active category highlighted
- File count updates in real-time

### **6. Migration Flow**
1. User selects files in cloud pane
2. Clicks "Migrate Selected →"
3. Modal opens showing progress
4. Files download and appear in local pane
5. Status badges update to "synced"
6. Success notification

---

## 🛠️ Technical Requirements

### **Tech Stack:**
- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State Management:** React hooks (useState, useContext)
- **Build Tool:** Vite

### **Key Features:**
- Responsive design (works on desktop, tablet)
- Dark mode only (matches brand)
- Smooth animations (framer-motion optional)
- Accessible (keyboard navigation, ARIA labels)

### **File Structure:**
```
src/
├── components/
│   ├── Header.tsx
│   ├── TabNav.tsx
│   ├── TwoPaneLayout.tsx
│   ├── CategorySidebar.tsx
│   ├── FileGrid.tsx
│   ├── FileCard.tsx
│   ├── FileListRow.tsx
│   ├── StatusBadge.tsx
│   ├── ActionBar.tsx
│   ├── MigrationModal.tsx
│   └── StorageStats.tsx
├── data/
│   └── mockFiles.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

---

## 📝 TypeScript Types

```typescript
export type FileStatus = 'synced' | 'cloud-only' | 'local-only' | 'conflict';

export type FileCategory = 'photos' | 'documents' | 'videos' | 'music' | 'archives' | 'other';

export interface File {
  id: string;
  filename: string;
  type: string; // MIME type
  size: number; // bytes
  date: string; // ISO 8601
  category: FileCategory;
  thumbnail?: string;
  status: FileStatus;
  localPath?: string;
  cloudPath?: string;
  checksum?: string;
}

export interface CategoryCount {
  category: FileCategory;
  count: number;
  totalSize: number;
}

export type ViewMode = 'grid' | 'list';
```

---

## 🎯 Success Criteria

The Bolt.new project is successful if:

1. ✅ Two-pane layout displays cloud and local files side-by-side
2. ✅ Files can be selected via checkboxes
3. ✅ Category sidebar filters work
4. ✅ Grid and List view toggle works
5. ✅ Status badges show correctly (synced, cloud-only, local-only)
6. ✅ "Migrate Selected" button shows count
7. ✅ Migration modal displays with progress bar
8. ✅ Design matches Living Nexus brand (dark theme, emerald accents)
9. ✅ Responsive and smooth animations
10. ✅ Mock data populates both panes

---

## 🚀 Bolt.new Prompt

**Copy this to Bolt.new:**

```
Build a file management interface for "Living Nexus Archive" - a data sovereignty platform.

Create a two-pane layout showing cloud files (left) and local files (right) side-by-side.

DESIGN:
- Dark theme: background #1a1f2e, accent emerald green #10b981
- Glassmorphism effects (frosted glass cards)
- Use Lucide React icons
- Tailwind CSS for styling

LAYOUT:
- Header with logo, search bar, view toggle (grid/list), settings
- Tab navigation (File Manager, Sync Status, Storage Stats)
- Two equal panes (cloud | local) with vertical divider
- Each pane has: category sidebar (left), file grid/list (center), action buttons (bottom)

FEATURES:
- Category sidebar: All Files, Photos, Documents, Videos, Music (with counts)
- File cards with thumbnail, filename, size, date, status badge
- Status badges: synced (☁️💾), cloud-only (☁️), local-only (💾)
- Checkbox selection (multi-select)
- Action buttons: "Migrate Selected →" (show count), "Migrate All →"
- Migration modal with progress bar and stats

Use mock data with 20-30 files in each pane. Make it beautiful, modern, and functional.

Tech stack: React + TypeScript + Tailwind + Vite
```

---

**Ready to paste into Bolt.new!** 🚀

