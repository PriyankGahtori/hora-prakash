// src/core/dasha.js

const DASHA_SEQUENCE = [
  { name: 'Ketu',    years: 7  },
  { name: 'Venus',   years: 20 },
  { name: 'Sun',     years: 6  },
  { name: 'Moon',    years: 10 },
  { name: 'Mars',    years: 7  },
  { name: 'Rahu',    years: 18 },
  { name: 'Jupiter', years: 16 },
  { name: 'Saturn',  years: 19 },
  { name: 'Mercury', years: 17 },
]
const TOTAL_YEARS = 120

// Index in DASHA_SEQUENCE for each nakshatra (0-26)
const NAKSHATRA_DASHA_INDEX = [
  0,1,2,3,4,5,6,7,8,
  0,1,2,3,4,5,6,7,8,
  0,1,2,3,4,5,6,7,8,
]

/**
 * Compute 3-level Vimshottari dasha tree.
 * @param {object} moon  - planet object for Moon (must have lon, nakshatraIndex)
 * @param {string} dobStr - "YYYY-MM-DD"
 * @returns {DashaNode[]}
 */
export function calcDasha(moon, dobStr) {
  const nakshatraIdx = moon.nakshatraIndex
  const dashaStartIndex = NAKSHATRA_DASHA_INDEX[nakshatraIdx]

  const nakshatraSpan = 360 / 27
  const posInNakshatra = moon.lon % nakshatraSpan
  const fractionElapsed = posInNakshatra / nakshatraSpan
  const fractionRemaining = 1 - fractionElapsed
  const balanceYears = DASHA_SEQUENCE[dashaStartIndex].years * fractionRemaining

  const birthDate = new Date(dobStr + 'T00:00:00Z')
  const tree = []
  let currentDate = new Date(birthDate)

  for (let i = 0; i < 9; i++) {
    const idx = (dashaStartIndex + i) % 9
    const maha = DASHA_SEQUENCE[idx]
    const mahaDurationYears = i === 0 ? balanceYears : maha.years
    const mahaEnd = addYears(currentDate, mahaDurationYears)

    const antars = []
    let antarStart = new Date(currentDate)

    for (let j = 0; j < 9; j++) {
      const aIdx = (idx + j) % 9
      const antar = DASHA_SEQUENCE[aIdx]
      const antarYears = (mahaDurationYears * antar.years) / TOTAL_YEARS
      const antarEnd = addYears(antarStart, antarYears)

      const pratyantars = []
      let pratStart = new Date(antarStart)
      for (let k = 0; k < 9; k++) {
        const pIdx = (aIdx + k) % 9
        const prat = DASHA_SEQUENCE[pIdx]
        const pratYears = (antarYears * prat.years) / TOTAL_YEARS
        const pratEnd = addYears(pratStart, pratYears)
        pratyantars.push({ planet: prat.name, start: new Date(pratStart), end: pratEnd })
        pratStart = pratEnd
      }

      antars.push({ planet: antar.name, start: new Date(antarStart), end: antarEnd, pratyantars })
      antarStart = antarEnd
    }

    tree.push({ planet: maha.name, start: new Date(currentDate), end: mahaEnd, antars })
    currentDate = mahaEnd
  }

  return tree
}

function addYears(date, years) {
  const ms = years * 365.25 * 24 * 60 * 60 * 1000
  return new Date(date.getTime() + ms)
}

export function isCurrentPeriod(start, end) {
  const now = Date.now()
  return start.getTime() <= now && end.getTime() > now
}
