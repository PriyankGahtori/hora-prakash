# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (http://localhost:5173/hora-prakash/)
npm run build     # Production build → dist/
npm run preview   # Preview the production build locally
```

No linter or test suite is configured.

## Architecture

**Hora Prakash** is a static Vedic astrology web app built with Vite + Vanilla JS. It runs entirely in the browser — no backend.

### Startup sequence

`src/main.js` is the entry point. It:
1. Calls `initSwissEph()` — loads and initializes the `swisseph-wasm` WASM module, sets Lahiri ayanamsa
2. Calls `initTabs()` — wires up tab navigation
3. Calls `renderInputTab()` — renders the birth-details form

**SwissEph must be initialized before any calculation function is called.** `getSwe()` throws if called before init.

### State

`src/state.js` holds a single mutable object shared across all tabs:
```js
{ birth, planets, lagna, houses, dasha, panchang }
```
All fields are `null` until the user submits the form. Tabs check for null and return early if data isn't ready.

### Data flow

1. User submits birth form (`src/tabs/input.js`)
2. `toJulianDay(dob, tob, tz)` converts local time → UTC Julian Day
3. `calcBirthChart(jd, lat, lon)` → `{ planets, lagna, houses }`
4. `calcDasha(moon, dob)` → 3-level Vimshottari dasha tree (maha → antar → pratyantar)
5. `calcPanchang(jd, lat, lon)` → tithi, vara, nakshatra, yoga, karana, sunrise/sunset, kalam
6. Results written to `state`, tabs rendered, UI switches to Chart tab

### Key implementation details

**swisseph-wasm v0.0.5 quirks:**
- `calc_ut(jd, bodyId, flags)` returns `Float64Array`: `[lon, lat, dist, lonSpeed, ...]`
- Sidereal flag = `65536` (SEFLG_SIDEREAL), speed flag = `256` (SEFLG_SPEED)
- Ketu has no dedicated body ID — computed as Rahu longitude + 180°
- `rise_trans` wrapper has a known bug (passes geopos as individual args instead of pointer array), returns JD ≈ 0; guarded with `r[0] > 1000000` validity check — sunrise/sunset show `—` when invalid
- `vite.config.js` must exclude `swisseph-wasm` from `optimizeDeps` to prevent Vite pre-bundling the WASM file
- Dev server needs COOP/COEP headers for SharedArrayBuffer

**Charts (`src/ui/chart-svg.js`):**
- Renders inline SVG (no canvas, no external chart lib)
- North Indian: 12 polygons (diamonds for angular houses 1,4,7,10; triangles for others); houses counter-clockwise from top
- South Indian: fixed 4×4 sign grid (Pisces top-left, clockwise); house numbers relative to lagna sign
- Canvas size: 480×480px SVG viewBox

**External APIs (no keys required):**
- Geocoding: Nominatim (OpenStreetMap) — `https://nominatim.openstreetmap.org/search`
- Timezone: timeapi.io — `https://timeapi.io/api/TimeZone/coordinate`

**Deployment:** GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on push to `main`. Base path is `/hora-prakash/`.
