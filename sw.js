const CACHE='c40-n2fiche89';
const PRECACHE=["./","index.html","manifest.webmanifest","vendor/pdf.min.js","vendor/pdf.worker.min.js","icons/icon-192.png","icons/icon-512.png","icons/icon-180.png","fiches/cr-1.pdf","fiches/cr-2.pdf","fiches/cr-3.pdf","fiches/cr-4.pdf","fiches/cr-5.pdf","fiches/cr-6.pdf","fiches/cr-7.pdf","fiches/cr-8.pdf","fiches/cr-9.pdf","fiches/cr-10.pdf","fiches/cr-11.pdf","fiches/cr-12.pdf","fiches/cr-13.pdf","fiches/cr-14.pdf","fiches/cr-16.pdf","fiches/cr-17.pdf","fiches/cr-18.pdf","fiches/cr-19.pdf","fiches/cr-20.pdf","fiches/cr-21.pdf","fiches/cr-22.pdf","fiches/cr-23.pdf","fiches/cr-24.pdf","fiches/cr-25.pdf","fiches/cr-26.pdf","fiches/cr-27.pdf","fiches/cr-28.pdf","fiches/cr-29.pdf","fiches/cr-30.pdf","fiches/cr-31.pdf","fiches/da-1.pdf","fiches/da-2.pdf","fiches/da-3.pdf","fiches/da-4.pdf","fiches/da-5.pdf","fiches/da-6.pdf","fiches/da-7.pdf","fiches/da-8.pdf","fiches/da-exam-prep.pdf","fiches/fm-1.pdf","fiches/fm-2.pdf","fiches/fm-3.pdf","fiches/fm-6.pdf","fiches/fm-4-5.pdf","fiches/cg-1.pdf","fiches/cg-2.pdf","fiches/cg-3.pdf","fiches/cg-9.pdf","fiches/cg-4-7.pdf","fiches/da-9.pdf","fiches/da-10.pdf","fiches/da-11.pdf","fiches/da-12.pdf","fiches/cg-10.pdf","fiches/fm-7.pdf","fiches/fm-8.pdf","fiches/fm-9.pdf"];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin===location.origin && (req.mode==='navigate' || url.pathname.endsWith('index.html'))){
    // network first for the page so updates arrive, cache fallback offline
    e.respondWith(fetch(req).then(r=>{ const cp=r.clone(); caches.open(CACHE).then(c=>c.put('index.html',cp)); return r; }).catch(()=>caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit=>hit || fetch(req).then(r=>{ if(r.ok || r.type==='opaque'){ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); } return r; })));
});
