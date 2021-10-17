const filesToCache = [
  '/',
  '/styles/css/style.css',
  '/styles/css/nav.css',
  '/styles/css/chrome.css',
  'images/logo.svg',
  'index.html',
  '/images/favicon/favicon.ico',
  '/scripts/swquery.js',
  '/scripts/no-right-click.js',
  '/scripts/main.js'
];

let cacheID = 'root-test-3';

self.addEventListener('install', event => {
  console.log('Attempting to install service worker and cache static assets');
 event.waitUntil(
    caches.open(cacheID)
    .then(cache => {
      return cache.addAll(filesToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Activating new service worker...');

  const cacheWhitelist = [cacheID];
async function active() {
  await self.clients.claim();
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    });
  );
 }
 active();
});

self.addEventListener('fetch', event => {
  console.log('Fetch event for ', event.request.url);
  event.respondWith(
    caches.match(event.request)
    .then(response => {
      if (response) {
        console.log('Found ', event.request.url, ' in cache');
        return response;
      }
      console.log('Network request for ', event.request.url);
      return fetch(event.request)
      .then(response => {
        /*if (response.status === 404) {
          return caches.match('pages/404.html');
        }*/
        return caches.open(cacheID)
        .then(cache => {
          cache.put(event.request.url, response.clone());
          return response;
        });
      });
    }).catch(error => {
      console.log('Error, ', error);
      // return caches.match('pages/offline.html');
    })
  );
});