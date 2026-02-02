import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ImagePrecache from './components/ImagePrecache';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { seedDatabase } from './db';

// Admin Imports
import { AdminAuthProvider } from './contexts/AdminAuthContext';

// Lazy Load Pages
const Feed = lazy(() => import('./pages/Feed'));
const Shop = lazy(() => import('./pages/Shop'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ProductArchive = lazy(() => import('./pages/ProductArchive'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout')); // Checkout is now lazy
const BlogArchive = lazy(() => import('./pages/BlogArchive'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));

// Admin Pages Lazy Load
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductManager = lazy(() => import('./pages/admin/ProductManager'));
const CategoryManager = lazy(() => import('./pages/admin/CategoryManager'));
const SocialManager = lazy(() => import('./pages/admin/SocialManager'));
const OrderManagement = lazy(() => import('./pages/admin/OrderManagement'));
const CommentManager = lazy(() => import('./pages/admin/CommentManager'));
const CrawlerManager = lazy(() => import('./pages/admin/CrawlerManager'));
const BlogManager = lazy(() => import('./pages/admin/BlogManager'));

// Loading Fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-4 border-[#ef4056] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const App: React.FC = () => {
  useEffect(() => {
    seedDatabase();
  }, []);

  /* گرم‌کردن کش برای آفلاین: با تأخیر تا لود اولیه کند نشود */
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const warmup = () => {
      fetch(window.location.origin + '/index.html', { cache: 'reload' }).catch(() => { });
      document.querySelectorAll<HTMLScriptElement>('script[src*="/assets/"]').forEach((el) => {
        if (el.src) fetch(el.src, { cache: 'reload' }).catch(() => { });
      });
      document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href*="/assets/"]').forEach((el) => {
        if (el.href) fetch(el.href, { cache: 'reload' }).catch(() => { });
      });
    };
    const onControllerChange = () => { warmup(); };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    const t1 = setTimeout(warmup, 3500);
    const t2 = setTimeout(warmup, 8000);
    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <AdminAuthProvider>
          <ImagePrecache />
          <HashRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Auth Routes (No Layout) */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

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

                {/* Protected Routes - Require Authentication */}
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

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
            </Suspense>
          </HashRouter>
        </AdminAuthProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
