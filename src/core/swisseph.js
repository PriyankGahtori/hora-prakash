// src/core/swisseph.js
// Wraps swisseph-wasm (class-based API: new SwissEph(), await swe.initSwissEph())

let swe = null

export async function initSwissEph() {
  if (swe) return swe

  const mod = await import('swisseph-wasm')
  const SwissEph = mod.default
  const instance = new SwissEph()
  await instance.initSwissEph()

  // Set Lahiri ayanamsa (SE_SIDM_LAHIRI = 1)
  instance.swe_set_sid_mode(1, 0, 0)

  swe = instance
  return swe
}

export function getSwe() {
  if (!swe) throw new Error('SwissEph not initialized — call initSwissEph() first')
  return swe
}

// Planet IDs used throughout the app
export const PLANETS = [
  { id: 0,  name: 'Sun',     abbr: 'Su' },
  { id: 1,  name: 'Moon',    abbr: 'Mo' },
  { id: 2,  name: 'Mercury', abbr: 'Me' },
  { id: 3,  name: 'Venus',   abbr: 'Ve' },
  { id: 4,  name: 'Mars',    abbr: 'Ma' },
  { id: 5,  name: 'Jupiter', abbr: 'Ju' },
  { id: 6,  name: 'Saturn',  abbr: 'Sa' },
  { id: 11, name: 'Rahu',    abbr: 'Ra' },
  { id: 11, name: 'Ketu',    abbr: 'Ke', isKetu: true },
]
