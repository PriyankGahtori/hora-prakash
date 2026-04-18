// src/tabs/input.js
import { searchLocation, getTimezone } from '../utils/geocoding.js'
import { toJulianDay } from '../utils/time.js'
import { calcBirthChart } from '../core/calculations.js'
import { calcDasha } from '../core/dasha.js'
import { calcPanchang } from '../core/panchang.js'
import { state } from '../state.js'
import { switchTab, enableTab } from '../ui/tabs.js'

let selectedLocation = null
let autocompleteTimeout = null

export function renderInputTab() {
  const panel = document.getElementById('tab-input')
  panel.innerHTML = `
    <form id="birth-form">
      <div class="form-group">
        <label>Name</label>
        <input type="text" id="inp-name" required placeholder="Full name" />
      </div>
      <div class="form-group">
        <label>Date of Birth</label>
        <input type="date" id="inp-dob" required />
      </div>
      <div class="form-group">
        <label>Time of Birth</label>
        <input type="time" id="inp-tob" required />
      </div>
      <div class="form-group">
        <label>Birth Location</label>
        <input type="text" id="inp-location" required placeholder="Type city name..." autocomplete="off" />
        <ul id="location-suggestions"></ul>
      </div>
      <div class="form-group coords-row">
        <div>
          <label>Latitude</label>
          <input type="number" id="inp-lat" step="0.0001" placeholder="e.g. 19.0760" />
        </div>
        <div>
          <label>Longitude</label>
          <input type="number" id="inp-lon" step="0.0001" placeholder="e.g. 72.8777" />
        </div>
        <div>
          <label>Timezone</label>
          <input type="text" id="inp-tz" placeholder="e.g. Asia/Kolkata" readonly />
        </div>
      </div>
      <button type="submit" id="btn-calculate">Calculate Chart</button>
      <p id="calc-error" class="error"></p>
    </form>
  `

  document.getElementById('inp-location').addEventListener('input', onLocationInput)
  document.getElementById('birth-form').addEventListener('submit', onFormSubmit)
  document.getElementById('location-suggestions').addEventListener('click', onSuggestionClick)
}

async function onLocationInput(e) {
  clearTimeout(autocompleteTimeout)
  const q = e.target.value
  if (q.length < 3) { clearSuggestions(); return }
  autocompleteTimeout = setTimeout(async () => {
    try {
      const results = await searchLocation(q)
      renderSuggestions(results)
    } catch (err) {
      clearSuggestions()
    }
  }, 400)
}

function renderSuggestions(results) {
  const ul = document.getElementById('location-suggestions')
  ul.innerHTML = results.map((r, i) =>
    `<li data-index="${i}" data-lat="${r.lat}" data-lon="${r.lon}" data-name="${escapeAttr(r.displayName)}">${escapeHtml(r.displayName)}</li>`
  ).join('')
}

function clearSuggestions() {
  const ul = document.getElementById('location-suggestions')
  if (ul) ul.innerHTML = ''
}

async function onSuggestionClick(e) {
  const li = e.target.closest('li')
  if (!li) return
  const lat = parseFloat(li.dataset.lat)
  const lon = parseFloat(li.dataset.lon)
  try {
    const tz = await getTimezone(lat, lon)
    selectedLocation = { displayName: li.dataset.name, lat, lon, timezone: tz }
    document.getElementById('inp-location').value = li.dataset.name
    document.getElementById('inp-lat').value = lat
    document.getElementById('inp-lon').value = lon
    document.getElementById('inp-tz').value = tz
    clearSuggestions()
  } catch (err) {
    document.getElementById('calc-error').textContent = 'Could not fetch timezone. Please try again.'
  }
}

async function onFormSubmit(e) {
  e.preventDefault()
  const errEl = document.getElementById('calc-error')
  errEl.textContent = ''
  const name = document.getElementById('inp-name').value.trim()
  const dob  = document.getElementById('inp-dob').value
  const tob  = document.getElementById('inp-tob').value
  const lat  = parseFloat(document.getElementById('inp-lat').value)
  const lon  = parseFloat(document.getElementById('inp-lon').value)
  const tz   = document.getElementById('inp-tz').value.trim()

  if (!name || !dob || !tob || isNaN(lat) || isNaN(lon) || !tz) {
    errEl.textContent = 'Please fill all fields and select a location from the suggestions.'
    return
  }

  const btn = document.getElementById('btn-calculate')
  try {
    btn.disabled = true
    btn.textContent = 'Calculating...'

    const jd = toJulianDay(dob, tob, tz)
    const { planets, lagna, houses } = calcBirthChart(jd, lat, lon)
    const moon = planets.find(p => p.name === 'Moon')
    const dasha = calcDasha(moon, dob)
    const panchang = calcPanchang(jd, lat, lon)

    state.birth    = { name, dob, tob, lat, lon, timezone: tz, location: selectedLocation?.displayName ?? '' }
    state.planets  = planets
    state.lagna    = lagna
    state.houses   = houses
    state.dasha    = dasha
    state.panchang = panchang

    // Lazily import render functions to avoid circular deps at load time
    const { renderChart }   = await import('./chart.js')
    const { renderDasha }   = await import('./dasha.js')
    const { renderPanchang } = await import('./panchang.js')

    renderChart()
    renderDasha()
    renderPanchang()

    enableTab('chart')
    enableTab('dasha')
    enableTab('panchang')
    switchTab('chart')
  } catch (err) {
    errEl.textContent = `Calculation error: ${err.message}`
    console.error(err)
  } finally {
    btn.disabled = false
    btn.textContent = 'Calculate Chart'
  }
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

function escapeAttr(str) {
  return str.replace(/"/g,'&quot;')
}
