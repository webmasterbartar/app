/* DigiGram Store - Service Worker | PWA Offline Support */
const APP_CACHE = 'digigram-app-v3';
const IMAGE_CACHE = 'digigram-images-v6';
const EXTERNAL_CACHE = 'digigram-external-v1';

const OFFLINE_IMG = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg" style="background:#f3f4f6"><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#9ca3af" text-anchor="middle" dy=".3em">Offline</text></svg>`;

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(APP_CACHE).then(function (c) {
      return c.addAll(['/', '/index.html', '/manifest.json', '/sw.js']).catch(function () {});
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.map(function (n) {
          if (n !== APP_CACHE && n !== IMAGE_CACHE && n !== EXTERNAL_CACHE) return caches.delete(n);
        })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  var url = new URL(req.url);
  var origin = self.location.origin;
  var sameOrigin = url.origin === origin;

  /* 1. Navigation: SPA → always serve index.html when offline */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var clone = res.clone();
        return caches.open(APP_CACHE).then(function (c) { return c.put('/index.html', clone); }).then(function () { return res; });
      }).catch(function () {
        return caches.match('/index.html').then(function (c) { return c || caches.match('/'); });
      })
    );
    return;
  }

  /* 2. Same-origin app assets (JS, CSS, manifest, sw) → cache on load, serve from cache when offline */
  if (sameOrigin && (req.destination === 'script' || req.destination === 'style' || url.pathname.indexOf('/assets/') === 0 || url.pathname === '/manifest.json' || url.pathname === '/sw.js')) {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res.ok && res.type !== 'opaque') {
          var clone = res.clone();
          caches.open(APP_CACHE).then(function (c) { c.put(req, clone); });
        }
        return res;
      }).catch(function () { return caches.match(req).then(function (r) { return r || new Response('Offline', { status: 503 }); }); })
    );
    return;
  }

  /* 3. Images → cache first, then network; offline → placeholder */
  var isImg = req.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?|$)/i.test(url.pathname) || /picsum\.photos|pexels\.com|ui-avatars|storage\.googleapis|supabase|flaticon|placeholder\.com/i.test(url.hostname);
  if (isImg) {
    e.respondWith(
      caches.open(IMAGE_CACHE).then(function (c) {
        return c.match(req).then(function (cached) {
          if (cached) return cached;
          return fetch(req).then(function (res) {
            if (res.ok && res.type !== 'opaque') try { c.put(req, res.clone()); } catch (err) {}
            return res;
          }).catch(function () {
            return new Response(OFFLINE_IMG, { headers: { 'Content-Type': 'image/svg+xml' } });
          });
        });
      })
    );
    return;
  }

  /* 4. Video → cache first, then network */
  if (req.destination === 'video' || (/storage\.googleapis\.com/i.test(url.hostname) && /\.(mp4|webm)(\?|$)/i.test(url.pathname))) {
    e.respondWith(
      caches.open(IMAGE_CACHE).then(function (c) {
        return c.match(req).then(function (cached) {
          if (cached) return cached;
          return fetch(req).then(function (res) {
            if (res.ok && res.type !== 'opaque') try { c.put(req, res.clone()); } catch (err) {}
            return res;
          }).catch(function () { return new Response('', { status: 408 }); });
        });
      })
    );
    return;
  }

  /* 5. External CDN (Tailwind, fonts) → cache first; offline → from cache */
  if (/tailwindcss\.com|fonts\.googleapis|fonts\.gstatic|esm\.sh/i.test(url.hostname)) {
    e.respondWith(
      caches.open(EXTERNAL_CACHE).then(function (c) {
        return c.match(req).then(function (cached) {
          if (cached) return cached;
          return fetch(req).then(function (res) {
            if (res.ok) try { c.put(req, res.clone()); } catch (err) {}
            return res;
          }).catch(function () { return new Response('', { status: 503 }); });
        });
      })
    );
    return;
  }

  /* 6. Other (API, etc.) → network first, offline → JSON */
  e.respondWith(
    fetch(req).catch(function () {
      return new Response(JSON.stringify({ error: 'offline' }), { headers: { 'Content-Type': 'application/json' } });
    })
  );
});
