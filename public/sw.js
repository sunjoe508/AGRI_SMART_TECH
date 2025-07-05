
const CACHE_NAME = 'agrismart-v2.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg'
];

// Install service worker and cache resources
self.addEventListener('install', (event) => {
  console.log('AgriSmart SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('AgriSmart SW: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force activation of new service worker
        return self.skipWaiting();
      })
  );
});

// Activate service worker and clean old caches
self.addEventListener('activate', (event) => {
  console.log('AgriSmart SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('AgriSmart SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages
      return self.clients.claim();
    })
  );
});

// Fetch event with network-first strategy for dynamic content
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If we got a response, clone it and store in cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // If not in cache, return offline page or error
            return new Response('App is offline. Please check your connection.', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Handle background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('AgriSmart SW: Background sync');
    event.waitUntil(
      // Add background sync logic here
      Promise.resolve()
    );
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('AgriSmart SW: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update from AgriSmart!',
    icon: '/placeholder.svg',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification('AgriSmart', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('AgriSmart SW: Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
