// Service Worker — Indramayu Club
// Path semua relatif, jadi file ini SAMA PERSIS bisa dipakai di VPS maupun GitHub Pages
// tanpa perlu diubah, selama struktur folder di kedua tempat sama.

const CACHE_VERSION = 'v1'; // naikkan versi ini (v2, v3, ...) tiap kali ganti isi app shell
const CACHE_NAME = 'indramayu-club-' + CACHE_VERSION;

// App shell inti — halaman/asset penting yang harus tetap bisa dibuka walau offline.
// Sesuaikan daftar ini dengan halaman/asset yang paling sering dibuka.
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './img/icon-192.png',
  './img/icon-512.png'
];

// INSTALL — precache app shell
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(APP_SHELL).catch(() => {
        // kalau salah satu file gagal (misal path beda), jangan sampai install gagal total
      })
    )
  );
});

// ACTIVATE — buang cache versi lama saja, bukan semua cache
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('indramayu-club-') && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH — strategi: network dulu (biar selalu dapat versi terbaru saat online),
// kalau gagal (offline / server down) baru fallback ke cache.
// Response sukses dari network otomatis disimpan ke cache buat dipakai offline nanti.
self.addEventListener('fetch', (e) => {
  // Hanya tangani GET — request lain (POST ke /api/..., dll) biarkan langsung ke network
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Simpan salinan response ke cache untuk dipakai offline nanti
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, copy).catch(() => {});
        });
        return response;
      })
      .catch(() =>
        // Offline / network gagal → coba ambil dari cache
        caches.match(e.request).then((cached) => {
          if (cached) return cached;
          // Kalau ini navigasi halaman dan tidak ada di cache, fallback ke index.html (app shell)
          if (e.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('Offline — konten belum pernah dibuka sebelumnya.', {
            status: 503,
            statusText: 'Offline'
          });
        })
      )
  );
});

