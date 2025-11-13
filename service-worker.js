self.addEventListener('install', (event) => {
  const CACHE_NAME = 'site-v1';
  const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/login.html'
  ];

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        PRECACHE_URLS.map((url) =>
          fetch(url)
            .then((response) => {
              if (!response || !response.ok) {
                throw new Error(`Request for ${url} failed with status ${response && response.status}`);
              }
              return cache.put(url, response.clone());
            })
            .catch((err) => {
              // Log and continue — missing file won't break the whole install
              console.warn('Precache failed for', url, err);
              return Promise.resolve();
            })
        )
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
