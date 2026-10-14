const CACHE='c40-exam-scope-20261014';
const CORE=['./','index.html','app.js','data.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/icon-180.png','fiches/fm45-reader.html','vendor/pdf.min.js','vendor/pdf.worker.min.js'];
// One missing optional PDF must never prevent a new application from installing.
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
    const cache=await caches.open(CACHE);
    const keys=await caches.keys();
    const oldKeys=keys.filter(k=>k.startsWith('c40-')&&k!==CACHE);
    // Preserve previously downloaded PDFs and images without delaying updates on network downloads.
    for(const key of oldKeys){
      const old=await caches.open(key);
      for(const req of await old.keys()){
        const path=new URL(req.url).pathname;
        if(/\.(pdf|png|jpg|jpeg|svg)$/.test(path)&&!(await cache.match(req))) await cache.put(req,await old.match(req));
      }
      await caches.delete(key);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  const fresh=url.origin===location.origin && (req.mode==='navigate'||/\/(index\.html|app\.js|data\.js)$/.test(url.pathname));
  if(fresh){
    e.respondWith((async()=>{
      try {
        const r=await fetch(new Request(req,{cache:'no-store'}));
        if(!r.ok) throw new Error('Network response '+r.status);
        const cache=await caches.open(CACHE);
        await cache.put(req,r.clone());
        if(req.mode==='navigate' && (url.pathname.endsWith('/class40/') || url.pathname.endsWith('/index.html'))) await cache.put('index.html',r.clone());
        return r;
      } catch(error) {
        const hit=await caches.match(req) || await caches.match(url.pathname) || ((url.pathname.endsWith('/class40/') || url.pathname.endsWith('/index.html')) ? await caches.match('index.html') : null);
        if(hit) return hit;
        throw error;
      }
    })());
    return;
  }
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(async r=>{
    if(r.ok||r.type==='opaque'){const cp=r.clone();const cache=await caches.open(CACHE); await cache.put(req,cp);}
    return r;
  })));
});
