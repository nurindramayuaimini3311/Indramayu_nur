/* SW Peta 3D v3: network-first (file baru selalu menang, tidak sangkut) + fallback cache (offline) */
const C='peta3d-v3';
const INTI=['index.html','patrol-jalan.html','patrol-bebas.html','three.module.js','es-module-shims.js',
 'addons/controls/OrbitControls.js','alwi_bubble4.js','alwi_bubble1.js','alwi_bubble3.js'];
self.addEventListener('install',e=>{
 e.waitUntil(
  caches.open(C).then(c=>Promise.all(INTI.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting())
 );
});
self.addEventListener('activate',e=>{
 e.waitUntil(
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k))))
   .then(()=>self.clients.claim())
 );
});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 e.respondWith(
  fetch(e.request).then(res=>{
   const cp=res.clone();
   caches.open(C).then(c=>c.put(e.request,cp)).catch(()=>{});
   return res;
  }).catch(()=>caches.match(e.request))
 );
});
