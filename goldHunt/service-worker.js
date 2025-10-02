const CACHE_NAME = "adventure-game-cache-v1";
const urlsToCache = [
  "/index.html",
  "/style.css",
  "/main.js",
  "/icon-192.png",
  "/icon-512.png",
  "/img"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }).catch((err) => {
      console.error("🔴 Cache addAll failed:", err);
    })
  );
});
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});



