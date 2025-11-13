// Improved, tolerant service worker (this was already updated in the repo)
// Precaches offline.html so it can be used as a navigation fallback.
const CACHE_NAME = 'site-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/login.html',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        PRECACHE_URLS.map((url) =>
          fetch(url)
            .then((response) => {
              if (!response || !response.ok) throw new Error(`Request for ${url} failed with status ${response && response.status}`);
              return cache.put(url, response.clone());
            })
            .catch((err) => {
              console.warn('Precache failed for', url, err);
              return Promise.resolve();
            })
        )
      );
    })
  );
  // Activate worker as soon as it's finished installing
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Optional: delete old caches here if you version caches
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // For navigation requests, prefer network, fallback to cache, then offline page
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then((resp) => {
        return resp;
      }).catch(() => {
        return caches.match('/index.html').then((cached) => cached || caches.match('/offline.html'));
      })
    );
    return;
  }

  // For other requests, try cache first then network
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => caches.match('/offline.html')))
  );
});
