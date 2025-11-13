const CACHE_NAME = "campaign-cache-v1";
const FILES_TO_CACHE = [
  "/index.html",
  "/login.html",
  "/manifest.json",
  "/ReformUKlondon.jpg",
  "/Reform_U.K._Logo.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE).catch((err) => {
        console.error("❌ Failed to cache files during install", err);
      });
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
