const CACHE_NAME = 'alwi-v4-dropdown-fix-2025-08-04';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/img/alwi_ghost_bug.png',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/alwi_bubble.js'
];

// INSTALL - cache baru
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
  );
});

// ACTIVATE - HAPUS CACHE LAMA
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => {
        if (k !== CACHE_NAME) {
          console.log('Hapus cache lama:', k);
          return caches.delete(k);
        }
      })
    )).then(() => self.clients.claim())
  );
});

// FETCH - NETWORK FIRST untuk navigasi/html
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);

  if (req.mode === 'navigate' || url.pathname.endsWith('index.html') || url.pathname === '/' || url.pathname.endsWith('/')) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('/index.html')))
    );
    return;
  }

  // Aset lain: cache-first
  e.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(networkRes => {
        if (networkRes && networkRes.status === 200 && networkRes.type !== 'opaque') {
          const copy = networkRes.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
        }
        return networkRes;
      }).catch(() => {
        if (req.destination === 'image') return caches.match('/img/alwi_ghost_bug.png');
      });
      return cached || fetchPromise;
    })
  );
});
