const CACHE_NAME = 'student-data-v3-new-repo'; // Bumped to v3 to force cache refresh!

const urlsToCache = [
  './',
  './index.html',
  './app.html',
  './manifest.json',
  
  // UNCOMMENT the next line if you upload admin.html to the same repository
  // './admin.html', 

  // Fonts and Backgrounds cached for completely offline preview generation
  './OdiaFont.ttf',
  './background.png',

  // Images 
  './icon-192.png',
  './icon-512.png',

  // External Libraries
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore-compat.js',
  'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.css'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Dynamic Network-First fallback so bugs get patched on users' phones immediately
self.addEventListener('fetch', event => {
  const req = event.request;

  // Use Network-First for HTML files (gets bug fixes instantly)
  if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then(networkResponse => {
           const responseClone = networkResponse.clone();
           caches.open(CACHE_NAME).then(cache => cache.put(req, responseClone));
           return networkResponse;
        })
        .catch(() => {
           // If completely offline, fall back to the cached HTML
           return caches.match(req);
        })
    );
  } else {
    // For all other assets (JS, Images, Fonts), keep Cache-First for speed and offline capabilities
    event.respondWith(
      caches.match(req).then(cachedResponse => {
        if (cachedResponse) {
            return cachedResponse;
        }
        return fetch(req);
      })
    );
  }
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});