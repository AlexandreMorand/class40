const CACHE='c40-cr-dlfix-20261025';
const CORE=['./','index.html','app.js','data.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/icon-180.png','fiches/fm45-reader.html','vendor/pdf.min.js','vendor/pdf.worker.min.js'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(async c=>{
    await Promise.all(CORE.map(async path=>{
      const response=await fetch(new Request(path,{cache:'reload'}));
      if(!response.ok) throw new Error('Core cache failed: '+path);
      await c.put(path,response);
    }));
    await self.skipWaiting();
  }));
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    // Purge every previous cache outright. Earlier versions migrated old PDF
    // entries forward, which kept stale or broken fiche responses alive forever.
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('c40-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==location.origin) return;
  // PDFs always come straight from the network. The service worker never caches
  // them: a cached fiche can silently go stale and the PDF viewer issues range
  // requests that must not be answered from a cache.
  if(/\.pdf$/i.test(url.pathname)) return;
  const fresh=req.mode==='navigate'||/\/(index\.html|app\.js|data\.js|sw\.js)$/.test(url.pathname);
  if(fresh){
    e.respondWith((async()=>{
      try {
        const r=await fetch(new Request(req,{cache:'no-store'}));
        if(!r.ok) throw new Error('Network response '+r.status);
        const cache=await caches.open(CACHE);
        if(url.pathname.endsWith('/class40/')||url.pathname.endsWith('/index.html')) await cache.put('index.html',r.clone());
        else await cache.put(req,r.clone());
        return r;
      } catch(error) {
        const hit=(url.pathname.endsWith('/class40/')||url.pathname.endsWith('/index.html')) ? await caches.match('index.html') : await caches.match(req);
        if(hit) return hit;
        throw error;
      }
    })());
    return;
  }
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(async r=>{
    if(r.ok){const cp=r.clone();const cache=await caches.open(CACHE); await cache.put(req,cp);}
    return r;
  })));
});

// CR credibility revision published 20 October 2026.
