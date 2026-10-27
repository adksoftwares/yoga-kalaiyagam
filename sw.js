/**
 * ஸ்ரீ ஐஸ்வர்யம் யோகா கலையகம் - சேவைப் பணியாளர் (Service Worker)
 * Yoga Studio Batticaloa PWA Cache & Offline Engine
 */

const CACHE_NAME = 'yoga-studio-pwa-v3';

const STATIC_ASSETS = [
  './',
  './index.html',
  './about.html',
  './courses.html',
  './booking.html',
  './membership.html',
  './events.html',
  './contact.html',
  './student-portal.html',
  './manifest.json',
  './assets/css/style.css',
  './assets/css/animations.css',
  './assets/js/main.js',
  './assets/js/cloud-db.js',
  './assets/js/pranayama.js',
  './assets/js/booking.js',
  './assets/js/student.js',
  './assets/js/gallery.js',
  './assets/js/membership.js',
  './assets/images/logo.svg',
  './assets/images/banner.jpg',
  './assets/images/sritharan.jpg',
  './assets/images/jayaharan.jpg',
  './assets/images/logo_kalaiyagam.png',
  './assets/images/logo_institution.png',
  './assets/images/iuyf_logo.png',
  './assets/images/hero-illustration.svg',
  './assets/images/icons/icon-192.png',
  './assets/images/icons/icon-512.png'
];

// Install: Cache static core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[PWA SW] Pre-caching offline assets for Yoga Studio');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[PWA SW] Deleting obsolete cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-While-Revalidate Strategy
self.addEventListener('fetch', (event) => {
  // Ignore non-GET or chrome-extension requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache valid responses
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });

      return cachedResponse || fetchPromise;
    })
  );
});
