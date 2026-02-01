
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ImagePrecache from './components/ImagePrecache';
import Feed from './pages/Feed';
import Shop from './pages/Shop';
import CategoryPage from './pages/CategoryPage';
import ProductArchive from './pages/ProductArchive';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import BlogArchive from './pages/BlogArchive';
import BlogPost from './pages/BlogPost';
import { CartProvider } from './contexts/CartContext';
import { seedDatabase } from './db';

// Admin Imports
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ProductManager from './pages/admin/ProductManager';
import CategoryManager from './pages/admin/CategoryManager';
import SocialManager from './pages/admin/SocialManager';
import OrderManagement from './pages/admin/OrderManagement';
import CommentManager from './pages/admin/CommentManager';
import CrawlerManager from './pages/admin/CrawlerManager';
import BlogManager from './pages/admin/BlogManager';

const App: React.FC = () => {
  useEffect(() => {
    seedDatabase();
  }, []);

  /* گرم‌کردن کش SW برای آفلاین: بعد از لود، دوباره document و اسکریپت اصلی را از طریق SW می‌گیریم تا حتماً کش شوند */
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const warm = () => {
      fetch(window.location.pathname || '/').catch(() => {});
      const script = document.querySelector('script[src*="/assets/"]') as HTMLScriptElement;
      if (script?.src) fetch(script.src).catch(() => {});
    };
    const t = setTimeout(warm, 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <CartProvider>
      <AdminAuthProvider>
        <ImagePrecache />
        <HashRouter>
          <Routes>
            {/* Consumer App Routes */}
            {/* Redirect root to /shop to make it the effective homepage */}
            <Route path="/" element={<Layout><Navigate to="/shop" replace /></Layout>} />
            <Route path="/categories" element={<Layout><CategoryPage /></Layout>} />
            <Route path="/shop" element={<Layout><Shop /></Layout>} />
            <Route path="/archive/:category" element={<Layout><ProductArchive /></Layout>} />
            <Route path="/reels" element={<Layout><Feed /></Layout>} />
            <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
            <Route path="/cart" element={<Layout><Cart /></Layout>} />
            
            {/* Blog Routes */}
            <Route path="/blog" element={<Layout><BlogArchive /></Layout>} />
            <Route path="/blog/:id" element={<Layout><BlogPost /></Layout>} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<ProductManager />} />
              <Route path="categories" element={<CategoryManager />} />
              <Route path="social" element={<SocialManager />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="comments" element={<CommentManager />} />
              <Route path="crawler" element={<CrawlerManager />} />
              <Route path="blog" element={<BlogManager />} />
              <Route path="reels" element={<Navigate to="/admin/social" />} />
            </Route>
          </Routes>
        </HashRouter>
      </AdminAuthProvider>
    </CartProvider>
  );
};

export default App;
