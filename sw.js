/**
 * Sri Aishwaryam Yoga Kalaiyagam - PWA cache.
 * Only same-origin, explicitly listed public static assets are cached.
 * Admin/student portal pages and third-party/API responses are not pre-cached.
 */
const CACHE_NAME = 'yoga-studio-pwa-v11';

const STATIC_ASSETS = [
  './',
  './index.html',
  './about.html',
  './courses.html',
  './booking.html',
  './membership.html',
  './events.html',
  './contact.html',
  './manifest.json',
  './assets/css/style.css',
  './assets/css/animations.css',
  './assets/css/polish.css',
  './assets/js/main.js',
  './assets/js/supabase-config.js',
  './assets/js/contact.js',
  './assets/js/cloud-db.js',
  './assets/js/booking.js',
  './assets/js/gallery.js',
  './assets/js/membership.js',
  './assets/images/logo.svg',
  './assets/images/logo.png',
  './assets/images/emblem_kalaiyagam.png',
  './assets/images/sritharan.jpg',
  './assets/images/jayaharan.jpg',
  './assets/images/logo_kalaiyagam.png',
  './assets/images/logo_institution.png',
  './assets/images/iuyf_logo.png',
  './assets/images/hero-illustration.svg',
  './assets/images/icons/icon-192.png',
  './assets/images/icons/icon-512.png'
];

const STATIC_PATHS = new Set(
  STATIC_ASSETS.map((asset) => new URL(asset, self.location.href).pathname)
);

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((name) => name.startsWith('yoga-studio-pwa-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Never intercept third-party resources, Supabase/API requests, or other origins.
  if (url.origin !== self.location.origin) return;

  const isStaticAsset = STATIC_PATHS.has(url.pathname);
  if (!isStaticAsset) {
    // For uncached navigations, use the network and fall back to the public home page.
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request).catch(() => caches.match('./index.html'))
      );
    }
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response && response.ok && response.type === 'basic') {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        const fallback = await cache.match('./index.html');
        if (fallback) return fallback;
      }
      throw error;
    }
  })());
});
