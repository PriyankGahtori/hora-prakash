// src/tabs/chart.js
import { state } from '../state.js'
import { renderChartSVG } from '../ui/chart-svg.js'

const SIGN_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
                    'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']

let chartStyle = 'north'

export function renderChart() {
  const panel = document.getElementById('tab-chart')
  const { planets, lagna, birth } = state

  panel.innerHTML = `
    <div class="card">
      <h2>${birth.name} — Birth Chart</h2>
      <p style="color:var(--muted);font-size:0.85rem;margin-top:0.2rem;margin-bottom:1rem">${birth.dob} &nbsp;${birth.tob} &nbsp;·&nbsp; ${birth.location || birth.lat + '°, ' + birth.lon + '°'}</p>
      <div style="margin-bottom:1rem">
        <button id="btn-north" class="chart-style-btn${chartStyle === 'north' ? ' active' : ''}">North Indian</button>
        <button id="btn-south" class="chart-style-btn${chartStyle === 'south' ? ' active' : ''}">South Indian</button>
      </div>
      <div id="chart-container">
        ${renderChartSVG(planets, lagna, chartStyle)}
      </div>
      <h3>Planetary Positions</h3>
      <table class="planet-table">
        <thead>
          <tr><th>Planet</th><th>Sign</th><th>Deg</th><th>House</th><th>Nakshatra</th><th>Pada</th><th>R</th></tr>
        </thead>
        <tbody>
          ${planets.map(p => `<tr>
            <td>${p.name}</td>
            <td>${SIGN_NAMES[p.sign - 1]}</td>
            <td>${p.degree.toFixed(2)}°</td>
            <td>${p.house}</td>
            <td>${p.nakshatra}</td>
            <td>${p.pada}</td>
            <td style="color:#c00">${p.retrograde ? '℞' : ''}</td>
          </tr>`).join('')}
          <tr style="background:#fef3ff">
            <td><strong>Lagna</strong></td>
            <td>${SIGN_NAMES[lagna.sign - 1]}</td>
            <td>${lagna.degree.toFixed(2)}°</td>
            <td>1</td>
            <td>${lagna.nakshatra}</td>
            <td>${lagna.pada}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  `

  panel.querySelector('#btn-north').addEventListener('click', () => { chartStyle = 'north'; renderChart() })
  panel.querySelector('#btn-south').addEventListener('click', () => { chartStyle = 'south'; renderChart() })
}
