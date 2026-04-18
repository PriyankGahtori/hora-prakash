// src/tabs/panchang.js
import { state } from '../state.js'

export function renderPanchang() {
  const panel = document.getElementById('tab-panchang')
  if (!state.panchang || !state.birth) return
  const { panchang, birth } = state
  const p = panchang

  const fmtTime = (d) => {
    if (!d) return '—'
    const hh = String(d.getUTCHours()).padStart(2, '0')
    const mm = String(d.getUTCMinutes()).padStart(2, '0')
    return `${hh}:${mm} UTC`
  }

  panel.innerHTML = `
    <h2>Panchang — ${birth.dob}</h2>
    <p style="margin-bottom:1rem;color:#666">${birth.location || birth.lat + ', ' + birth.lon}</p>
    <table class="panchang-table">
      <tbody>
        <tr><th>Tithi</th><td>${p.tithi.name} (${p.tithi.num}/30)</td></tr>
        <tr><th>Vara</th><td>${p.vara.name} (Lord: ${p.vara.lord})</td></tr>
        <tr><th>Nakshatra</th><td>${p.nakshatra.name} Pada ${p.nakshatra.pada} (Lord: ${p.nakshatra.lord})</td></tr>
        <tr><th>Yoga</th><td>${p.yoga}</td></tr>
        <tr><th>Karana</th><td>${p.karana}</td></tr>
        <tr><th>Sunrise</th><td>${fmtTime(p.sunrise)}</td></tr>
        <tr><th>Sunset</th><td>${fmtTime(p.sunset)}</td></tr>
        <tr><th>Rahu Kalam</th><td>${fmtTime(p.rahuKalam.start)} – ${fmtTime(p.rahuKalam.end)}</td></tr>
        <tr><th>Gulika Kalam</th><td>${fmtTime(p.gulikaKalam.start)} – ${fmtTime(p.gulikaKalam.end)}</td></tr>
      </tbody>
    </table>
  `
}
