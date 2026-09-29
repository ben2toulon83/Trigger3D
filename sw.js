const CACHE="trigger3d-v1";
const APP=["./","./index.html","./styles.css","./app.js","./data.js","./manifest.webmanifest","./icons/icon.svg"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP))));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
    if(e.request.method==="GET" && res.ok){
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy));
    }
    return res;
  }).catch(()=>hit)));
});
