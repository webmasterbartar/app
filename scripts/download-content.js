/**
 * DigiGram Store – دانلود عکس‌های واقعی از چند منبع به public/content/
 * Run: yarn content:download
 * منابع: Lorem Flickr (Flickr CC) و Unsplash Source (عکس‌های واقعی)
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', 'public', 'content');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function mkdir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function get(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const tryReq = (attempt) => {
      const u = new URL(url);
      const opts = {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'GET',
        headers: { 'User-Agent': UA, Accept: 'image/*' },
      };
      const req = https.request(opts, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const loc = res.headers.location;
          if (loc) return get(loc.startsWith('http') ? loc : new URL(loc, url).href, retries).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          if (attempt < retries) setTimeout(() => tryReq(attempt + 1), 2000);
          else reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      });
      req.on('error', (e) => {
        if (attempt < retries) setTimeout(() => tryReq(attempt + 1), 2000);
        else reject(e);
      });
      req.end();
    };
    tryReq(0);
  });
}

async function save(url, filePath) {
  try {
    const buf = await get(url);
    if (!buf || buf.length < 500) throw new Error('response too small');
    mkdir(path.dirname(filePath));
    fs.writeFileSync(filePath, buf);
    console.log('OK', path.relative(ROOT, filePath));
    return true;
  } catch (e) {
    console.warn('SKIP', path.relative(ROOT, filePath), e.message);
    return false;
  }
}

// منبع ۱: Lorem Flickr (Flickr CC)
const lorem = (w, h, tag) => `https://loremflickr.com/${w}/${h}/${tag}`;
// منبع ۲: Unsplash Source (redirect به عکس واقعی)
const unsplash = (w, h, q) => `https://source.unsplash.com/${w}x${h}/?${q}`;

async function main() {
  mkdir(ROOT);
  const tasks = [
    // --- products (منبع: Unsplash + Lorem Flickr) ---
    { path: 'products/1.jpg', url: unsplash(400, 400, 'headphones') },
    { path: 'products/2.jpg', url: unsplash(400, 400, 'smartwatch') },
    { path: 'products/3.jpg', url: unsplash(400, 400, 'sneakers') },
    { path: 'products/4.jpg', url: lorem(400, 400, 'camera') },
    { path: 'products/5.jpg', url: lorem(400, 400, 'backpack') },
    { path: 'products/6.jpg', url: lorem(400, 400, 'laptop') },
    { path: 'products/7.jpg', url: lorem(400, 400, 'handbag') },
    { path: 'products/8.jpg', url: lorem(400, 400, 'powerbank') },
    { path: 'products/11.jpg', url: lorem(400, 400, 'headphones-black') },
    { path: 'products/22.jpg', url: lorem(400, 400, 'watch-silver') },
    // --- blogs ---
    { path: 'blogs/1.jpg', url: lorem(800, 600, 'technology') },
    { path: 'blogs/2.jpg', url: lorem(800, 600, 'lifestyle') },
    { path: 'blogs/3.jpg', url: lorem(800, 600, 'fashion') },
    // --- reels thumbnails ---
    { path: 'reels/thumbnails/1.jpg', url: lorem(400, 600, 'music') },
    { path: 'reels/thumbnails/2.jpg', url: lorem(400, 600, 'sport') },
    { path: 'reels/thumbnails/3.jpg', url: lorem(400, 600, 'travel') },
    { path: 'reels/thumbnails/4.jpg', url: lorem(400, 600, 'nature') },
    // --- heroes (منبع: Unsplash) ---
    { path: 'heroes/1.jpg', url: unsplash(800, 400, 'shopping') },
    { path: 'heroes/2.jpg', url: unsplash(800, 400, 'electronics') },
    { path: 'heroes/3.jpg', url: unsplash(800, 400, 'fitness') },
    // --- promos ---
    { path: 'promos/1.jpg', url: lorem(300, 300, 'sale') },
    { path: 'promos/2.jpg', url: lorem(300, 300, 'discount') },
    // --- avatars ---
    { path: 'avatars/me.jpg', url: lorem(200, 200, 'portrait') },
    { path: 'avatars/me-small.jpg', url: lorem(100, 100, 'person') },
    { path: 'avatars/story1.jpg', url: lorem(100, 100, 'story') },
    { path: 'avatars/store.jpg', url: lorem(100, 100, 'shop') },
    { path: 'avatars/story-1.jpg', url: lorem(200, 200, 'lifestyle') },
    { path: 'avatars/story-2.jpg', url: lorem(200, 200, 'event') },
    { path: 'avatars/story-3.jpg', url: lorem(200, 200, 'travel') },
    { path: 'avatars/story-4.jpg', url: lorem(200, 200, 'tech') },
    { path: 'avatars/story-5.jpg', url: lorem(200, 200, 'minimal') },
    { path: 'avatars/reel-1.jpg', url: lorem(50, 50, 'album') },
    { path: 'avatars/reel-2.jpg', url: lorem(50, 50, 'music') },
    { path: 'avatars/reel-3.jpg', url: lorem(50, 50, 'art') },
    { path: 'avatars/reel-4.jpg', url: lorem(50, 50, 'concert') },
    { path: 'avatars/reel-5.jpg', url: lorem(50, 50, 'guitar') },
    { path: 'avatars/reel-6.jpg', url: lorem(50, 50, 'headphones') },
    { path: 'avatars/reel-7.jpg', url: lorem(50, 50, 'microphone') },
    { path: 'avatars/reel-8.jpg', url: lorem(50, 50, 'vinyl') },
    // --- icon ---
    { path: 'icons/app.jpg', url: lorem(512, 512, 'shop') },
  ];

  let ok = 0, fail = 0;
  for (const { path: p, url } of tasks) {
    if (await save(url, path.join(ROOT, p))) ok++;
    else fail++;
  }
  console.log('\nDone. OK:', ok, 'Failed:', fail);
  if (fail > 0) console.log('Run again to retry: yarn content:download');
}

main().catch((e) => { console.error(e); process.exit(1); });
