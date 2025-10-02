self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('room-deco-v1').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './js/main.js',
        './manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
