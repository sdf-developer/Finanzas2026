const CACHE = 'misfinanzas-v1';
const ASSETS = [
  '/Finanzasalvaro/',
  '/Finanzasalvaro/index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Para el Worker de Cloudflare siempre ir a red (datos siempre frescos)
  if(e.request.url.includes('workers.dev')) {
    e.respondWith(fetch(e.request));
    return;
  }
  // Para el resto: red primero, si falla usar caché
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
