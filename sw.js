/* ============================================================
   Service Worker : 3D Solar System Simulator
   Cache-first strategy for offline support
   v3: semua aset LOKAL (tanpa CDN) — dulu install bisa gagal
   total kalau 1 saja request CDN gagal (cache.addAll itu
   all-or-nothing), bikin mode offline mati diam-diam.
   ============================================================ */

const CACHE = 'cosmic-3d-v3';

const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon.svg',
    './libs/three.min.js',
    './libs/OrbitControls.js',
    './libs/tween.umd.js',
    './Sun.jpg',
    './Mercury.jpg',
    './Venus.jpg',
    './Earth.jpg',
    './Mars.jpg',
    './Jupiter.jpg',
    './Saturn.jpg',
    './Uranus.jpg',
    './Neptune.jpg'
];

// Install: pre-cache satu-satu (bukan addAll) supaya 1 file gagal
// tidak membatalkan seluruh install; file inti tetap wajib ada.
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(async cache => {
            const results = await Promise.allSettled(
                ASSETS.map(url => cache.add(url))
            );
            results.forEach((r, i) => {
                if (r.status === 'rejected') {
                    console.error('[sw] gagal cache:', ASSETS[i], r.reason);
                }
            });
        })
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

// Fetch: cache-first, fallback ke network + cache.
// Navigasi (buka app) yang miss di cache jatuh ke index.html —
// tanpa ini, buka PWA offline via URL root bisa gagal padahal
// index.html-nya ada di cache.
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
            }).catch(() => {
                if (e.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                return cached;
            });
        })
    );
});
