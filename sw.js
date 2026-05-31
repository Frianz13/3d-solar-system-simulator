/* ============================================================
   Service Worker — 3D Solar System Simulator
   Cache-first strategy for offline support
   ============================================================ */

const CACHE = 'cosmic-3d-v1';

const ASSETS = [
    './index.html',
    './manifest.json',
    './icon.svg',
    './Sun.jpg',
    './Mercury.jpg',
    './Venus.jpg',
    './Earth.jpg',
    './Mars.jpg',
    './Jupiter.jpg',
    './Saturn.jpg',
    './Uranus.jpg',
    './Neptune.jpg',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
    'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js'
];

// Install: pre-cache all assets
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE).map(k => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

// Fetch: cache-first, fallback to network + cache
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(res => {
                if (res.ok) {
                    const clone = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, clone));
                }
                return res;
            }).catch(() => cached); // offline fallback
        })
    );
});
