# 🎵 MusicFlow

[![Screenshot-2026-02-14-205941.png](https://i.postimg.cc/JhT9xLVx/Screenshot-2026-02-14-205941.png)](https://postimg.cc/06wW5hNK)

> **A beautiful, modern MP3 player that reads and displays all your ID3 tag data**  

![TypeScript](https://img.shields.io/badge/TypeScript-99.3%25-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black?logo=vercel)

## ✨ Features

### 🎨 **Dynamic Visual Experience**
- **Color extraction** from album art using ColorThief - the UI adapts to your music's colors
- **Animated particle background** that responds to your presence
- **Smooth gradients and glass-morphism** effects throughout

### 📊 **Complete ID3 Tag Support**
- Displays **all metadata** from your MP3 files:
  - Title, Artist, Album
  - Year, Genre, Track number
  - Composer, Comment
  - **Full lyrics** (USLT/SYLT frames)
  - Album art extraction
- **Toggle display settings** to show/hide specific metadata

### 🎮 **Advanced Music Player**
- **Full playback controls** with keyboard shortcuts
  - Space: Play/Pause
  - Arrow keys: Skip forward/backward (10s)
  - Arrow Up/Down: Volume control
  - M: Mute, S: Shuffle, R: Repeat
- **Playback speed control** (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
- **Shuffle and repeat modes** (Repeat All / Repeat One)
- **Drag-and-drop playlist reordering**
- **Visual progress bar** with seek functionality

### 📱 **Modern Interface**
- **Responsive 3-column layout**:
  - Album art display
  - ID3 tag viewer with lyrics section
  - Playlist queue
- **Sleek music player** at the bottom (25vh)
- **Beautiful file selector** with drag-and-drop support
- **Floating music notes** and animated elements

## 🛠️ Built With

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[music-metadata-browser](https://github.com/Borewit/music-metadata-browser)** - ID3 tag parsing
- **[ColorThief](https://github.com/lokesh/color-thief)** - Color extraction from album art
- **[Lucide React](https://lucide.netlify.app/)** - Beautiful icons

## 🚀 Live Demo

The app is live at: **[https://music-flow-amber.vercel.app](https://music-flow-amber.vercel.app)**

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or later, **npm**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/divyakelaskar/MusicFlow.git
   cd MusicFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 📖 How to Use

1. **Launch the app** - You'll see the animated landing page
2. **Click "Get Started"** or navigate to `/player`
3. **Upload your MP3 files**:
   - Drag and drop files anywhere on the file selector
   - Or click to browse your computer
4. **Watch the magic happen**:
   - Album art is automatically extracted
   - Colors adapt to match your album art
   - All ID3 tags are displayed beautifully
5. **Control playback**:
   - Play/pause, skip, adjust volume
   - Toggle shuffle and repeat modes
   - Click on playlist items to switch songs
   - Drag to reorder your playlist
6. **Customize display**:
   - Click the gear icon to toggle which metadata fields to show
   - View lyrics in the dedicated section

## 📁 Project Structure

```
MusicFlow/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page with animations
│   └── player/            # Player page route
│       └── page.tsx       # Main player component
├── components/            # React components
│   ├── FileSelector.tsx   # Drag-drop file upload
│   ├── MusicPlayer.tsx    # Audio controls & playback
│   ├── PlaylistQueue.tsx  # Playlist management
│   └── DisplaySettings.tsx # Metadata visibility toggles
├── types/                 # TypeScript definitions
│   ├── colorthief.d.ts    # ColorThief type declarations
│   └── index.ts           # Shared interfaces
├── utils/                 # Utility functions
│   └── id3Reader.ts       # ID3 tag extraction logic
├── public/                # Static assets
└── ...config files
```

## 🎯 Key Features Deep Dive

### ID3 Tag Extraction
The app uses `music-metadata-browser` to extract comprehensive metadata:
- **Common tags**: Title, artist, album, year, genre
- **Advanced tags**: Composer, publisher, BPM, comments
- **Lyrics**: Full support for USLT and SYLT frames
- **Album art**: Automatic extraction and display

### Dynamic Color System
- Album art colors are analyzed to create a harmonious UI
- Background, headings, and accents adapt to each song
- Text contrast is automatically calculated for readability

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `←` | Skip backward 10s |
| `→` | Skip forward 10s |
| `↑` | Volume up |
| `↓` | Volume down |
| `M` | Toggle mute |
| `S` | Toggle shuffle |
| `R` | Cycle repeat modes |

## 🙏 Acknowledgments

- [music-metadata-browser](https://github.com/Borewit/music-metadata-browser) for ID3 parsing
- [ColorThief](https://github.com/lokesh/color-thief) for color extraction
- [Vercel](https://vercel.com) for hosting

---

<p align="center">
  <a href="https://music-flow-amber.vercel.app">
    <img src="https://img.shields.io/badge/Try%20MusicFlow%20Now-9333EA?style=for-the-badge&logo=vercel&logoColor=white" alt="Try MusicFlow Now">
  </a>
</p>

<p align="center">Made with ❤️ for music lovers who appreciate their local files</p>
