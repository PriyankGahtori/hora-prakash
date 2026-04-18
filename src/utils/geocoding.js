// src/utils/geocoding.js

/**
 * Search locations via Nominatim OpenStreetMap.
 * Returns array of { displayName, lat, lon } candidates.
 */
export async function searchLocation(query) {
  if (!query || query.length < 3) return []
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'aditya-amrit-hora/1.0' } })
  if (!res.ok) throw new Error(`Geocoding request failed: ${res.status}`)
  const data = await res.json()
  return data.map(item => ({
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
  }))
}

/**
 * Get IANA timezone string for coordinates via timeapi.io (free, no key).
 */
export async function getTimezone(lat, lon) {
  if (!isFinite(lat) || !isFinite(lon)) throw new Error('Invalid coordinates for timezone lookup')
  const url = `https://timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lon}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Timezone lookup failed: ${res.status}`)
  const data = await res.json()
  return data.timeZone  // e.g. "Asia/Kolkata"
}
