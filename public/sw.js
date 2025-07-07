
const CACHE_NAME = 'agrismart-v2.0.2';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg',
  '/lovable-uploads/faa2b9c5-2be6-4b90-8c9b-ca59e3e7a6d8.png'
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
      return self.clients.claim();
    })
  );
});

// Enhanced fetch strategy for native app
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          // Update cache in background
          fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseClone);
                  });
              }
            })
            .catch(() => {
              // Network failed, but we have cached version
            });
          
          return cachedResponse;
        }
        
        // Try network first for new requests
        return fetch(event.request)
          .then((response) => {
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
            // Network failed and no cache
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

// Handle background sync for native app
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('AgriSmart SW: Background sync for native app');
    event.waitUntil(
      Promise.resolve()
    );
  }
});

// Handle push notifications for native app
self.addEventListener('push', (event) => {
  console.log('AgriSmart SW: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update from AgriSmart!',
    icon: '/lovable-uploads/faa2b9c5-2be6-4b90-8c9b-ca59e3e7a6d8.png',
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
