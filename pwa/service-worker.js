// PWA service worker for files inside /pwa/
// IMPORTANT: Use RELATIVE paths because this is a GitHub Pages *project site*.
// The service worker lives in /campaign-map-pwa/pwa/, so "./" resolves correctly.

const CACHE_NAME = 'pwa-cache-v1';

// ✅ Use relative paths — these resolve to:
// https://londoncampaignsgroupreform-bit.github.io/campaign-map-pwa/pwa/<file>
const ASSETS_TO_CACHE = [
  './login.html',
  './manifest.json',
  './offline.html'
  // Add more assets here if needed, e.g. './style.css', './login.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Network-first for navigation requests (pages)
// Cache-first for static assets
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // ✅ Navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./offline.html'))
    );
    return;
  }

  // ✅ Asset requests (CSS, JS, images, etc.)
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      }).catch(() => {
        // If offline and asset missing, fallback to offline page only for HTML
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./offline.html');
        }
      });
    })
  );
});
