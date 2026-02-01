/* DigiGram Store - Service Worker | PWA Offline */
const APP_CACHE = 'digigram-app-v5';
const IMAGE_CACHE = 'digigram-images-v7';
const EXTERNAL_CACHE = 'digigram-external-v2';

const OFFLINE_IMG = '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg" style="background:#f3f4f6"><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#9ca3af" text-anchor="middle" dy=".3em">Offline</text></svg>';

function cachePut(cache, request, response) {
  if (!response || !response.ok || response.type === 'opaque') return Promise.resolve(response);
  return cache.put(request, response.clone()).then(function () { return response; });
}

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(APP_CACHE).then(function (c) {
    return c.addAll(['/index.html', '/manifest.json', '/sw.js']).catch(function () {});
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (names) {
    return Promise.all(names.map(function (n) {
      if (n !== APP_CACHE && n !== IMAGE_CACHE && n !== EXTERNAL_CACHE) return caches.delete(n);
    }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  var url = new URL(req.url);
  var sameOrigin = url.origin === self.location.origin;

  /* 1. Navigation: Network First → همیشه آنلاین تازه، آفلاین از کش */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var clone = res.clone();
        return caches.open(APP_CACHE).then(function (c) {
          return c.put('/index.html', clone).then(function () { return res; });
        });
      }).catch(function () {
        return caches.match('/index.html').then(function (r) { return r || caches.match('/'); });
      })
    );
    return;
  }

  /* 2. Same-origin (JS, CSS, manifest, sw): Network First، بعد کش؛ حتماً کش می‌کنیم */
  if (sameOrigin && (req.destination === 'script' || req.destination === 'style' || url.pathname.indexOf('/assets/') === 0 || url.pathname === '/manifest.json' || url.pathname === '/sw.js')) {
    e.respondWith(
      fetch(req).then(function (res) {
        return caches.open(APP_CACHE).then(function (c) { return cachePut(c, req, res); });
      }).catch(function () {
        return caches.match(req).then(function (r) { return r || new Response('Offline', { status: 503 }); });
      })
    );
    return;
  }

  /* 3. Images: کش اول، بعد شبکه */
  var isImg = req.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?|$)/i.test(url.pathname) || /picsum\.photos|pexels\.com|ui-avatars|storage\.googleapis|supabase|flaticon|placeholder\.com/i.test(url.hostname);
  if (isImg) {
    e.respondWith(
      caches.open(IMAGE_CACHE).then(function (c) {
        return c.match(req).then(function (cached) {
          if (cached) return cached;
          return fetch(req).then(function (res) {
            if (res.ok && res.type !== 'opaque') return cachePut(c, req, res);
            return res;
          }).catch(function () {
            return new Response(OFFLINE_IMG, { headers: { 'Content-Type': 'image/svg+xml' } });
          });
        });
      })
    );
    return;
  }

  /* 4. Video: کش اول، بعد شبکه */
  if (req.destination === 'video' || (/storage\.googleapis\.com/i.test(url.hostname) && /\.(mp4|webm)(\?|$)/i.test(url.pathname))) {
    e.respondWith(
      caches.open(IMAGE_CACHE).then(function (c) {
        return c.match(req).then(function (cached) {
          if (cached) return cached;
          return fetch(req).then(function (res) {
            if (res.ok && res.type !== 'opaque') return cachePut(c, req, res);
            return res;
          }).catch(function () { return new Response('', { status: 408 }); });
        });
      })
    );
    return;
  }

  /* 5. External CDN: Network First تا اول لود درست بشه، بعد از کش */
  if (/tailwindcss\.com|fonts\.googleapis|fonts\.gstatic|esm\.sh/i.test(url.hostname)) {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res.ok) return caches.open(EXTERNAL_CACHE).then(function (c) { return cachePut(c, req, res); });
        return res;
      }).catch(function () {
        return caches.open(EXTERNAL_CACHE).then(function (c) { return c.match(req); }).then(function (r) { return r || new Response('', { status: 503 }); });
      })
    );
    return;
  }

  /* 6. بقیه: شبکه اول */
  e.respondWith(fetch(req).catch(function () {
    return new Response(JSON.stringify({ error: 'offline' }), { headers: { 'Content-Type': 'application/json' } });
  }));
});
