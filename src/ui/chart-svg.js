// src/ui/chart-svg.js

const S = 400  // SVG size

// North Indian chart polygons (normalized 0..1, multiply by S for pixels)
// Standard layout: house 1 = top center, houses go clockwise
const NI_POLYS = {
  1:  [[1/3,0],[2/3,0],[1/2,1/6]],
  2:  [[2/3,0],[1,0],[1,1/3],[2/3,1/3]],
  3:  [[2/3,1/3],[1,1/3],[1/2,1/2]],
  4:  [[1,1/3],[1,2/3],[1/2,1/2]],
  5:  [[2/3,2/3],[1,2/3],[1,1],[2/3,1]],
  6:  [[1/2,1/2],[2/3,2/3],[1/2,5/6]],
  7:  [[1/3,1],[2/3,1],[1/2,5/6]],
  8:  [[0,2/3],[1/3,2/3],[1/3,1],[0,1]],
  9:  [[0,2/3],[1/2,1/2],[1/3,2/3]],
  10: [[0,1/3],[1/2,1/2],[0,2/3]],
  11: [[0,0],[1/3,0],[1/3,1/3],[0,1/3]],
  12: [[1/3,0],[1/2,1/6],[1/3,1/3]],
}

const SIGN_ABBR = ['Ar','Ta','Ge','Ca','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi']

function toPts(poly) {
  return poly.map(([x, y]) => `${(x * S).toFixed(1)},${(y * S).toFixed(1)}`).join(' ')
}

function centroid(poly) {
  const x = poly.reduce((s, p) => s + p[0], 0) / poly.length
  const y = poly.reduce((s, p) => s + p[1], 0) / poly.length
  return [x * S, y * S]
}

/**
 * Render North Indian birth chart as SVG string.
 * @param {object[]} planets - from calcBirthChart
 * @param {object}   lagna   - from calcBirthChart
 * @returns {string} SVG markup
 */
export function renderChartSVG(planets, lagna) {
  const lagnaSign = lagna.sign  // 1-12

  // In NI chart, cell 1 = lagna sign, cell 2 = lagna sign + 1, etc. (clockwise)
  // Build sign→cell and cell→sign maps
  const cellToSign = {}
  const signToCell = {}
  for (let cell = 1; cell <= 12; cell++) {
    const sign = ((lagnaSign - 1 + cell - 1) % 12) + 1
    cellToSign[cell] = sign
    signToCell[sign] = cell
  }

  // Group planets by cell
  const cellPlanets = {}
  for (let c = 1; c <= 12; c++) cellPlanets[c] = []

  // Add lagna marker to cell 1
  cellPlanets[1].push({ abbr: 'Asc', degree: lagna.degree, retrograde: false, isLagna: true })

  for (const p of planets) {
    const cell = signToCell[p.sign]
    if (cell) cellPlanets[cell].push(p)
  }

  const svgParts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" style="width:100%;max-width:${S}px">`,
    `<rect width="${S}" height="${S}" fill="white" stroke="#333" stroke-width="1.5"/>`
  ]

  for (let cell = 1; cell <= 12; cell++) {
    const poly = NI_POLYS[cell]
    if (!poly) continue

    svgParts.push(`<polygon points="${toPts(poly)}" fill="none" stroke="#666" stroke-width="1"/>`)

    const [cx, cy] = centroid(poly)
    const sign = cellToSign[cell]
    const signStr = SIGN_ABBR[sign - 1]

    // Sign label (small, grey)
    svgParts.push(`<text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="8" fill="#aaa">${signStr}</text>`)

    // Planet labels
    const ps = cellPlanets[cell] || []
    ps.forEach((p, i) => {
      const deg = typeof p.degree === 'number' ? p.degree.toFixed(0) + '°' : ''
      const r   = p.retrograde ? 'R' : ''
      const label = `${p.abbr}${r} ${deg}`
      const color = p.isLagna ? '#c00' : '#111'
      const weight = p.isLagna ? 'bold' : 'normal'
      svgParts.push(
        `<text x="${cx}" y="${cy + 4 + i * 12}" text-anchor="middle" font-size="10" fill="${color}" font-weight="${weight}">${label}</text>`
      )
    })
  }

  svgParts.push('</svg>')
  return svgParts.join('\n')
}
