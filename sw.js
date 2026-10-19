// Service Worker: Die App startet auch ohne Netz (Sammlung ansehen); Scannen braucht Internet.
// Eigene Dateien: zuerst Netz (damit Updates sofort ankommen), sonst Cache.
// Bibliotheken und Schriften vom CDN: zuerst Cache (Versionen sind fest).
const CACHE = 'kunst-v4';
const SHELL = [
  './', 'index.html', 'styles.css', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon.png',
  'js/app.js', 'js/api.js', 'js/cloud.js', 'js/config.js', 'js/db.js', 'js/demo.js', 'js/icons.js',
  'js/photo.js', 'js/speak.js', 'js/state.js', 'js/ui.js', 'js/version.js', 'js/sync.js', 'js/visit.js', 'js/rewards.js', 'js/share.js',
  'js/views/quiz.js', 'js/views/compare.js', 'js/views/map.js',
  'js/views/scan.js', 'js/views/work.js', 'js/views/explore.js', 'js/views/collection.js', 'js/views/settings.js', 'js/views/login.js', 'js/views/visit.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isCdn = ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname);
  if (!sameOrigin && !isCdn) return; // z. B. Supabase: nie cachen

  if (isCdn) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (!res.ok && res.type !== 'opaque') return res;
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    })));
    return;
  }

  e.respondWith(fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('index.html'))));
});
