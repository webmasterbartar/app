
const CACHE_NAME = 'digigram-core-v10';
const IMAGE_CACHE_NAME = 'digigram-images-v6';

// 1. ASSET PRE-CACHING (Cache First Strategy)
// These files are critical for the "App Shell" and should be loaded from cache immediately.
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&display=swap',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  // Critical Dependencies
  'https://esm.sh/react@^19.2.3',
  'https://esm.sh/react-dom@^19.2.3',
  'https://esm.sh/react-router-dom@^7.13.0',
  'https://esm.sh/dexie@^4.2.1',
  'https://esm.sh/dexie-react-hooks@^4.2.0',
  'https://esm.sh/framer-motion@^12.29.2',
  'https://esm.sh/@vitejs/plugin-react@^5.1.2',
  'https://esm.sh/lucide-react@^0.563.0',
  'https://esm.sh/@supabase/supabase-js@^2.93.1'
];

// Offline Placeholder SVG
const OFFLINE_IMAGE = `
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg" style="background:#f3f4f6">
  <text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#9ca3af" text-anchor="middle" dy=".3em">Offline Mode</text>
</svg>
`;

// Helper for consistent hashing
const getHashIndex = (str, max) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
};

// --- INSTALL EVENT ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// --- ACTIVATE EVENT ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// --- FETCH EVENT ---
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. NAVIGATION REQUESTS (SPA Handler)
  // If the user refreshes '/shop', '/product/1', etc. while offline, serve index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // 2. IMAGES (Cache First - aggressive offline support)
  // Cache ALL image requests: profile, products, covers, highlights, avatars, etc.
  const isImageRequest = event.request.destination === 'image' ||
    url.hostname.includes('picsum.photos') ||
    url.hostname.includes('images.pexels.com') ||
    url.hostname.includes('pexels.com') ||
    url.hostname.includes('ui-avatars.com') ||
    url.hostname.includes('storage.googleapis.com') ||
    url.hostname.includes('supabase') ||
    url.hostname.includes('cdn-icons-png.flaticon.com') ||
    url.hostname.includes('via.placeholder.com') ||
    /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?|$)/i.test(url.pathname);

  if (isImageRequest) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.ok && networkResponse.type !== 'opaque') {
                try { cache.put(event.request, networkResponse.clone()); } catch (e) {}
              }
              return networkResponse;
            })
            .catch(() => {
              return new Response(OFFLINE_IMAGE, {
                headers: { 'Content-Type': 'image/svg+xml' }
              });
            });
        });
      })
    );
    return;
  }

  // 2b. VIDEOS (Cache for offline playback)
  if (event.request.destination === 'video' ||
    url.hostname.includes('storage.googleapis.com') && /\.(mp4|webm)(\?|$)/i.test(url.pathname)) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.ok && networkResponse.type === 'basic') {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => new Response('Offline', { status: 408 }));
        });
      })
    );
    return;
  }

  // 3. UI ASSETS / SCRIPTS (Stale-While-Revalidate)
  // Serve from cache immediately, then update cache in background.
  if (
    url.hostname.includes('esm.sh') || 
    url.hostname.includes('fonts.googleapis.com') || 
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('tailwindcss.com')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
            // Network failed, just return what we have (or nothing if cache is empty)
            console.warn('[SW] Fetch failed for', event.request.url);
        });

        // Return cached response if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. API REQUESTS (Network First)
  // Try network, if fails, look for cache (if we implemented API caching)
  // For now, we rely on Dexie for data, so API calls are minimal.
  event.respondWith(
    fetch(event.request).catch(() => {
        // Optional: Return a JSON fallback if needed
        return new Response(JSON.stringify({ error: 'offline' }), { 
            headers: { 'Content-Type': 'application/json' } 
        });
    })
  );
});
