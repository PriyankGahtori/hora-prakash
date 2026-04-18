# Hora Prakash

A Vedic astrology web app that runs entirely in the browser — no backend, no API keys.

## Features

- **Birth Chart** — North Indian and South Indian SVG charts with planetary positions
- **Vimshottari Dasha** — 3-level expandable tree (Mahadasha → Antardasha → Pratyantar)
- **Panchang** — Tithi, Vara, Nakshatra, Yoga, Karana, sunrise/sunset, Rahu Kalam, Gulika Kalam
- **Location autocomplete** — powered by OpenStreetMap Nominatim
- **Defaults** — pre-filled with today's date/time and New Delhi as location

## Tech Stack

- **Vite** — build tool and dev server
- **swisseph-wasm v0.0.5** — Swiss Ephemeris compiled to WebAssembly for accurate planetary calculations
- **Vanilla JS** — no framework
- **Lahiri ayanamsa** — standard for Vedic astrology

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173/hora-prakash/](http://localhost:5173/hora-prakash/)

## Build & Deploy

```bash
npm run build     # outputs to dist/
npm run preview   # preview production build
```

Pushes to `main` automatically deploy to GitHub Pages via the included workflow.

## Calculations

All astronomy calculations use the Swiss Ephemeris (via WASM). Planetary positions are computed in the sidereal zodiac with Lahiri ayanamsa. House cusps use the Placidus system. Vimshottari dasha is calculated from the Moon's nakshatra at birth.
