/**
 * Image Pre-cache Utility
 * Downloads and caches all images for full offline support.
 * Must use same IMAGE_CACHE_NAME as Service Worker.
 */
const IMAGE_CACHE_NAME = 'digigram-images-v6';

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
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return false;
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
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const existing = await cache.match(url);
    if (existing) return true;
    const res = await fetch(url, { mode: 'cors' });
    if (res.ok) {
      await cache.put(url, res.clone());
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Pre-cache a list of image URLs in background (non-blocking) */
export async function precacheImages(urls: string[]): Promise<{ ok: number; fail: number }> {
  const unique = [...new Set(urls)].filter(Boolean);
  let ok = 0,
    fail = 0;
  for (const url of unique) {
    const success = await cacheImage(url);
    if (success) ok++;
    else if (isImageUrl(url)) fail++;
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

  // Static hardcoded URLs used across the app
  const staticUrls = [
    'https://picsum.photos/200/200?random=me',
    'https://picsum.photos/100/100?random=me',
    'https://picsum.photos/200/200?random=story1',
    'https://picsum.photos/800/400?random=hero1',
    'https://picsum.photos/800/400?random=hero2',
    'https://picsum.photos/800/400?random=hero3',
    'https://picsum.photos/300/300?random=promo1',
    'https://picsum.photos/300/300?random=promo2',
    'https://picsum.photos/100/100?random=store',
    'https://cdn-icons-png.flaticon.com/512/3059/3059463.png',
    // Profile highlights & stories
    'https://picsum.photos/200/200?random=50',
    'https://picsum.photos/200/200?random=51',
    'https://picsum.photos/200/200?random=52',
    'https://picsum.photos/200/200?random=53',
    'https://picsum.photos/200/200?random=54',
    'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3589903/pexels-photo-3589903.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=800',
    // ReelCard album art placeholders
    ...Array.from({ length: 8 }, (_, i) => `https://picsum.photos/50/50?random=${i + 1}`),
    ...Array.from({ length: 8 }, (_, i) => `https://picsum.photos/100/100?random=${i + 1}`),
  ];
  urls.push(...staticUrls);

  // Product detail gallery placeholders
  for (let i = 1; i <= 10; i++) {
    urls.push(`https://picsum.photos/400/400?random=${i + 10}`);
    urls.push(`https://picsum.photos/400/400?random=${i + 20}`);
    urls.push(`https://picsum.photos/400/400?random=${i + 30}`);
  }

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
