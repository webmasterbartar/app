import React, { useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { collectAllImageUrls, precacheImages } from '../utils/imagePrecache';

/**
 * Background component that pre-caches all images for offline use.
 * Runs once when data is available, does not block UI.
 */
const ImagePrecache: React.FC = () => {
  const products = useLiveQuery(() => db.products.toArray()) ?? [];
  const posts = useLiveQuery(() => db.posts.toArray()) ?? [];
  const blogs = useLiveQuery(() => db.blogs.toArray()) ?? [];
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    const total = products.length + posts.length + blogs.length;
    if (total === 0) return;

    hasRun.current = true;

    // تأخیر ۴ ثانیه تا لود اولیه و عکس‌های بالای صفحه تمام شوند، بعد پیش‌کش در پس‌زمینه
    const t = setTimeout(() => {
      const run = async () => {
        const urls = collectAllImageUrls({ products, posts, blogs });
        if (urls.length > 0) await precacheImages(urls);
      };
      run();
    }, 4000);

    return () => clearTimeout(t);
  }, [products, posts, blogs]);

  return null;
};

export default ImagePrecache;
