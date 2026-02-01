
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, ShoppingBag, ShoppingCart, Clapperboard, WifiOff, User } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { toPersianDigits } from '../utils/persianUtils';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { itemCount } = useCart();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // 1. Route & Content Logic
  // Categories, Shop, Archive, Cart, Product Detail are all Commerce (RTL)
  const isCommerce = location.pathname.startsWith('/shop') ||
    location.pathname.startsWith('/cart') ||
    location.pathname.startsWith('/product') ||
    location.pathname.startsWith('/categories') ||
    location.pathname.startsWith('/archive');

  const isFeed = location.pathname === '/reels';
  const isProductPage = location.pathname.startsWith('/product');

  const dir = isCommerce ? 'rtl' : 'ltr';
  const lang = isCommerce ? 'fa' : 'en';
  const fontClass = isCommerce ? 'font-persian' : 'font-english';

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    document.body.className = `${fontClass} bg-white text-black overflow-hidden`;
  }, [dir, lang, fontClass]);

  // Offline Detection Logic
  useEffect(() => {
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
    };
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const isActive = (path: string) => {
    if (path === '/shop' && location.pathname === '/') return true;
    return location.pathname.startsWith(path);
  };

  // Updated Nav Items: Categories - Shop - Reels - Cart - Profile
  const navItems = [
    { name: 'categories', icon: LayoutGrid, path: '/categories' },
    { name: 'shop', icon: ShoppingBag, path: '/shop' },
    { name: 'reels', icon: Clapperboard, path: '/reels' },
    { name: 'cart', icon: ShoppingCart, path: '/cart', badge: itemCount },
    { name: 'profile', path: '/profile', isAvatar: true },
  ];

  return (
    <div className={`flex flex-col h-[100dvh] w-full max-w-md mx-auto relative shadow-2xl bg-white ${fontClass}`}>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="absolute top-0 left-0 right-0 bg-gray-800 text-white text-[10px] py-1 px-3 z-[60] flex items-center justify-center gap-2 font-english">
          <WifiOff size={12} />
          <span>No Internet Connection. You are viewing offline content.</span>
        </div>
      )}

      {/* Main Content Area */}
      <main
        className={`flex-1 relative bg-white ${isFeed ? 'overflow-hidden' : 'overflow-y-auto no-scrollbar'} ${!isOnline ? 'pt-6' : ''}`}
      >
        {children}
      </main>

      {/* Fixed Navigation Bar (Hidden on Product Pages) */}
      {!isProductPage && (
        <nav
          dir="ltr"
          className="h-[60px] bg-white/70 backdrop-blur-xl border-t border-gray-200/30 flex items-center justify-around px-2 z-50 absolute bottom-0 w-full pb-safe"
        >
          {navItems.map((item, index) => {
            const active = isActive(item.path);

            if (item.isAvatar) {
              return (
                <Link key={index} to={item.path} className="flex items-center justify-center w-12 h-full relative">
                  <div className={`w-[28px] h-[28px] rounded-full p-[2px] transition-all duration-300 ${active ? 'border-[#ef4056] border-2' : 'border-transparent'}`}>
                    <img
                      src="/content/avatars/me.jpg"
                      alt="profile"
                      className="w-full h-full rounded-full object-cover border border-gray-100"
                    />
                  </div>
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 w-1 h-1 bg-[#ef4056] rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            }

            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center justify-center w-12 h-full relative group`}
              >
                <div className="relative flex flex-col items-center">
                  {item.icon && (
                    <item.icon
                      size={26}
                      strokeWidth={active ? 2.5 : 2}
                      className={`transition-all duration-300 ${active ? 'text-[#ef4056] -translate-y-1' : 'text-gray-400 group-hover:text-gray-600'}`}
                    />
                  )}

                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-2 w-1 h-1 bg-[#ef4056] rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}

                  {item.badge ? (
                    <span className="absolute -top-1 -right-2 bg-[#ef4056] text-white text-[10px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold border-[2px] border-white leading-none shadow-sm">
                      {isCommerce ? toPersianDigits(item.badge) : item.badge}
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default Layout;
