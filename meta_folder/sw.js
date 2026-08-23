var CACHE='meta-alwi-v2';
var INTI=['./','./index.html','./manifest.json','./img/icon-192.png','./img/icon-512.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(INTI)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(k){
    return Promise.all(k.filter(function(x){return x!==CACHE}).map(function(x){return caches.delete(x)}));
  }).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var u=new URL(e.request.url);
  if(u.origin!==location.origin)return;
  e.respondWith(caches.match(e.request).then(function(r){
    return r||fetch(e.request).then(function(t){
      var cl=t.clone(); caches.open(CACHE).then(function(c){c.put(e.request,cl)});
      return t;
    }).catch(function(){return caches.match('./index.html')});
  }));
});
