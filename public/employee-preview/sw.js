const CACHE_PREFIX="arees-commissions-shell-";
const CACHE_NAME=CACHE_PREFIX+"v2";
const SHELL=["/employee-preview/","/employee-preview/manifest.webmanifest","/icon-192.png","/icon-512.png","/icon-maskable-512.png","/apple-touch-icon.png"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",event=>{const req=event.request,url=new URL(req.url);if(req.method!=="GET"||url.origin!==self.location.origin||url.pathname.startsWith("/api/"))return;if(req.mode==="navigate"&&url.pathname==="/employee-preview/"){event.respondWith(fetch(req).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put("/employee-preview/",copy))}return response}).catch(()=>caches.match("/employee-preview/")));return}if(SHELL.includes(url.pathname))event.respondWith(caches.match(req).then(cached=>cached||fetch(req)))});
