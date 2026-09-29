const CACHE = "trigger3d-v2-local";
const APP = ["./","./index.html","./styles.css","./app.js","./data.js","./manifest.webmanifest","./icons/icon.svg"];
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP)));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).then(res => {
    if (res && res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
    }
    return res;
  }).catch(() => caches.match(event.request)));
});
