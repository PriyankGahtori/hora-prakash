/* coi-serviceworker — injects COOP/COEP headers for WASM cross-origin isolation */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

async function handleFetch(request) {
  let r;
  try { r = await fetch(request); } catch { return; }

  // Only wrap responses with a valid HTTP status (200-599). Opaque cross-origin
  // responses (e.g. Google Fonts) have status 0 and must be returned as-is.
  if (!r || r.status < 200 || r.status > 599) return r;

  const headers = new Headers(r.headers);
  headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  return new Response(r.body, { status: r.status, statusText: r.statusText, headers });
}

self.addEventListener("fetch", (e) => e.respondWith(handleFetch(e.request)));
