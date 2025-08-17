# Manga PDF Viewer

A manga-specialized PDF viewer that runs in browsers. Supports reading directions for both Japanese manga and Western comics, and operates as a PWA (Progressive Web App).

## ✨ Key Features

### 📖 Display Functions

- **Single Page Display** - View one page at a time
- **Spread View** - Display two pages simultaneously (magazine style)
- **Cover Mode** - Configurable handling of the first page in spread view
- **Reading Direction Support** - Japanese manga (right → left) and Western comics (left → right)

### 🎮 Controls

- **Mouse Operations** - Click, wheel zoom
- **Keyboard Operations** - Arrow keys, zoom, fullscreen
- **Touch Operations** - Swipe, pinch zoom, tap (automatic reading direction adaptation)

### 🎨 UI/UX

- **Manual Toggle UI** - Hidden mode for focused reading
- **Responsive Design** - Desktop, tablet, and smartphone support
- **Dark Mode Support** - Eye-friendly display settings

### 📱 PWA Features

- **Offline Support** - Available without internet connection
- **Installable** - Add to home screen for native app-like usage
- **Auto-update** - Automatic detection and notification of new versions

## 🚀 Usage

### 1. Access

Access the following URL in your browser:

```
https://ushiboy.github.io/manga-pdf-viewer/
```

### 2. Loading PDF Files

- **File Selection**: "Select File" button in the header
- **Drag & Drop**: Drop PDF files onto the screen

### 3. Basic Controls

| Action     | Mouse       | Keyboard | Touch            |
| ---------- | ----------- | -------- | ---------------- |
| Next Page  | Left Click  | → Key    | Right Swipe/Tap  |
| Prev Page  | Right Click | ← Key    | Left Swipe/Tap   |
| Zoom       | Wheel       | +/-      | Pinch            |
| Fullscreen | Button      | F11      | -                |
| View Toggle| Button      | V        | -                |

### 4. PWA Installation

1. Select "Add to Home Screen" from browser menu
2. Or click the install icon in the address bar
3. Launch as an app from the home screen

## 🏗️ Development Environment

### Requirements

- Node.js 22.x or higher
- pnpm (recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/ushiboy/manga-pdf-viewer.git
cd manga-pdf-viewer

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Development Commands

```bash
# Start development server
pnpm dev

# Type check
pnpm type-check

# Build
pnpm build

# Preview
pnpm preview
```

## 📄 License

This project is released under the MIT License. See the [LICENSE](LICENSE) file for details.