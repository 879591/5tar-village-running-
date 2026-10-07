# 5tar Village Runner — Architecture & YouTube Playables Readiness Guide

## Project Structure

- `/src/config/gameConfig.ts` — Centralized game title, developer credits, social links, and difficulty tuning parameters.
- `/src/assets/villageArtwork.ts` — Original Indian village environment zones (`GREEN_FIELDS`, `VILLAGE_HOUSES`, `FARM_LANDS`, `RIVER_BRIDGE`, `VILLAGE_MARKET`) and obstacle specifications.
- `/src/audio/soundEngine.ts` — 100% original procedural Web Audio API sound effects and Indian folk pentatonic background music generator (zero external MP3 dependencies).
- `/src/scripts/gameEngine.ts` — Core 3-lane endless runner simulation, object pooling (`obstacles`, `coinPool`, `sceneryPool`, `particles`), fair collision detection, and difficulty scaling.
- `/src/scripts/storage.ts` — LocalStorage persistence for `bestScore`, `totalCoins`, and `settings` (`musicEnabled`, `soundEnabled`, `vibrationEnabled`).
- `/src/scenes/VillageCanvasRenderer.ts` — High-FPS 2.5D HTML5 Canvas renderer with perspective projection, village props, coins, obstacles, and 4-state runner character animation.
- `/src/ui/GameScreens.tsx` — Responsive mobile-first UI screens (Splash, Main Menu, How to Play, Settings, About Developer, HUD, Countdown, Pause, Result Screen).
- `/src/images/logo_5tar.svg` — Original 5tar emblem vector asset.

## YouTube Playables Preparation

When preparing a build specifically for YouTube Playables submission:
1. Open `/src/config/gameConfig.ts`.
2. Set `isPlayablesBuild: true`. This automatically hides external social media links in the About Developer screen so the build complies with strict embedded Playables policies.
