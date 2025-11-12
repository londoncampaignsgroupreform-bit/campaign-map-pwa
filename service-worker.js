self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open("campaign-cache").then((cache) => {
        return cache.addAll([
          "https://script.google.com/macros/s/AKfycby44MhPl0LFSvPOtCpgRzHWNN3nIyAs0n_dFO7qdsPH7XqFBy2XiR4oGdRRfhQ1TX8T/exec",
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
