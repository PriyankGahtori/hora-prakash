/* coi-serviceworker — injects COOP/COEP headers for WASM cross-origin isolation */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

async function handleFetch(request) {
  // Skip non-GET and opaque cross-origin requests (e.g. Google Fonts)
  if (request.method !== "GET") return fetch(request);

  const r = await fetch(request).catch(() => null);
  if (!r || r.status === 0 || !r.ok && r.type === "opaque") return r;

  const newHeaders = new Headers(r.headers);
  newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
  newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
  return new Response(r.body, { status: r.status, statusText: r.statusText, headers: newHeaders });
}

self.addEventListener("fetch", (e) => e.respondWith(handleFetch(e.request)));
