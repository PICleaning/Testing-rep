// Employee Portal service worker — v2.1.2
// Network-first (always loads the newest app when online), cached copy when offline,
// and opens the app when a welfare-check notification is tapped.
const CACHE_VERSION = 'ep-v2.1.2';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).then(r => {
    const c = r.clone();
    caches.open(CACHE_VERSION).then(cache => cache.put(e.request, c));
    return r;
  }).catch(() => caches.match(e.request)));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { c.postMessage({ type: 'welfare-open' }); if ('focus' in c) return c.focus(); }
    return self.clients.openWindow('./');
  }));
});
