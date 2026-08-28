// META ALWI - Service Worker v2.0
// Offline + Auto-Update untuk Indramayu_nur + meta_folder (VPS Connect)
const CACHE_NAME = 'meta-alwi-v2-b' + Date.now();
const OFFLINE_URL = './offline.html';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './img/icon-512.png',
];

self.addEventListener('install', e => {
  console.log('[SW] Install new version:', CACHE_NAME);
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS.map(url => new Request(url, {cache: 'no-cache'}))).catch(err => {
        console.log('[SW] Core cache fail, skip', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  console.log('[SW] Activate, clean old cache');
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => {
          console.log('[SW] Delete old cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);

  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('/secure/') ||
    url.pathname.includes('34.170.37.50')
  ) {
    e.respondWith(
      fetch(req, {cache: 'no-store'})
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, clone));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  if (req.headers.get('accept')?.includes('text/html') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    e.respondWith(
      fetch(req, {cache: 'no-store'})
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req).then(cached => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => {
        if (req.destination === 'image') {
          return new Response('', {status: 204});
        }
      });
    })
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
