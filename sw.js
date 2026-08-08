const CACHE = "indramayu-v1";
const ASSETS = ["/", "/index.html", "/manifest.json", "/img/icon-192.png", "/img/icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});
self.addEventListener("fetch", e => {
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});
