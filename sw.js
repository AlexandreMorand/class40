/* Classe 40 - service worker (VF)
   Mise a jour : incrementer CACHE (ex. c40-v2-2) a chaque changement de index.html / app.js / data.js.
   La page se recharge toute seule via l'ecouteur controllerchange dans app.js. */
const CACHE = 'c40-v2-1';
const CORE = [
  './',
  'index.html',
  'app.js',
  'data.js',
  'manifest.webmanifest',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => Promise.allSettled(CORE.map((u) => c.add(u)))).then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put('index.html', cp)); return r; })
        .catch(() => caches.match('index.html').then((m) => m || caches.match('./')))
    );
    return;
  }
  if (url.pathname.startsWith('/class40/fiches/') || url.pathname.includes('/fiches/') || CORE.some((u) => url.pathname.endsWith(u.replace('./','')))) {
    e.respondWith(
      caches.match(e.request).then((m) => m || fetch(e.request).then((r) => {
        if (r && r.ok) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); }
        return r;
      }))
    );
  }
});
