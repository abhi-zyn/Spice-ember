/* ============================================
   SPICE & EMBER - SERVICE WORKER
   ============================================ */

const CACHE_NAME = 'spice-ember-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/menu.html',
  '/book-table.html',
  '/order.html',
  '/about.html',
  '/404.html',
  '/css/style.css',
  '/css/admin.css',
  '/js/config.js',
  '/js/menu-data.js',
  '/js/cart.js',
  '/js/main.js',
  '/js/admin.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/404.html');
        }
      });
    })
  );
});