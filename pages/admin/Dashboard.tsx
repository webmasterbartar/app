
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Wallet, ShoppingBag, Users, TrendingUp, PlayCircle } from 'lucide-react';
import { toPersianDigits } from '../../utils/persianUtils';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingOrders: 0,
    todayOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
       try {
           const data = await api.orders.getStats();
           setStats(data);
       } catch (e) {
           console.error("Failed to load dashboard stats", e);
       } finally {
           setLoading(false);
       }
    };
    fetchStats();
  }, []);

  // Mock Graph Data (Since we don't have historical daily data in the basic order table yet)
  const graphData = [
    { name: 'شنبه', sales: 4200000, views: 1500 },
    { name: 'یکشنبه', sales: 3000000, views: 1200 },
    { name: 'دوشنبه', sales: 2000000, views: 900 },
    { name: 'سه‌شنبه', sales: 2780000, views: 1100 },
    { name: 'چهارشنبه', sales: 5890000, views: 2400 },
    { name: 'پنجشنبه', sales: 6390000, views: 2800 },
    { name: 'جمعه', sales: 8490000, views: 3500 },
  ];

  const StatCard = ({ title, value, subtext, icon: Icon, color, trend }: any) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-gray-500 text-xs font-bold mb-1">{title}</p>
        <h3 className="text-xl font-black text-gray-800 tracking-tight">{loading ? '...' : value}</h3>
        {trend && (
          <span className={`text-[10px] font-bold flex items-center gap-1 mt-2 ${trend.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
              <TrendingUp size={12} /> {toPersianDigits(trend)}
          </span>
        )}
        {subtext && <p className="text-[10px] text-gray-400 mt-1">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-2xl ${color} shadow-lg shadow-gray-100`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 font-persian">
      <div className="flex justify-between items-end">
         <div>
             <h1 className="text-2xl font-black text-gray-800">پیشخوان مدیریت</h1>
             <p className="text-gray-500 text-sm mt-1">آمار لحظه‌ای فروشگاه شما</p>
         </div>
         <div className="hidden md:block text-sm text-gray-400">
             {new Date().toLocaleDateString('fa-IR')}
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            title="درآمد کل" 
            value={`${toPersianDigits(stats.totalRevenue.toLocaleString())} تومان`} 
            icon={Wallet} 
            color="bg-[#ef394e]" 
            trend="+۱۵٪ رشد" 
        />
        <StatCard 
            title="سفارشات جدید" 
            value={`${toPersianDigits(stats.todayOrders)} سفارش`} 
            subtext={`${toPersianDigits(stats.pendingOrders)} در انتظار تایید`}
            icon={ShoppingBag} 
            color="bg-blue-500" 
            trend="+۸٪ رشد" 
        />
        <StatCard 
            title="نرخ تبدیل ریلز" 
            value="۳.۵٪" 
            subtext="تعامل کاربران"
            icon={PlayCircle} 
            color="bg-purple-500" 
            trend="+۱.۲٪ افزایش" 
        />
        <StatCard 
            title="کاربران فعال" 
            value={`${toPersianDigits(850)} نفر`} 
            subtext="بازدید آنلاین"
            icon={Users} 
            color="bg-green-500" 
            trend="+۲۴٪ رشد لحظه‌ای" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mixed Chart: Sales vs Views */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">تحلیل فروش و بازدید</h3>
                  <button className="text-xs text-[#ef394e] font-bold bg-red-50 px-3 py-1.5 rounded-lg">مشاهده گزارش</button>
              </div>
              
              {/* FIXED HEIGHT CONTAINER TO PREVENT WIDTH ERROR */}
              <div style={{ width: '100%', height: 350 }} dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={graphData}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef394e" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#ef394e" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                            labelStyle={{ fontFamily: 'Vazirmatn', textAlign: 'right' }}
                        />
                        <Legend iconType="circle" />
                        <Area yAxisId="left" type="monotone" dataKey="sales" name="فروش (تومان)" stroke="#ef394e" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                        <Bar yAxisId="right" dataKey="views" name="بازدید ریلز" barSize={20} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </ComposedChart>
                </ResponsiveContainer>
              </div>
          </div>

          {/* Top Selling / Quick Stats */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[420px]">
              <h3 className="font-bold text-gray-800 mb-4">محصولات پرفروش</h3>
              <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
                  {[1,2,3,4,5].map(i => (
                      <div key={i} className="flex items-center justify-between pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3">
                              <span className="w-6 text-center text-gray-400 font-bold text-sm">{toPersianDigits(i)}</span>
                              <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-100">
                                  <img src={`https://picsum.photos/100/100?random=${i+50}`} className="w-full h-full object-cover" alt="thumb" />
                              </div>
                              <div>
                                  <p className="text-sm font-bold text-gray-800 line-clamp-1">محصول نمونه شماره {toPersianDigits(i)}</p>
                                  <p className="text-[10px] text-gray-500">{toPersianDigits(100 + i * 2)} فروش</p>
                              </div>
                          </div>
                          <span className="text-xs font-bold text-gray-800">{toPersianDigits(10 + i)}M</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
