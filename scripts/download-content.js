/**
 * DigiGram Store - Download content assets to public/content/
 * Run once: node scripts/download-content.js  or  yarn content:download
 * Uses fixed Picsum IDs so the same images are downloaded every time.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', 'public', 'content');

function mkdir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'DigiGram-Content-Sync/1.0' } }, (res) => {
      if (res.statusCode === 302 && res.headers.location) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function save(url, filePath) {
  try {
    const buf = await download(url);
    mkdir(path.dirname(filePath));
    fs.writeFileSync(filePath, buf);
    console.log('OK', path.relative(ROOT, filePath));
    return true;
  } catch (e) {
    console.warn('SKIP', filePath, e.message);
    return false;
  }
}

// Picsum: https://picsum.photos/id/{id}/{width}/{height}
const base = (id, w, h) => `https://picsum.photos/id/${id}/${w || 400}/${h || 400}`;

async function main() {
  mkdir(ROOT);

  // --- Products (8 main + variant extras) ---
  const productDir = path.join(ROOT, 'products');
  mkdir(productDir);
  for (let i = 1; i <= 8; i++) await save(base(i, 400, 400), path.join(productDir, `${i}.jpg`));
  await save(base(11, 400, 400), path.join(productDir, '11.jpg'));
  await save(base(22, 400, 400), path.join(productDir, '22.jpg'));

  // --- Blogs ---
  const blogDir = path.join(ROOT, 'blogs');
  mkdir(blogDir);
  for (let i = 1; i <= 3; i++) await save(base(200 + i, 800, 600), path.join(blogDir, `${i}.jpg`));

  // --- Reels thumbnails ---
  const reelDir = path.join(ROOT, 'reels');
  mkdir(reelDir);
  const thumbDir = path.join(reelDir, 'thumbnails');
  mkdir(thumbDir);
  for (let i = 1; i <= 4; i++) await save(base(100 + i, 400, 600), path.join(thumbDir, `${i}.jpg`));

  // --- Heroes (Shop slider) ---
  const heroDir = path.join(ROOT, 'heroes');
  mkdir(heroDir);
  for (let i = 1; i <= 3; i++) await save(base(10 + i, 800, 400), path.join(heroDir, `${i}.jpg`));

  // --- Promos (2 banners) ---
  const promoDir = path.join(ROOT, 'promos');
  mkdir(promoDir);
  await save(base(15, 300, 300), path.join(promoDir, '1.jpg'));
  await save(base(16, 300, 300), path.join(promoDir, '2.jpg'));

  // --- Avatars / Stories ---
  const avatarDir = path.join(ROOT, 'avatars');
  mkdir(avatarDir);
  await save(base(0, 200, 200), path.join(avatarDir, 'me.jpg'));
  await save(base(0, 100, 100), path.join(avatarDir, 'me-small.jpg'));
  for (let i = 1; i <= 5; i++) await save(base(50 + i, 200, 200), path.join(avatarDir, `story-${i}.jpg`));
  await save(base(50, 100, 100), path.join(avatarDir, 'story1.jpg'));
  await save(base(50, 100, 100), path.join(avatarDir, 'store.jpg'));
  for (let i = 1; i <= 8; i++) await save(base(i, 50, 50), path.join(avatarDir, `reel-${i}.jpg`));

  // --- Icon (fallback if flaticon fails) ---
  const iconDir = path.join(ROOT, 'icons');
  mkdir(iconDir);
  await save(base(1, 512, 512), path.join(iconDir, 'app.png'));

  console.log('Content download done. Files are in public/content/');
}

main().catch((e) => { console.error(e); process.exit(1); });
