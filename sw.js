const CACHE_NAME = 'patil-erp-cloud-v1'; // Updated name to force a fresh install
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './sig.png'
];

// Install Event - Caching local UI files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching Patil ERP Assets...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Makes the new worker take over immediately
});

// Activate Event - Deleting old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch Event - Serve UI from cache, but Cloud Data from Network
self.addEventListener('fetch', (event) => {
  // Check if the request is for Firebase/Cloud data
  const isCloudData = event.request.url.includes('firebaseio.com') || 
                      event.request.url.includes('googleapis.com');

  if (isCloudData) {
    // Let Firebase handle its own offline logic; don't use Service Worker cache
    return fetch(event.request);
  }

  // For everything else (HTML, Images, JS), use Cache-First strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
