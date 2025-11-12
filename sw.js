// sw.js - Service Worker for PWA offline functionality

const CACHE_NAME = 'taskwarrior-inbox-v2';
const STATIC_ASSETS = [
    '/tw-inbox/',
    '/tw-inbox/index.html',
    '/tw-inbox/projekt/localStorage-manager.js',
    '/tw-inbox/projekt/config.js',
    '/tw-inbox/projekt/data.js',
    '/tw-inbox/projekt/export-manager.js',
    '/tw-inbox/projekt/app.js',
    '/tw-inbox/projekt/css/main.css',
    '/tw-inbox/manifest.json',
    '/tw-inbox/icons/icon-192x192.png',
    '/tw-inbox/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(error => {
                console.error('Failed to cache static assets:', error);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );
    self.clients.claim();
});

// Message event - handle app updates
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip non-HTTP requests
    if (!event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached version if available
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Otherwise fetch from network
                return fetch(event.request)
                    .then(networkResponse => {
                        // Clone the response for caching
                        const responseClone = networkResponse.clone();
                        
                        // Cache successful responses
                        if (networkResponse.status === 200) {
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        
                        return networkResponse;
                    })
                    .catch(() => {
                        // If both cache and network fail, return offline page for navigation requests
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Background sync for future task submission when online
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync-tasks') {
        console.log('Background sync triggered');
        // Here you could implement queued task submission
    }
});

// Push notification support (for future use)
self.addEventListener('push', event => {
    if (event.data) {
        const options = {
            body: event.data.text(),
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            vibrate: [200, 100, 200],
            tag: 'taskwarrior-notification',
            actions: [
                {
                    action: 'open',
                    title: 'Atidaryti'
                },
                {
                    action: 'close',
                    title: 'Užuaryti'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification('TaskWarrior Inbox', options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
