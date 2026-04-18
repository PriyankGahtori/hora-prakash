// src/ui/chart-svg.js
// Reference: https://github.com/VicharaVandana/jyotichart

const S = 480
const FONT = `font-family="Inter, system-ui, sans-serif"`

const NI_POLYS = {
  1:  [[1/2,0],[1/4,1/4],[1/2,1/2],[3/4,1/4]],
  2:  [[0,0],[1/2,0],[1/4,1/4]],
  3:  [[0,0],[0,1/2],[1/4,1/4]],
  4:  [[1/4,1/4],[0,1/2],[1/4,3/4],[1/2,1/2]],
  5:  [[0,1/2],[1/4,3/4],[0,1]],
  6:  [[1/2,1],[1/4,3/4],[0,1]],
  7:  [[1/2,1],[1/4,3/4],[1/2,1/2],[3/4,3/4]],
  8:  [[1/2,1],[3/4,3/4],[1,1]],
  9:  [[3/4,3/4],[1,1],[1,1/2]],
  10: [[3/4,3/4],[1,1/2],[3/4,1/4],[1/2,1/2]],
  11: [[1,1/2],[3/4,1/4],[1,0]],
  12: [[3/4,1/4],[1,0],[1/2,0]],
}

const SI_CELLS = [
  { sign: 12, col: 0, row: 0 },
  { sign: 1,  col: 1, row: 0 },
  { sign: 2,  col: 2, row: 0 },
  { sign: 3,  col: 3, row: 0 },
  { sign: 4,  col: 3, row: 1 },
  { sign: 5,  col: 3, row: 2 },
  { sign: 6,  col: 3, row: 3 },
  { sign: 7,  col: 2, row: 3 },
  { sign: 8,  col: 1, row: 3 },
  { sign: 9,  col: 0, row: 3 },
  { sign: 10, col: 0, row: 2 },
  { sign: 11, col: 0, row: 1 },
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
  const lineH = 22
  return ps.map((p, i) => {
    const deg = typeof p.degree === 'number' ? p.degree.toFixed(0) + '°' : ''
    const r   = p.retrograde ? 'ᴿ' : ''
    const label = `${p.abbr}${r} ${deg}`
    const color  = p.isLagna ? '#c2410c' : '#1e293b'
    const weight = p.isLagna ? '700' : '500'
    return `<text x="${cx}" y="${cy + i * lineH}" text-anchor="middle" font-size="18" fill="${color}" font-weight="${weight}" ${FONT}>${label}</text>`
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
    `<rect width="${S}" height="${S}" fill="#fafafa" stroke="#334155" stroke-width="2" rx="4"/>`,
  ]

  for (let cell = 1; cell <= 12; cell++) {
    const poly = NI_POLYS[cell]
    parts.push(`<polygon points="${toPts(poly)}" fill="none" stroke="#94a3b8" stroke-width="1.2"/>`)
    const [cx, cy] = centroid(poly)
    const sign = cellToSign[cell]
    parts.push(`<text x="${cx}" y="${cy - 16}" text-anchor="middle" font-size="16" font-weight="600" fill="#64748b" ${FONT}>${SIGN_ABBR[sign - 1]}</text>`)
    // shift planet block down from sign label
    const count = cellPlanets[cell].length
    const blockTop = cy + (count > 1 ? -(count - 1) * 11 : 4)
    parts.push(planetLines(cellPlanets[cell], cx, blockTop))
  }

  parts.push('</svg>')
  return parts.join('\n')
}

export function renderSouthIndianSVG(planets, lagna) {
  const lagnaSign = lagna.sign
  const cs = S / 4

  const signPlanets = {}
  for (let s = 1; s <= 12; s++) signPlanets[s] = []
  signPlanets[lagnaSign].push({ abbr: 'Asc', degree: lagna.degree, retrograde: false, isLagna: true })
  for (const p of planets) signPlanets[p.sign].push(p)

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" style="width:100%;max-width:${S}px">`,
    `<rect width="${S}" height="${S}" fill="#fafafa" stroke="#334155" stroke-width="2" rx="4"/>`,
    `<rect x="${cs}" y="${cs}" width="${cs * 2}" height="${cs * 2}" fill="#eef2ff" stroke="#c7d2fe" stroke-width="1.5"/>`,
    `<text x="${S/2}" y="${S/2 - 10}" text-anchor="middle" font-size="22" font-weight="700" fill="#c2410c" ${FONT}>Rashi</text>`,
    `<text x="${S/2}" y="${S/2 + 18}" text-anchor="middle" font-size="22" font-weight="700" fill="#c2410c" ${FONT}>Chart</text>`,
  ]

  for (const { sign, col, row } of SI_CELLS) {
    const x = col * cs, y = row * cs
    const house = ((sign - lagnaSign + 12) % 12) + 1
    const isLagnaCell = sign === lagnaSign

    parts.push(`<rect x="${x}" y="${y}" width="${cs}" height="${cs}" fill="${isLagnaCell ? '#fff7ed' : '#fafafa'}" stroke="#94a3b8" stroke-width="1.2"/>`)
    parts.push(`<text x="${x + 6}" y="${y + 20}" font-size="16" font-weight="600" fill="#475569" ${FONT}>${SIGN_ABBR[sign - 1]}</text>`)
    parts.push(`<text x="${x + cs - 6}" y="${y + 20}" text-anchor="end" font-size="16" font-weight="600" fill="${isLagnaCell ? '#c2410c' : '#94a3b8'}" ${FONT}>${house}</text>`)

    const ps = signPlanets[sign] || []
    const lineH = 22
    const cx = x + cs / 2
    const cy = y + cs / 2 - ((ps.length - 1) * lineH / 2) + 6
    ps.forEach((p, i) => {
      const deg = typeof p.degree === 'number' ? p.degree.toFixed(0) + '°' : ''
      const r   = p.retrograde ? 'ᴿ' : ''
      const label = `${p.abbr}${r} ${deg}`
      const color  = p.isLagna ? '#c2410c' : '#1e293b'
      const weight = p.isLagna ? '700' : '500'
      parts.push(`<text x="${cx}" y="${cy + i * lineH}" text-anchor="middle" font-size="18" fill="${color}" font-weight="${weight}" ${FONT}>${label}</text>`)
    })
  }

  parts.push('</svg>')
  return parts.join('\n')
}

export function renderChartSVG(planets, lagna, style = 'north') {
  return style === 'south'
    ? renderSouthIndianSVG(planets, lagna)
    : renderNorthIndianSVG(planets, lagna)
}
