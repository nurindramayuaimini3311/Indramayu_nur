const CACHE = "alwi-pusat-offline-v2";
const URLS = [
  "./",
  "./index.html",
  "./alwi_pusat_live.html",
  "./manifest.json",
  "./alwi_bubble.js",
  "./alwi_qa_lite.js",
  "./member_system.js",
  "./img/icon-192.png",
  "./img/icon-512.png",
  "./alwiSD/index.html",
  "./alwiSD/matematika.html",
  "./alwiSD/novelalwi2.html",
  "./android/index.html",
  "./game/index.html",
  "./kamera-hantu/index.html",
  "./konten/index.html",
  "./kuis/index.html",
  "./netflix/index.html",
  "./peta/index.html",
  "./pencuri/index.html",
  "./static/style.css",
  "./static/kartu.css"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(URLS)));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
