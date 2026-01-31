
import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { LayoutDashboard, Package, ShoppingBag, Clapperboard, LogOut, Menu, X, Layers, MessageSquare, User, Settings, Download, BookOpen } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { isAdmin, loading, signOut, session } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);

  // Protected Route Logic
  useEffect(() => {
    if (!loading) {
      if (!session) {
        navigate('/admin/login');
      } else if (!isAdmin) {
        alert("دسترسی غیرمجاز: نیاز به دسترسی ادمین دارید.");
        signOut();
        navigate('/admin/login');
      }
    }
  }, [session, isAdmin, loading, navigate, signOut]);

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-persian">در حال بارگذاری...</div>;
  }

  if (!isAdmin) return null;

  const navItems = [
    { name: 'پیشخوان', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'سفارشات', path: '/admin/orders', icon: ShoppingBag },
    { name: 'محصولات', path: '/admin/products', icon: Package },
    { name: 'استودیو', path: '/admin/social', icon: Clapperboard }, 
    { name: 'وبلاگ', path: '/admin/blog', icon: BookOpen },
    { name: 'خزنده اینستاگرام', path: '/admin/crawler', icon: Download },
    { name: 'نظرات', path: '/admin/comments', icon: MessageSquare },
    { name: 'دسته‌ها', path: '/admin/categories', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-persian" dir="rtl">
      
      {/* Desktop Sidebar (RTL Correct: fixed to right) */}
      <aside 
          className={`hidden md:flex bg-[#1a1c23] text-white transition-all duration-300 flex-col fixed top-0 right-0 bottom-0 z-20 h-full border-l border-gray-800 ${isSidebarOpen ? 'w-64' : 'w-20'}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
           {isSidebarOpen ? (
             <span className="font-bold text-xl tracking-tight text-[#ef394e]">دیجی‌ادمین</span>
           ) : (
             <span className="font-bold text-xl text-[#ef394e]">DA</span>
           )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
           {navItems.map((item) => {
             const isActive = location.pathname.startsWith(item.path);
             return (
               <Link 
                  key={item.path} 
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${isActive ? 'bg-[#ef394e] text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
               >
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {isSidebarOpen && <span className="font-medium">{item.name}</span>}
               </Link>
             );
           })}
        </nav>

        <div className="p-4 border-t border-gray-800">
            <button 
                onClick={signOut}
                className="flex items-center gap-3 w-full px-3 py-3 text-red-400 hover:bg-gray-800 rounded-xl transition-colors"
            >
                <LogOut size={20} />
                {isSidebarOpen && <span className="font-medium">خروج</span>}
            </button>
        </div>
      </aside>

      {/* Main Content (Margin Right adjusted for RTL sidebar) */}
      <main className={`flex-1 flex flex-col h-screen overflow-hidden relative ${isSidebarOpen ? 'md:mr-64' : 'md:mr-20'} transition-all duration-300`}>
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm z-10 sticky top-0">
            <span className="font-bold text-xl text-[#ef394e]">دیجی‌ادمین</span>
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                <img src={`https://ui-avatars.com/api/?name=Admin&background=ef394e&color=fff`} className="w-full h-full" alt="admin" />
            </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex h-16 bg-white border-b border-gray-200 items-center justify-between px-6 shadow-sm z-10">
             <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                <Menu size={20} />
            </button>
            <div className="flex items-center gap-4">
                <div className="text-left">
                    <div className="text-sm font-bold text-gray-800">ادمین سیستم</div>
                    <div className="text-xs text-gray-500">مدیر کل</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-100">
                    <img src={`https://ui-avatars.com/api/?name=Admin&background=ef394e&color=fff`} className="w-full h-full" alt="admin" />
                </div>
            </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f9fafb] pb-24 md:pb-8">
            <Outlet />
        </div>

        {/* Mobile Bottom Navigation (Admin Specific) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 flex justify-between items-center z-50 pb-6 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
            {navItems.slice(0, 5).map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                    <Link 
                        key={item.path} 
                        to={item.path}
                        className={`flex flex-col items-center gap-1 ${isActive ? 'text-[#ef394e]' : 'text-gray-400'}`}
                    >
                        <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[10px] font-bold">{item.name}</span>
                    </Link>
                )
            })}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
