// src/tabs/chart.js
import { state } from '../state.js'
import { renderChartSVG } from '../ui/chart-svg.js'

const SIGN_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
                    'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']

export function renderChart() {
  const panel = document.getElementById('tab-chart')
  const { planets, lagna, birth } = state

  panel.innerHTML = `
    <h2>${birth.name} — Birth Chart</h2>
    <p style="color:#666;margin-bottom:1rem">${birth.dob} ${birth.tob} | ${birth.location || birth.lat + '°, ' + birth.lon + '°'}</p>
    <div id="chart-container">
      ${renderChartSVG(planets, lagna)}
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
          <td>${p.retrograde ? '℞' : ''}</td>
        </tr>`).join('')}
        <tr style="background:#fff8f8">
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
  `
}
