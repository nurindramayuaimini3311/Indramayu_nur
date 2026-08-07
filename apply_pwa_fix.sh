#!/usr/bin/env bash
set -euo pipefail

# 0. di folder ~/novel
echo "Working dir: $(pwd)"
echo "Backup existing files..."

cp -v index.html index.html.bak || true
cp -v manifest.json manifest.json.bak || true
cp -v sw.js sw.js.bak || true

# 1. generate_icons.py
cat > generate_icons.py <<'PY'
from PIL import Image
import sys
src = "img/alwi_ghost_bug.png"
try:
    img = Image.open(src).convert("RGBA")
except FileNotFoundError:
    print("File sumber tidak ditemukan:", src)
    sys.exit(1)

sizes = [512, 192, 180, 72]
for size in sizes:
    out = img.resize((size, size), Image.LANCZOS)
    out.save(f"img/icon-{size}.png", "PNG")
    print(f"Created img/icon-{size}.png")

# overwrite agent icon
img.resize((192, 192), Image.LANCZOS).save("img/agent_alwi_icon.png", "PNG")
print("Updated img/agent_alwi_icon.png")
PY

echo "Menjalankan generate_icons.py (butuh pillow jika belum terpasang)"
python3 generate_icons.py

echo "Menulis manifest.json"
cat > manifest.json <<'MF'
{
  "name": "ALWI PUSAT - 10 Nur Cahaya",
  "short_name": "ALWI PUSAT",
  "description": "Hantu=Bug Python. Dropdown fix di depan gambar.",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#c9a84c",
  "orientation": "portrait",
  "scope": "./",
  "icons": [
    {"src": "img/icon-192.png","sizes":"192x192","type":"image/png","purpose":"any maskable"},
    {"src": "img/icon-512.png","sizes":"512x512","type":"image/png","purpose":"any maskable"},
    {"src": "img/icon-180.png","sizes":"180x180","type":"image/png"},
    {"src": "img/agent_alwi_icon.png","sizes":"192x192","type":"image/png"}
  ]
}
MF

echo "Menulis sw.js"
cat > sw.js <<'SW'
const CACHE_NAME = 'alwi-pusat-v3';
const ASSETS = [
  './',
  './index.html',
  './alwi_bubble.js',
  './manifest.json',
  './img/alwi_ghost_bug.png',
  './img/agent_alwi_icon.png',
  './img/icon-192.png',
  './img/icon-512.png',
  './img/icon-180.png',
  './nur1.html',
  './nur2.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.url.includes('trycloudflare') || req.method !== 'GET') return;

  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200 && networkRes.type !== 'opaque') {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return networkRes;
        })
        .catch(() => {
          if (req.destination === 'image') return caches.match('./img/alwi_ghost_bug.png');
        });
    })
  );
});
SW

echo "Memodifikasi index.html: tambahkan manifest/theme-color/apple-touch-icon (jika belum ada) dan registrasi SW sebelum </body>"
# tambahkan manifest/theme-color/apple-touch-icon di head jika belum ada
perl -0777 -pe 'unless(/rel="manifest"/s){ s#</head>#  <link rel="manifest" href="manifest.json">\n  <link rel="apple-touch-icon" href="img/icon-180.png">\n  <meta name="theme-color" content="#c9a84c">\n</head>#s }' -i index.html

# tambahkan pendaftaran SW sebelum </body> jika belum ada
perl -0777 -pe 'unless(/navigator.serviceWorker.register/s){ s#</body>#  <script>\n    if ("serviceWorker" in navigator) {\n      window.addEventListener("load", function(){\n        navigator.serviceWorker.register("/sw.js").then(r => console.log("SW OK v3", r.scope)).catch(e => console.warn("SW reg failed", e));\n      });\n    }\n  </script>\n</body>#s }' -i index.html

echo "Selesai menulis file. Lihat status git berikut:"
git status --porcelain
echo "Untuk melihat diff gunakan: git diff"
echo "Jika mau commit ke branch baru jalankan perintah di bawah (jangan lupa cek dulu perubahan):"
cat <<'CM'
git checkout -b pwa/icon-sw-fix
git add img/icon-*.png img/agent_alwi_icon.png manifest.json sw.js index.html generate_icons.py
git commit -m "PWA: generate icons, update manifest & improved sw.js + register"
git push -u origin pwa/icon-sw-fix
CM

echo "END"
