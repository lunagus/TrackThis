# trackthis

A high-velocity, local-first media checking and tracker synchronization platform. Blitz through hundreds of titles in virtualized batch grids or pick one-by-one in fast poll mode. No accounts, no server tracking, 100% offline-capable.

---

## Features

- **Dual Interaction Modes** -- Virtualized batch grid for rapid multi-title curation and fast-pick Poll mode with tactile hotkeys and mobile touch swipe gestures.
- **Local-First IndexedDB Engine** -- All decisions, filter configurations, and active session checkpoints persist directly in your browser with zero remote server tracking.
- **Rate-Limited Cloud Sync** -- Paced background synchronization worker for AniList (GraphQL 2.5s queue adhering to the 24 req/min limit) and MyAnimeList (OAuth2 PKCE flow with 350ms delay) preventing HTTP 429 throttling.
- **Universal Multi-Platform Export** -- Instant client-side export to MyAnimeList/AniList XML (with mandatory `<update_on_import>1</update_on_import>`), full state JSON, tabular CSV spreadsheets, and TXT watched lists.
- **Multi-Format Backup Import** -- Drag-and-drop file import engine that parses, validates, and merges remote or local JSON, XML, and CSV archives directly into your local database.
- **Manga Panel Material Design 3** -- High-contrast dark theme with solid tactile containers, vibrant electric cyan and crimson decision states, zero glossy glassmorphism, and responsive live Triage HUD.
- **Granular Multi-Facet Filters** -- Zero-latency client-side filtering by format (TV, Movie, OVA, ONA, Special), demographic, genre with AND/OR match logic, release year range, SFW mode, and comprehensive title search (English, Romaji, and native Japanese).
- **Session Recovery & Exit Guard** -- Automatic session resumption restoring exact scroll and filter states, paired with an unsaved change detection guard before tab unload.
- **Strict Vector Iconography** -- Zero Unicode emojis across the entire UI and codebase, powered exclusively by clean vector SVG icons.

---

## How It Works

1. **Local-First Architecture** -- State persistence relies on client-side IndexedDB (`idb`) rather than synchronous storage or centralized servers. User decisions, filter preferences, and session checkpoints are written non-blockingly in under 2 milliseconds, ensuring total data ownership and offline resilience.
2. **Decoupled Catalog Curation** -- Browsing is decoupled from live third-party tracker APIs using precompiled metadata indices. By ingesting offline datasets cross-referenced across AniList, MyAnimeList, and database identifiers, users can triage up to 500 titles simultaneously without incurring third-party rate limits.
3. **Throttled Queue Sync Worker** -- When synchronizing with cloud services, an asynchronous token-bucket queue paces outgoing mutations safely below AniList (24 req/min) and MyAnimeList (350ms interval) ceilings, completely protecting your account from HTTP 429 blocks.

---

## Acknowledgements

TrackThis is built with and powered by the following free and open-source datasets, APIs, and libraries:

- [manami-project/anime-offline-database](https://github.com/manami-project/anime-offline-database) -- Open-source offline anime database providing core titles, formats, studios, and genres under the [Open Database License (ODbL) v1.0](https://opendatacommons.org/licenses/odbl/1-0/).
- [Fribb/anime-lists](https://github.com/Fribb/anime-lists) -- Comprehensive cross-reference database mapping MyAnimeList, AniList, Kitsu, AniDB, and IMDb identifiers (Public Domain / Unlicense).
- [AniList GraphQL API](https://anilist.gitbook.io/anilist-apiv2-docs/) -- Public GraphQL endpoint providing verified cover artwork, banner backdrops, ratings, and media list sync capabilities.
- [MyAnimeList API v2](https://myanimelist.net/apiconfig/references/api/v2) -- REST API v2 providing OAuth2 PKCE media list updates and XML import schema compliance.
- [Lucide Icons](https://lucide.dev/) -- Clean, open-source vector SVG icon library under the ISC License.
- [idb](https://github.com/jakearchibald/idb) -- Lightweight, Promise-based IndexedDB wrapper by Jake Archibald (MIT License).
- [Tailwind CSS](https://tailwindcss.com/) & [React](https://react.dev/) -- Modern UI framework and utility-first styling engine.

---

## Roadmap

- [x] Fast-pick Poll mode with keyboard controls (Y, N, Space, Z) and mobile touch swipe gestures
- [x] Local-first persistence using browser IndexedDB with session resume banner
- [x] Multi-format export engine (MAL/AniList XML, full state JSON, CSV spreadsheet, TXT watched list)
- [x] Client-side backup import supporting JSON, XML, and CSV file validation and merge
- [x] Background sync worker adhering to AniList (24 req/min) and MyAnimeList (350ms delay) rate limits
- [ ] Movies vertical (`/movies`) with TMDB cross-indexing and Letterboxd CSV export
- [ ] Books vertical (`/books`) with OpenLibrary metadata integration and Goodreads/StoryGraph CSV export
- [ ] Music vertical (`/music`) with Last.fm & Spotify library integration
- [ ] Progressive Web App (PWA) with full offline service worker caching
- [ ] Custom user lists and tag management

---

## Contributing

Contributions are welcome. If you'd like to improve trackthis, feel free to submit a Pull Request.

To report bugs or request features: [github.com/lunagus/trackthis/issues](https://github.com/lunagus/trackthis/issues)

---

## License

[GPL-3.0](LICENSE)
