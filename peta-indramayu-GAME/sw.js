/* SW Peta 3D: cache-first file lokal biar bisa main offline (peta OSM tetap perlu internet) */
const C='peta3d-v2';
const INTI=['index.html','manifest.webmanifest','three.module.js','es-module-shims.js',
 'alwi_bubble1.js','alwi_bubble2.js','alwi_bubble3.js','alwi_bubble4.js'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(INTI)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{e.waitUntil(
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k))))
  .then(()=>self.clients.claim())
);});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  if(u.origin!==location.origin)return; // CDN & tile OSM langsung internet
  e.respondWith(
    caches.match(e.request).then(h=>h||fetch(e.request).then(r=>{
      const s=r.clone();caches.open(C).then(c=>c.put(e.request,s));return r;
    }).catch(()=>caches.match('index.html')))
  );
});
