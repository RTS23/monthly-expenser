const CACHE_NAME = 'spendsync-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/favicon.svg',
    '/icon-192.png',
    '/icon-512.png',
    '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('SpendSync: Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - network first for API, cache first for static
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // API requests - network first, no cache
    if (url.pathname.startsWith('/api') || url.pathname.startsWith('/auth')) {
        event.respondWith(
            fetch(request).catch(() => {
                return new Response(
                    JSON.stringify({ error: 'You are offline' }),
                    { headers: { 'Content-Type': 'application/json' } }
                );
            })
        );
        return;
    }

    // Static assets - cache first, then network
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return cached version and update in background
                fetch(request).then((networkResponse) => {
                    if (networkResponse.ok) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, networkResponse);
                        });
                    }
                });
                return cachedResponse;
            }

            // Not in cache, fetch from network
            return fetch(request).then((networkResponse) => {
                if (networkResponse.ok) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return networkResponse;
            });
        })
    );
});

// Handle background sync for offline expense additions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-expenses') {
        event.waitUntil(syncExpenses());
    }
});

async function syncExpenses() {
    // Get pending expenses from IndexedDB and sync when online
    console.log('SpendSync: Syncing offline expenses...');
}
