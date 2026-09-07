const ALWI_CACHE = 'nur3000-v1';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(ALWI_CACHE).then(function(c){
      return c.addAll(CORE);
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== ALWI_CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(function(){
        return caches.match('./index.html');
      })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function(m){
      if (m) return m;
      return fetch(e.request).then(function(res){
        var ok = res && (res.status === 200 || res.type === 'basic');
        if (ok) {
          var cp = res.clone();
          caches.open(ALWI_CACHE).then(function(c){ c.put(e.request, cp); });
        }
        return res;
      });
    })
  );
});
