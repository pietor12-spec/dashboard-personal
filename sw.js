// Service worker: permite instalar la app y abrirla sin conexión.
const V='dp-shell-v1';
const SHELL=['./','index.html','manifest.webmanifest','icons/logo.svg','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png','icons/favicon-32.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('dp-shell')&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
const CDN=['https://cdnjs.cloudflare.com','https://fonts.googleapis.com','https://fonts.gstatic.com'];
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  // librerías y fuentes: caché primero (para usar la app sin conexión)
  if(CDN.includes(u.origin)){e.respondWith(caches.open('dp-cdn').then(c=>c.match(e.request).then(m=>m||fetch(e.request).then(r=>{if(r.ok||r.type==='opaque')c.put(e.request,r.clone());return r;}))));return;}
  if(u.origin!==location.origin||u.pathname.endsWith('vault.json'))return;
  // red primero (siempre la última versión), caché si no hay conexión
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r;}).catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
