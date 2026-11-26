// Fast offline shell.
// - The app files (html, css, js, images) are served from the phone's cache at once, and refreshed in the background.
// - Data is never cached here: API calls are POST requests to the Apps Script backend and go straight to the network.
// - Bump CACHE on every release so iPhones pick up the new files.
const CACHE = 'teachersgate-web-1.9.0';
const SHELL = [
  './', 'index.html', 'css/app.css', 'js/app.js', 'manifest.webmanifest',
  'img/logo_ouahsnan.png', 'img/logo_green_school.png',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // API calls: never cached here
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;  // fonts and other sites: normal network
  // stale-while-revalidate: answer from the cache immediately, update the cache in the background
  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req).then((hit) => {
        const net = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; })
          .catch(() => hit || cache.match('index.html'));
        return hit || net;
      })
    )
  );
});
