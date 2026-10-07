# 5tar Village Runner

**Developer:** 5tar Suraj (Suraj Maurya) — Independent Game Developer & Digital Creator

## 1. Game Description
**5tar Village Runner** is an original, lightweight, mobile-first 3-lane endless runner set in an Indian village-inspired environment. Players sprint continuously through green mustard fields, mud-and-thatch village homesteads, harvest farms, canal bridges, and festive village markets while dodging original village obstacles (stones, monsoon puddles, hay bales, overhead wooden gates, bazaar banners, and bullock carts) and collecting gold coins to beat their high score.

All visuals and audio are 100% original and procedurally rendered using HTML5 Canvas and the Web Audio API, allowing the game to load fast, run smoothly on low-end Android devices, and work completely offline after loading.

---

## 2. How to Run Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server (runs on port 3000):
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in any desktop or mobile browser.

---

## 3. How to Build for Production
Run the production build command:
```bash
npm run build
```
This compiles TypeScript and bundles optimized static assets into the `/dist` folder. To preview the production build locally:
```bash
npm run preview
```

---

## 4. How to Deploy
Because **5tar Village Runner** is 100% client-side and requires no backend or database, you can deploy the `/dist` folder to any static hosting provider:
- **GitHub Pages / Vercel / Netlify / Cloudflare Pages**: Connect your repository, set the build command to `npm run build`, and set the publish directory to `dist`.
- **itch.io / Poki / YouTube Playables**: Zip the contents of the `dist` directory (`index.html` at the root of the zip archive) and upload directly.

---

## 5. Controls

### Mobile / Touch Devices
- **Swipe Left** (or tap Left button): Move to left lane
- **Swipe Right** (or tap Right button): Move to right lane
- **Swipe Up** (or tap Up button): Jump over low obstacles (stones, puddles, hay bales)
- **Swipe Down** (or tap Down button): Slide under high overhead barriers (wooden gates, bazaar banners)

### Desktop (Keyboard & Mouse)
- **Arrow Left / A**: Move left
- **Arrow Right / D**: Move right
- **Arrow Up / W / Spacebar**: Jump
- **Arrow Down / S**: Slide
- **Escape / P**: Pause or Resume game
- **Mouse Drag / Swipe**: Click and drag left, right, up, or down

---

## 6. How to Change Developer Information
Open `/src/config/gameConfig.ts` and edit the `developer` object:
```ts
developer: {
  studioName: "5tar Suraj",
  developerName: "Suraj Maurya",
  roleTitle: "Independent Game Developer & Digital Creator",
  socialLinks: {
    facebook: "https://www.facebook.com/share/1FDbbX2rcH/",
    instagram: "https://www.instagram.com/5tar.suraj?stkn=OWZjNXhyb2toanZk",
    youtube: "", // Add your YouTube URL here when ready
    website: "", // Add your Website URL here when ready
  },
}
```
> **Note for YouTube Playables:** Set `isPlayablesBuild: true` in `/src/config/gameConfig.ts` to automatically hide external social links when submitting to platforms that disallow external outbound links.

---

## 7. How to Replace Assets
- **Environment Colors & Obstacles:** Edit `/src/assets/villageArtwork.ts` to customize the color palettes of the 5 village zones (`GREEN_FIELDS`, `VILLAGE_HOUSES`, `FARM_LANDS`, `RIVER_BRIDGE`, `VILLAGE_MARKET`) or obstacle properties.
- **Character & Scenery Drawing:** Edit `/src/scenes/VillageCanvasRenderer.ts` (`drawPlayer`, `drawObstacle`, `drawSceneryProp`, `drawCoin`) to adjust vector shapes or draw custom sprite images via `ctx.drawImage(...)`.
- **Audio & Music:** Edit `/src/audio/soundEngine.ts` to customize the synthesized sound effects or melody notes.

---

## 8. How to Change Difficulty
Open `/src/config/gameConfig.ts` and adjust the `difficulty` section:
```ts
difficulty: {
  initialSpeed: 320,            // Starting running speed
  maxSpeed: 820,                // Maximum speed cap (keeps game fair and playable)
  speedAcceleration: 4.5,       // Speed increase per second of survival
  initialSpawnInterval: 1.45,   // Seconds between obstacle waves at start
  minSpawnInterval: 0.62,       // Minimum seconds between obstacle waves at top speed
  coinSpawnChance: 0.78,        // Probability (0 to 1) of coin lines spawning
  doubleObstacleChanceStart: 0.15, // Chance of 2 lanes blocked early on
  doubleObstacleChanceMax: 0.65,   // Max chance of 2 lanes blocked (at least 1 lane is ALWAYS passable)
  scorePerMeter: 1,
  pointsPerCoin: 25,
}
```

---

## 9. How to Change Game Title
1. Open `/src/config/gameConfig.ts` and update `title: "5tar Village Runner"`.
2. Open `/index.html` and update the `<title>` and `<meta property="og:title">` tags to match.
3. Open `/metadata.json` and update the `"name"` field.
