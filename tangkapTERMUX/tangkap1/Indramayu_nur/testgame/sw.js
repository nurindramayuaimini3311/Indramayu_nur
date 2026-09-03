// sw.js otomatis untuk folder 'testgame' — hanya cache isi folder ini
// DIBUAT OTOMATIS oleh buat_sw_folder.sh, jangan edit manual. Jalankan ulang script untuk update.
const CACHE_NAME='sw-testgame-20260902';
const ENTRY='./index.html';
const CACHE_FILES=[
  './',
  ENTRY,
  './index.html',
  './zig_zag.html',
];

// Install: cache semua file folder (kecil, cepat)
self.addEventListener('install', e=>{
  e.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    for (const url of CACHE_FILES) {
      try { await cache.add(url); } catch(err){}
    }
    await self.skipWaiting();
  })());
});

// Activate: hapus cache lama folder ini saja
self.addEventListener('activate', e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('sw-testgame')).filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

// Fetch: cache-first (offline tetap jalan), fallback ke entry
self.addEventListener('fetch', e=>{
  const url=new URL(e.request.url);
  if (e.request.method!=='GET' || url.origin!==self.location.origin) return;
  e.respondWith((async()=>{
    const cached=await caches.match(e.request);
    if (cached) return cached;
    try {
      const res=await fetch(e.request);
      if (res.ok) { const copy=res.clone(); caches.open(CACHE_NAME).then(c=>c.put(e.request,copy)); }
      return res;
    } catch(err){
      const fallback=await caches.match(ENTRY);
      if (fallback) return fallback;
      return new Response('offline', {status:200, headers:{'Content-Type':'text/html'}});
    }
  })());
});
