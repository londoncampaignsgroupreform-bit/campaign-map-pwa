self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open("campaign-cache").then((cache) => {
        return cache.addAll([
          "https://script.google.com/macros/s/AKfycbwqJ0KiXTlwJdvtb7pVOPA4qZ9IsN0uhDNafLNPTXbZHgi_OOh9it3BchqxjIrzUg5K/exec",
          "/manifest.json"
        ]);
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