// src/ui/chart-svg.js
// Reference: https://github.com/VicharaVandana/jyotichart

const S = 400

// North Indian chart — houses go counter-clockwise from top center.
// Angular houses (1,4,7,10) are diamonds; others are triangles.
// Normalized 0-1 coords derived from jyotichart reference (420px, range 10-410).
const NI_POLYS = {
  1:  [[1/2,0],[1/4,1/4],[1/2,1/2],[3/4,1/4]],         // top diamond
  2:  [[0,0],[1/2,0],[1/4,1/4]],                         // top-left triangle
  3:  [[0,0],[0,1/2],[1/4,1/4]],                         // left-upper triangle
  4:  [[1/4,1/4],[0,1/2],[1/4,3/4],[1/2,1/2]],          // left diamond
  5:  [[0,1/2],[1/4,3/4],[0,1]],                         // left-lower triangle
  6:  [[1/2,1],[1/4,3/4],[0,1]],                         // bottom-left triangle
  7:  [[1/2,1],[1/4,3/4],[1/2,1/2],[3/4,3/4]],          // bottom diamond
  8:  [[1/2,1],[3/4,3/4],[1,1]],                         // bottom-right triangle
  9:  [[3/4,3/4],[1,1],[1,1/2]],                         // right-lower triangle
  10: [[3/4,3/4],[1,1/2],[3/4,1/4],[1/2,1/2]],          // right diamond
  11: [[1,1/2],[3/4,1/4],[1,0]],                         // right-upper triangle
  12: [[3/4,1/4],[1,0],[1/2,0]],                         // top-right triangle
}

// South Indian chart — signs FIXED, lagna rotates.
// 4×4 grid, outer 12 cells = signs, center 2×2 = chart title.
// Signs clockwise from top-left: Pi→Ar→Ta→Ge→Ca→Le→Vi→Li→Sc→Sg→Cp→Aq
const SI_CELLS = [
  { sign: 12, col: 0, row: 0 }, // Pisces
  { sign: 1,  col: 1, row: 0 }, // Aries
  { sign: 2,  col: 2, row: 0 }, // Taurus
  { sign: 3,  col: 3, row: 0 }, // Gemini
  { sign: 4,  col: 3, row: 1 }, // Cancer
  { sign: 5,  col: 3, row: 2 }, // Leo
  { sign: 6,  col: 3, row: 3 }, // Virgo
  { sign: 7,  col: 2, row: 3 }, // Libra
  { sign: 8,  col: 1, row: 3 }, // Scorpio
  { sign: 9,  col: 0, row: 3 }, // Sagittarius
  { sign: 10, col: 0, row: 2 }, // Capricorn
  { sign: 11, col: 0, row: 1 }, // Aquarius
]

const SIGN_ABBR = ['Ar','Ta','Ge','Ca','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi']

function toPts(poly) {
  return poly.map(([x, y]) => `${(x * S).toFixed(1)},${(y * S).toFixed(1)}`).join(' ')
}

function centroid(poly) {
  const x = poly.reduce((s, p) => s + p[0], 0) / poly.length
  const y = poly.reduce((s, p) => s + p[1], 0) / poly.length
  return [x * S, y * S]
}

function planetLines(ps, cx, cy) {
  return ps.map((p, i) => {
    const deg = typeof p.degree === 'number' ? p.degree.toFixed(0) + '°' : ''
    const r   = p.retrograde ? 'R' : ''
    const label = `${p.abbr}${r} ${deg}`
    const color = p.isLagna ? '#c00' : '#111'
    const weight = p.isLagna ? 'bold' : 'normal'
    return `<text x="${cx}" y="${cy + 4 + i * 14}" text-anchor="middle" font-size="12" fill="${color}" font-weight="${weight}">${label}</text>`
  }).join('\n')
}

export function renderNorthIndianSVG(planets, lagna) {
  const lagnaSign = lagna.sign

  const cellToSign = {}, signToCell = {}
  for (let cell = 1; cell <= 12; cell++) {
    const sign = ((lagnaSign - 1 + cell - 1) % 12) + 1
    cellToSign[cell] = sign
    signToCell[sign] = cell
  }

  const cellPlanets = {}
  for (let c = 1; c <= 12; c++) cellPlanets[c] = []
  cellPlanets[1].push({ abbr: 'Asc', degree: lagna.degree, retrograde: false, isLagna: true })
  for (const p of planets) {
    const cell = signToCell[p.sign]
    if (cell) cellPlanets[cell].push(p)
  }

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" style="width:100%;max-width:${S}px">`,
    `<rect width="${S}" height="${S}" fill="white" stroke="#333" stroke-width="1.5"/>`,
  ]

  for (let cell = 1; cell <= 12; cell++) {
    const poly = NI_POLYS[cell]
    parts.push(`<polygon points="${toPts(poly)}" fill="none" stroke="#555" stroke-width="1"/>`)
    const [cx, cy] = centroid(poly)
    const sign = cellToSign[cell]
    parts.push(`<text x="${cx}" y="${cy - 10}" text-anchor="middle" font-size="10" fill="#aaa">${SIGN_ABBR[sign - 1]}</text>`)
    parts.push(planetLines(cellPlanets[cell], cx, cy))
  }

  parts.push('</svg>')
  return parts.join('\n')
}

export function renderSouthIndianSVG(planets, lagna) {
  const lagnaSign = lagna.sign
  const cell = S / 4  // cell size

  // Build sign → planet list
  const signPlanets = {}
  for (let s = 1; s <= 12; s++) signPlanets[s] = []
  signPlanets[lagnaSign].push({ abbr: 'Asc', degree: lagna.degree, retrograde: false, isLagna: true })
  for (const p of planets) signPlanets[p.sign].push(p)

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" style="width:100%;max-width:${S}px">`,
    `<rect width="${S}" height="${S}" fill="white" stroke="#333" stroke-width="1.5"/>`,
    // center box
    `<rect x="${cell}" y="${cell}" width="${cell * 2}" height="${cell * 2}" fill="#f9f9f9" stroke="#ccc" stroke-width="1"/>`,
    `<text x="${S/2}" y="${S/2 - 8}" text-anchor="middle" font-size="11" fill="#999">Rashi</text>`,
    `<text x="${S/2}" y="${S/2 + 8}" text-anchor="middle" font-size="11" fill="#999">Chart</text>`,
  ]

  for (const { sign, col, row } of SI_CELLS) {
    const x = col * cell, y = row * cell
    // house number from lagna
    const house = ((sign - lagnaSign + 12) % 12) + 1
    const isLagnaCell = sign === lagnaSign

    parts.push(`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${isLagnaCell ? '#fff8f0' : 'white'}" stroke="#555" stroke-width="1"/>`)

    // sign label top-left
    parts.push(`<text x="${x + 4}" y="${y + 15}" font-size="11" fill="#aaa">${SIGN_ABBR[sign - 1]}</text>`)
    // house number top-right
    parts.push(`<text x="${x + cell - 4}" y="${y + 15}" text-anchor="end" font-size="11" fill="${isLagnaCell ? '#c00' : '#bbb'}">${house}</text>`)

    // planets
    const ps = signPlanets[sign] || []
    const cx = x + cell / 2, cy = y + cell / 2 - ((ps.length - 1) * 6)
    ps.forEach((p, i) => {
      const deg = typeof p.degree === 'number' ? p.degree.toFixed(0) + '°' : ''
      const r   = p.retrograde ? 'R' : ''
      const label = `${p.abbr}${r} ${deg}`
      const color = p.isLagna ? '#c00' : '#111'
      const weight = p.isLagna ? 'bold' : 'normal'
      parts.push(`<text x="${cx}" y="${cy + i * 14}" text-anchor="middle" font-size="12" fill="${color}" font-weight="${weight}">${label}</text>`)
    })
  }

  parts.push('</svg>')
  return parts.join('\n')
}

// Keep backward-compat export used by chart.js
export function renderChartSVG(planets, lagna, style = 'north') {
  return style === 'south'
    ? renderSouthIndianSVG(planets, lagna)
    : renderNorthIndianSVG(planets, lagna)
}
