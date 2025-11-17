// service-worker.js for GitHub Pages
const CACHE_VERSION = 'cg-map-v1';
const BASE_PATH = '/campaign-map-pwa'; // adjust if your site root differs
const PRECACHE_URLS = [
  `${BASE_PATH}/login.html`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/office.html`,
  `${BASE_PATH}/Reform_U.K._Logo.jpg`
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      Promise.all(
        PRECACHE_URLS.map((url) =>
          fetch(url).then((resp) => {
            if (resp && resp.ok) return cache.put(url, resp.clone());
          }).catch((err) => {
            console.warn('Precache failed for', url, err);
          })
        )
      )
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_VERSION ? caches.delete(k) : Promise.resolve())))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Navigation requests: network first, then cache, then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((cached) => cached || caches.match(`${BASE_PATH}/office.html`))
      )
    );
    return;
  }

  // Static assets: cache-first, then network
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
