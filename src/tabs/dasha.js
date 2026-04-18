// src/tabs/dasha.js
import { state } from '../state.js'
import { isCurrentPeriod } from '../core/dasha.js'

export function renderDasha() {
  const panel = document.getElementById('tab-dasha')
  if (!state.dasha || !state.birth) return
  const { dasha, birth } = state

  const rows = dasha.map(maha => {
    const isMahaCurrent = isCurrentPeriod(maha.start, maha.end)
    const antarRows = maha.antars.map(antar => {
      const isAntarCurrent = isCurrentPeriod(antar.start, antar.end)
      const pratRows = antar.pratyantars.map(prat => {
        const isPratCurrent = isCurrentPeriod(prat.start, prat.end)
        return `<tr class="${isPratCurrent ? 'current-period' : ''}" style="display:none" data-prat>
          <td style="padding-left:3rem">↳ ${prat.planet}</td>
          <td>${fmt(prat.start)}</td>
          <td>${fmt(prat.end)}</td>
        </tr>`
      }).join('')

      return `<tr class="${isAntarCurrent ? 'current-period' : ''}" style="display:none" data-antar data-toggle-prat>
          <td style="padding-left:1.5rem; cursor:pointer">▶ ${antar.planet}</td>
          <td>${fmt(antar.start)}</td>
          <td>${fmt(antar.end)}</td>
        </tr>${pratRows}`
    }).join('')

    return `<tr class="${isMahaCurrent ? 'current-period' : ''}" data-toggle-antar style="cursor:pointer">
        <td><strong>▶ ${maha.planet}</strong></td>
        <td>${fmt(maha.start)}</td>
        <td>${fmt(maha.end)}</td>
      </tr>${antarRows}`
  }).join('')

  panel.innerHTML = `
    <div class="card">
      <h2>Vimshottari Dasha — ${birth.name}</h2>
      <p style="color:var(--muted);font-size:0.85rem;margin-top:0.2rem;margin-bottom:1rem">Click a Mahadasha row to expand Antardashas</p>
      <table class="dasha-table">
        <thead><tr><th>Period</th><th>Start</th><th>End</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `

  panel.querySelector('.dasha-table tbody').addEventListener('click', (e) => {
    const row = e.target.closest('tr')
    if (!row) return
    if (row.hasAttribute('data-toggle-antar')) {
      const opening = toggleSiblings(row, 'data-antar')
      setArrow(row, opening)
      if (!opening) {
        // collapse all pratyantar rows when closing the maha
        let next = row.nextElementSibling
        while (next && next.hasAttribute('data-antar')) {
          next.style.display = 'none'
          setArrow(next, false)
          let prat = next.nextElementSibling
          while (prat && prat.hasAttribute('data-prat')) {
            prat.style.display = 'none'
            prat = prat.nextElementSibling
          }
          next = prat
        }
      }
    } else if (row.hasAttribute('data-toggle-prat')) {
      const opening = toggleSiblings(row, 'data-prat')
      setArrow(row, opening)
    }
  })
}

function toggleSiblings(row, attr) {
  let next = row.nextElementSibling
  if (!next || !next.hasAttribute(attr)) return false
  const willShow = next.style.display === 'none'
  while (next && next.hasAttribute(attr)) {
    next.style.display = willShow ? '' : 'none'
    next = next.nextElementSibling
  }
  return willShow
}

function setArrow(row, open) {
  const td = row.querySelector('td')
  if (!td) return
  td.textContent = td.textContent.replace(/^[▶▼] /, (open ? '▼ ' : '▶ '))
}

function fmt(date) {
  return date.toISOString().slice(0, 10)
}
