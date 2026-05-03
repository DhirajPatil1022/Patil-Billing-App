const CACHE_NAME = 'patil-erp-cloud-v2'; // Incremented to v2 to refresh your phone's cache

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './sig.png',
  // Added external libraries to ensure PDF and Firebase work without internet
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap',
  'https://www.gstatic.com/firebasejs/9.1.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.1.0/firebase-database-compat.js'
];

// Install Event - Caching local UI files and external libraries
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching Patil ERP Assets...');
      // Using cache.addAll is strict; if one URL fails, it fails all.
      // This ensures your app is fully protected.
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); 
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
    // Let Firebase handle its own offline persistence logic
    return fetch(event.request);
  }

  // For UI assets (HTML, Images, Fonts, PDF Libs), use Cache-First strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
