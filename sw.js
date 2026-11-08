// Offline cache for Powder Peak Tycoon.
// Network first, so players always get the newest version when online;
// falls back to the cached copy when there is no connection.
const CACHE = 'powder-peak-v5';
const FILES = [
  './',
  'index.html',
  'powder-peak.html',
  'lib/three.min.js',
  'lib/OrbitControls.js',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'assets/shot-day.jpg',
  'assets/shot-night.jpg',
  'assets/shot-ride.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const sameOrigin = new URL(e.request.url).origin === location.origin;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(res => {
        if (res.ok && sameOrigin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
