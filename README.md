# Dear Lily - Aesthetic Digital Scrapbook, Photo Booth & Diary

> *Capture moments in soft pastel & coquette polaroids!*

Dear Lily is a dreamy, interactive digital scrapbook web application that combines a polaroid photo booth, a customizable notebook diary, and memory gallery scrapbooks into one cohesive pastel aesthetic experience.

---

## Features

### Aesthetic Photo Booth
- **Multiple Layouts**: 3-strip & 4-strip polaroid arrangements.
- **15+ Vintage Filters**: Film, Soft Glow, Disposable, Golden Hour, Y2K, and B&W filters.
- **Coquette Decorative Frames**: Pink Hearts, Bows, Floral Garden, Butterflies, Film Roll, Kraft, and Polaroid frames.
- **Draggable Stickers & Text**: Graphic SVG bows, kawaii emojis, and customizable typography.

### Notebook Digital Diary
- **Cozy Themes**: 14 aesthetic themes (Cottagecore, Vintage Journal, Cloud, Fairy, Coffee, Korean Journal, etc.).
- **8 Paper Styles**: Lined notebook, dot grid, square grid, kraft paper, vintage, and floral watermarks.
- **Privacy Protection**: Enable 4-digit PIN lock on private chapters.
- **High-Res JPG Export**: Download pixel-perfect journal page images.
- **Custom Folders**: Organize thoughts into custom categories.

### Memory Gallery & Scrapbooks
- **Custom Albums**: Group photo strips and diary memories into custom albums with masonry scrapbook layouts.
- **Favorites & Search**: Filter and search through all saved memories instantly.

### Profile & Scrapbook Trophies
- **Dynamic Achievements**: Real-time badges for creating photo strips, decorating pages, writing diary chapters, setting PIN locks, and creating albums.
- **Profile Customization**: Customizable display name, bio, birthday, avatar photo, and cover image.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons, `html-to-image`.
- **Backend API**: Node.js, Express.js.
- **Database & Storage**: SQLite (`better-sqlite3`), Browser IndexedDB (`DearLilyStudioDB`), and Quota-Protected `localStorage`.

---

## Getting Started Locally

```bash
# 1. Clone the repository
git clone https://github.com/nishita-20-3/dear-lily.git
cd dear-lily

# 2. Install dependencies
npm install

# 3. Build production bundle
npm run build

# 4. Start the Express + SQLite server
npm start

Open http://localhost:3001 in your browser!
