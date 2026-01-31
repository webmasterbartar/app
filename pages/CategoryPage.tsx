
import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Laptop, Watch, Headphones, Shirt, Footprints, Camera, Briefcase, Search } from 'lucide-react';
import { toPersianDigits } from '../utils/persianUtils';

const CategoryPage: React.FC = () => {
  
  const categories = [
    { id: 'لوازم الکترونیکی', name: 'کالای دیجیتال', icon: Smartphone, color: 'bg-blue-100 text-blue-600', count: 120 },
    { id: 'لپ‌تاپ', name: 'لپ‌تاپ و سیستم', icon: Laptop, color: 'bg-gray-100 text-gray-700', count: 45 },
    { id: 'مد و پوشاک', name: 'مد و پوشاک', icon: Shirt, color: 'bg-purple-100 text-purple-600', count: 230 },
    { id: 'سفر و ورزش', name: 'ورزش و سفر', icon: Footprints, color: 'bg-green-100 text-green-600', count: 85 },
    { id: 'عکاسی', name: 'دوربین و لنز', icon: Camera, color: 'bg-orange-100 text-orange-600', count: 32 },
    { id: 'ساعت', name: 'ساعت هوشمند', icon: Watch, color: 'bg-red-100 text-red-600', count: 64 },
    { id: 'کیف', name: 'کیف و کوله', icon: Briefcase, color: 'bg-teal-100 text-teal-600', count: 50 },
    { id: 'هدفون', name: 'صوتی و تصویری', icon: Headphones, color: 'bg-pink-100 text-pink-600', count: 90 },
  ];

  return (
    <div className="min-h-screen bg-white pb-24 font-persian" dir="rtl">
      
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">دسته بندی ها</h1>
        <p className="text-sm text-gray-500">چه چیزی نیاز دارید؟</p>
      </div>

      {/* Search Bar Placeholder */}
      <div className="px-6 mb-6">
        <div className="bg-gray-100 rounded-2xl flex items-center px-4 py-3 gap-3 text-gray-400">
            <Search size={20} />
            <span className="text-sm">جستجو در بین ۲۰۰۰ کالا...</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 px-6">
        {categories.map((cat) => (
            <Link 
                to={`/archive/${cat.id}`} 
                key={cat.id}
                className={`p-5 rounded-3xl flex flex-col justify-between aspect-square active:scale-95 transition-transform ${cat.color} bg-opacity-50`}
            >
                <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-current`}>
                    <cat.icon size={24} strokeWidth={1.5} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-gray-800 leading-tight mb-1">{cat.name}</h3>
                    <span className="text-xs opacity-70 font-medium">{toPersianDigits(cat.count)} کالا</span>
                </div>
            </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
