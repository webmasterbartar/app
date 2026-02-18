/**
 * Image Pre-cache Utility
 * Downloads and caches all images for full offline support.
 * Must use same IMAGE_CACHE_NAME as Service Worker.
 */
const IMAGE_CACHE_NAME = 'digigram-images-v8';

/** Domains that we cache images from */
const CACHEABLE_IMAGE_DOMAINS = [
  'picsum.photos',
  'images.pexels.com',
  'ui-avatars.com',
  'cdn-icons-png.flaticon.com',
  'storage.googleapis.com',
  'via.placeholder.com',
  'placeholder.com',
];

/** Check if URL is an image we should cache */
export function isImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('/') && (url.startsWith('/content/') || /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?|$)/i.test(url))) return true;
  if (!url.startsWith('http')) return false;
  try {
    const host = new URL(url).hostname;
    if (CACHEABLE_IMAGE_DOMAINS.some((d) => host.includes(d))) return true;
    if (host.includes('supabase')) return true;
    const ext = url.split('?')[0].toLowerCase();
    return /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?|$)/i.test(ext);
  } catch {
    return false;
  }
}

/** Add single image to cache (fire-and-forget) */
async function cacheImage(url: string): Promise<boolean> {
  if (!isImageUrl(url)) return false;
  try {
    if (!('caches' in window)) return false;
    const fullUrl = url.startsWith('/') ? window.location.origin + url : url;
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const existing = await cache.match(fullUrl);
    if (existing) return true;
    const res = await fetch(fullUrl, { mode: url.startsWith('/') ? 'same-origin' : 'cors' });
    if (res.ok) {
      await cache.put(fullUrl, res.clone());
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Pre-cache in small batches with delay so we don't flood the network and slow initial load */
const BATCH_SIZE = 4;
const BATCH_DELAY_MS = 400;

export async function precacheImages(urls: string[]): Promise<{ ok: number; fail: number }> {
  const unique = [...new Set(urls)].filter(Boolean);
  let ok = 0,
    fail = 0;
  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const batch = unique.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map((url) => cacheImage(url)));
    results.forEach((success, j) => {
      if (success) ok++;
      else if (isImageUrl(batch[j])) fail++;
    });
    if (i + BATCH_SIZE < unique.length) await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
  }
  return { ok, fail };
}

/** Collect ALL known image URLs from the app (static + dynamic) */
export function collectAllImageUrls(data?: {
  products?: any[];
  posts?: any[];
  blogs?: any[];
}): string[] {
  const urls: string[] = [];

  // اولویت: پروفایل و هایلایت‌ها و کاورها (اول کش می‌شوند)
  const profileFirst = [
    '/content/avatars/me.jpg',
    '/content/avatars/me-small.jpg',
    ...Array.from({ length: 5 }, (_, i) => `/content/avatars/story-${i + 1}.jpg`),
    ...Array.from({ length: 3 }, (_, i) => `/content/blogs/${i + 1}.jpg`),
    ...Array.from({ length: 4 }, (_, i) => `/content/reels/thumbnails/${i + 1}.jpg`),
    '/content/avatars/story1.jpg',
    '/content/avatars/store.jpg',
    ...Array.from({ length: 8 }, (_, i) => `/content/avatars/reel-${i + 1}.jpg`),
  ];
  urls.push(...profileFirst);
  const rest = [
    '/content/heroes/1.jpg', '/content/heroes/2.jpg', '/content/heroes/3.jpg',
    '/content/promos/1.jpg', '/content/promos/2.jpg',
    '/content/icons/app.jpg',
    ...Array.from({ length: 8 }, (_, i) => `/content/products/${i + 1}.jpg`),
    '/content/products/11.jpg', '/content/products/22.jpg',
  ];
  urls.push(...rest);

  // Dynamic data from Dexie
  if (data?.products) {
    for (const p of data.products) {
      const img = p.image_url || p.image;
      if (img) urls.push(img);
      if (p.variants && Array.isArray(p.variants)) {
        for (const v of p.variants) {
          if (v?.image) urls.push(v.image);
        }
      }
    }
  }
  if (data?.posts) {
    for (const p of data.posts) {
      const thumb = p.thumbnail;
      if (thumb) urls.push(thumb);
    }
  }
  if (data?.blogs) {
    for (const b of data.blogs) {
      if (b?.cover_image) urls.push(b.cover_image);
    }
  }

  return urls;
}
