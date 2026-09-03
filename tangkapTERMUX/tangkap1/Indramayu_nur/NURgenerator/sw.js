// sw.js otomatis untuk folder 'NURgenerator' — hanya cache isi folder ini
// DIBUAT OTOMATIS oleh buat_sw_folder.sh, jangan edit manual. Jalankan ulang script untuk update.
const CACHE_NAME='sw-NURgenerator-20260902';
const ENTRY='./index.html';
const CACHE_FILES=[
  './',
  ENTRY,
  './img/index.html',
  './404.html',
  './meta/mp3_member/index.html',
  './meta/gallery_video/index.html',
  './ADZAN/player.html',
  './meta/komentar/index.html',
  './player.html',
  './meta/member_img/index.html',
  './google_calc.html',
  './meta/upload/index.html',
  './DASHBOARD.html',
  './meta/hub.html',
  './netflix/nur1.html',
  './netflix/nur2.html',
  './netflix/nur3.html',
  './netflix/nur4.html',
  './netflix/nur5.html',
  './netflix/nur6.html',
  './netflix/nur7.html',
  './netflix/nur8.html',
  './netflix/nur9.html',
  './netflix/nur10.html',
  './meta/promosi-streaming/index2.html',
  './netflix/index.html',
  './peta/peta.html',
  './ADZAN/DASHBOARD.html',
  './ADZAN/gallery-adzan.html',
  './adzan_audio.html',
  './komentar.html',
  './alquran_audio.html',
  './adzan-dashboard.html',
  './adzan.html',
  './member.html',
  './JADWAL_sholat.html',
  './peta/index.html.bak-nasa',
  './alquran.html',
  './meta/index.html',
  './peta/index.html',
  './server/utils/voice_cleanup.cjs',
  './public/index.html',
  './meta/video-drive.html',
  './template-komentar.html',
  './marquee_adzan.html',
  './peta/peta-cod.htmly',
  './peta/peta-cod.html',
  './meta/nantidulu.html',
  './alwi_pusat_live.html',
  './peta/artikel.html',
  './peta/nasa-peta.html',
  './diskusi_quran.html',
  './ADZAN/index.html',
  './public/whatsapp.html',
  './meta/template-komentar.html',
  './meta/promosi-streaming/index.html',
  './peta/cariMETA_AI.html',
  './indextest.html',
  './meta/gambar-streaming/index.html',
  './index4.html',
  './LIVE1-backup.html',
  './public/ALWIbot.html',
  './meta/alwibook.html',
  './alwi_kalkulator.html',
  './index_vm1.html',
  './index.html',
  './meta/ALWIbot.html',
  './meta/ALWIbot/index.html',
  './kalkulator1.html',
  './LIVE1.html',
  './LIVE1-ADMIN-082147573665.html',
  './meta/promosi-streaming/slot-1-anda.html',
  './meta/promosi-streaming/slot-2-imah.html',
  './meta/promosi-streaming/slot-3-nur.html',
  './meta/promosi-streaming/slot-4-club.html',
  './meta/gambar-streaming/slot-1-anda.html',
  './meta/gambar-streaming/slot-2-imah.html',
  './meta/gambar-streaming/slot-3-nur.html',
  './meta/gambar-streaming/slot-4-club.html',
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
    await Promise.all(keys.filter(k=>k.startsWith('sw-NURgenerator')).filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));
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
