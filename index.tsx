import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Service Worker: ثبت زودهنگام تا قبل از لود منابع، کنترل صفحه زودتر گرفته شود
// نکته مهم برای سافاری و میزبانی روی زیرمسیر (ساب‌پث):
// scope را به مرورگر می‌سپاریم تا همیشه داخل همان مسیر sw.js بماند و رجیستر با خطا نخورد.
if ('serviceWorker' in navigator) {
  const swPath = import.meta.env.BASE_URL + 'sw.js';
  navigator.serviceWorker.register(swPath).catch(() => { });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);