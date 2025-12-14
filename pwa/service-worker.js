// PWA service worker for files inside /pwa/
// Keep the registration scope '/pwa/' so this worker only affects requests under /pwa/.

const CACHE_NAME = 'pwa-cache-v1';
const ASSETS_TO_CACHE = [
  '/pwa/login.html',
  '/pwa/manifest.json',
  '/pwa/offline.html'
  // add other static assets here if you have them, e.g. '/pwa/style.css', '/pwa/login.js'
];

self.addEventListener('install', event => {
  // Precache critical assets
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  // Remove old caches
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

// Basic network-first for navigation (pages), fallback to offline page.
// For other requests, try cache first then network, and cache successful responses.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Handle navigation requests (pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/pwa/offline.html')
      )
    );
    return;
  }

  // For other GET requests (assets), try cache-first then network
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(networkResponse => {
        // Optionally cache the response for future requests
        return caches.open(CACHE_NAME).then(cache => {
          // Only cache successful responses
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      }).catch(() => {
        // If request fails (e.g. offline), fallback to offline page for navigations already handled above.
        // For other assets, just fail silently or optionally return a placeholder.
        return caches.match('/pwa/offline.html');
      });
    })
  );
});
