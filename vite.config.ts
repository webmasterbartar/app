import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// پلاگین: بعد از بیلد لیست دارایی‌های حیاتی را در sw.js تزریق می‌کند تا آفلاین کامل کار کند
function swPrecache() {
  return {
    name: 'sw-precache',
    closeBundle() {
      const outDir = 'dist';
      const distPath = path.resolve(process.cwd(), outDir);
      const indexPath = path.join(distPath, 'index.html');
      const swPath = path.join(distPath, 'sw.js');
      if (!fs.existsSync(indexPath) || !fs.existsSync(swPath)) return;
      const html = fs.readFileSync(indexPath, 'utf-8');
      const urls = [];
      const scriptRegex = /<script[^>]+src="(\/[^"]+)"/g;
      const linkRegex = /<link[^>]+href="(\/[^"]+)"/g;
      let m;
      urls.push('/index.html');
      while ((m = scriptRegex.exec(html)) !== null) urls.push(m[1]);
      while ((m = linkRegex.exec(html)) !== null) urls.push(m[1]);
      urls.push('/manifest.json');
      const unique = [...new Set(urls)];
      let sw = fs.readFileSync(swPath, 'utf-8');
      sw = sw.replace('__PRECACHE_URLS__', JSON.stringify(unique));
      fs.writeFileSync(swPath, sw);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), swPrecache()],
  server: {
    port: 3000,
  },
});