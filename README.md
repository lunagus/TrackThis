# TrackThis

High-Velocity, Local-First Media Tracking and Synchronization Platform (`trackthis.cc`).

TrackThis is an ultra-fast, offline-capable media tracker engineered for high-volume catalog curation. It features a Manga Panel Material Design 3 (M3) Dark Theme, zero server-side list tracking, and multi-format export/sync capabilities.

---

## Key Features

### 1. Dual Interaction UX Modes
- **Mode A (Virtualized Batch Grid)**:
  - Supports 1 to 500 tiles per page with instantaneous render speed.
  - Neutral UNDECIDED starting state with dual [YES] / [NO] comfort pills.
  - Selected states: Electric Cyan (#00E5FF) for Seen, Vivid Red (#FF5252) for Not Seen.
  - Sweep Action: "Mark Remaining on Page as No & Advance" sweeps all undecided items on the active page and navigates forward.
- **Mode B (One-by-One Fast-Pick Poll Mode)**:
  - Single large manga hero card with backdrop banner, synopsis, format, studio, and ratings.
  - Keyboard navigation:
    - ArrowRight / Y: YES (Seen)
    - ArrowLeft / N: NO (Not Seen)
    - Space / ArrowDown: Skip Title
    - Z / ArrowUp: Undo Last Action (50-item stack)
  - Mobile touch swipe gestures (Swipe Right = Seen, Swipe Left = Not Seen).
  - Background asset preloading for sub-150ms card transitions.

### 2. Design System: Manga Panel Material 3 Dark Theme
- **Color Tokens**:
  - Canvas Background: `#0B0F14`
  - Primary Surface: `#121820`
  - Elevated Surface: `#1A222D`
  - Manga Panel Outline: `2px solid #263238`
  - Hover Elevation: White border outline with cyan offset drop-shadow
  - Electric Cyan Accent: `#00E5FF`
  - Negative Decision Accent: `#FF5252`
- **Branding**:
  - Custom SVG logo featuring an electric cyan heart containing a crisp white plus sign within a circular dark badge.
- **No Emojis**:
  - Strict vector-only iconography powered by Lucide React. Zero Unicode emojis used throughout the UI and codebase.

### 3. Local-First IndexedDB Storage
- All decisions, session states, and timestamps are saved directly to the user's browser using `idb` (IndexedDB).
- **Session Resume**: Displays an M3 resume banner upon return, allowing users to jump back to their last active page and review state.
- **Exit Guard**: `beforeunload` event handler prevents accidental window closure when unexported or unsynced decisions are pending.

### 4. Dual Export & Sync Engine
- **Client-Side File Exports**:
  - **MyAnimeList / AniList XML**: Fully compliant XML containing the mandatory `<update_on_import>1</update_on_import>` tag.
  - **Full State Backup (JSON)**: Complete state snapshot with metadata and timestamps.
  - **Decisions Spreadsheet (CSV)**: Tabular data with cross-platform IDs (MAL, AniList, Kitsu, AniDB).
  - **Seen Plaintext (TXT)**: Formatted list of all watched titles.
  - **Letterboxd / IMDb (CSV)**: Movie tracking schema.
  - **Goodreads / StoryGraph (CSV)**: Book tracking schema.
- **Import Engine**:
  - Automatically parses and validates uploaded `.json`, `.xml`, or `.csv` files and merges them into the local database.
- **Rate-Limited Cloud Sync**:
  - AniList GraphQL throttled queue conforming to the official 24 requests/minute rate limit.
  - MyAnimeList API v2 PKCE flow generator with throttled retry logic.

### 5. Multi-Facet Filtering & Search
- Full debounced text search across English, Romaji, and native Japanese titles.
- Decision status filters (All, Undecided Only, Seen Only, Not Seen Only).
- Distinct Demographic facets (Shounen, Shoujo, Seinen, Josei, Kids).
- Genre tag filtering with AND/OR match mode toggle.
- Release year range slider (1980 - 2025).
- Media format filters (TV, Movie, OVA, ONA, Special).
- Safe for Work (SFW) toggle.

### 6. Legal & Open-Source Compliance
- Open Database License (ODbL) v1.0 attribution for `manami-project/anime-offline-database` and `Fribb/anime-lists`.
- TMDB non-commercial disclaimer.
- OpenLibrary CC0 notice.
- Comprehensive privacy policy detailing local-first architecture and zero tracker usage.

---

## Tech Stack
- **Framework**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS v4 + Custom Manga Panel Theme
- **State Management**: Zustand
- **Local Persistence**: IndexedDB via `idb`
- **Iconography**: Lucide React
- **Celebration Effects**: Canvas Confetti

---

## Getting Started

### Development
```bash
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.

### Production Build
```bash
npm run build
npm run preview
```
