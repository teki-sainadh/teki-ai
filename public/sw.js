self.addEventListener('install', (e) => {
  self.skipWaiting(); // always activate immediately
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.registration.unregister();
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Pass through all requests to network
  e.respondWith(fetch(e.request));
});
