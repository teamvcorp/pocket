const CACHE = "pocket-jesus-v1";

// API routes always go to network — never cache
const API_PREFIXES = ["/api/", "/_next/"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Only cache http/https (skip chrome-extension://, etc.)
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  // Bypass cache for API routes and Next.js internals
  if (API_PREFIXES.some((p) => url.pathname.startsWith(p))) return;
  // Only cache GET requests
  if (request.method !== "GET") return;

  e.respondWith(
    fetch(request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((cache) => cache.put(request, clone));
        return res;
      })
      .catch(() => caches.match(request))
  );
});
