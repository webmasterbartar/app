
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, Product } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowRight, SlidersHorizontal, Heart, Plus, Star, Zap, Check, X, Truck, Search, Trash2, Filter } from 'lucide-react';
import { toPersianDigits, formatPrice } from '../utils/persianUtils';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Brands based on category (Dynamic in real app)
const MOCK_BRANDS = ['اپل', 'سامسونگ', 'سونی', 'نایکی', 'آدیداس', 'شیائومی', 'ایسوس'];

const ProductArchive: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000000]);
  const [onlyAmazing, setOnlyAmazing] = useState(false);
  const [onlyStock, setOnlyStock] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [addedItems, setAddedItems] = useState<number[]>([]); // For animation of + button

  // Derived State for Filter Count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (sortBy !== 'newest') count++;
    if (priceRange[0] > 0 || priceRange[1] < 500000000) count++;
    if (onlyAmazing) count++;
    if (!onlyStock) count++; // Assuming default is true, if changed count it? Or just if it restricts. Let's say if active.
    if (selectedBrands.length > 0) count++;
    return count;
  }, [sortBy, priceRange, onlyAmazing, onlyStock, selectedBrands]);

  // Data Fetching
  const rawProducts = useLiveQuery(async () => {
    let collection = db.products.toCollection();
    if (category && category !== 'همه') {
        collection = db.products.where('category').equals(category);
    }
    return await collection.toArray();
  }, [category]) || [];

  // Filter Logic
  const filteredProducts = useMemo(() => {
    let results = [...rawProducts];

    // Price
    results = results.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Amazing
    if (onlyAmazing) {
        results = results.filter(p => p.isAmazing);
    }

    // Brands (Simple string match)
    if (selectedBrands.length > 0) {
        results = results.filter(p => selectedBrands.some(b => p.title.includes(b)));
    }

    // Sorting
    if (sortBy === 'price-low') {
        results.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
        results.sort((a, b) => b.price - a.price);
    } else {
        results.sort((a, b) => b.id - a.id);
    }

    return results;
  }, [rawProducts, sortBy, priceRange, onlyAmazing, selectedBrands]);

  const handleQuickAdd = async (e: React.MouseEvent, productId: number) => {
      e.preventDefault();
      e.stopPropagation(); // Stop propagation to Link
      await addToCart(productId);
      setAddedItems(prev => [...prev, productId]);
      setTimeout(() => {
          setAddedItems(prev => prev.filter(id => id !== productId));
      }, 1500);
  };

  const toggleBrand = (brand: string) => {
      if (selectedBrands.includes(brand)) {
          setSelectedBrands(prev => prev.filter(b => b !== brand));
      } else {
          setSelectedBrands(prev => [...prev, brand]);
      }
  };

  const resetFilters = () => {
      setSortBy('newest');
      setPriceRange([0, 500000000]);
      setOnlyAmazing(false);
      setOnlyStock(true);
      setSelectedBrands([]);
  };

  const removeFilter = (type: string) => {
      if (type === 'price') setPriceRange([0, 500000000]);
      if (type === 'amazing') setOnlyAmazing(false);
      if (type === 'brands') setSelectedBrands([]);
      if (type === 'sort') setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-persian" dir="rtl">
        
        {/* Sticky Header */}
        <header className="sticky top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-30 border-b border-gray-100 shadow-sm transition-all">
            <div className="flex items-center justify-between px-4 h-[60px]">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 -mr-2 active:scale-90 transition-transform hover:bg-gray-100 rounded-full">
                        <ArrowRight size={22} className="text-gray-800" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-gray-900 text-lg leading-tight">{category}</h1>
                        <span className="text-[11px] text-gray-500">{toPersianDigits(filteredProducts.length)} کالا</span>
                    </div>
                </div>
                <button 
                    onClick={() => setIsFilterOpen(true)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold active:scale-95 transition-all ${activeFilterCount > 0 ? 'bg-[#ef4056] text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                    <SlidersHorizontal size={14} />
                    فیلتر
                    {activeFilterCount > 0 && (
                        <span className="bg-white text-[#ef4056] w-4 h-4 rounded-full flex items-center justify-center text-[9px]">{toPersianDigits(activeFilterCount)}</span>
                    )}
                </button>
            </div>

            {/* Active Filters Chips */}
            {activeFilterCount > 0 && (
                <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
                    {sortBy !== 'newest' && (
                         <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap">
                             <span>{sortBy === 'price-low' ? 'ارزان‌ترین' : 'گران‌ترین'}</span>
                             <button onClick={() => removeFilter('sort')}><X size={12} /></button>
                         </div>
                    )}
                    {(priceRange[0] > 0 || priceRange[1] < 500000000) && (
                         <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap">
                             <span>قیمت</span>
                             <button onClick={() => removeFilter('price')}><X size={12} /></button>
                         </div>
                    )}
                    {onlyAmazing && (
                         <div className="flex items-center gap-1 bg-red-50 text-red-500 px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap">
                             <span>شگفت‌انگیز</span>
                             <button onClick={() => removeFilter('amazing')}><X size={12} /></button>
                         </div>
                    )}
                    {selectedBrands.length > 0 && (
                         <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap">
                             <span>{toPersianDigits(selectedBrands.length)} برند</span>
                             <button onClick={() => removeFilter('brands')}><X size={12} /></button>
                         </div>
                    )}
                </div>
            )}
        </header>

        {/* Product Grid */}
        <div className="p-4 grid grid-cols-2 gap-3 sm:gap-4">
            {filteredProducts.length > 0 ? filteredProducts.map(product => (
                <Link to={`/product/${product.id}`} key={product.id} className="group bg-white rounded-2xl p-2.5 sm:p-3 shadow-sm border border-gray-100 relative flex flex-col hover:shadow-md transition-shadow">
                    
                    {/* Image Area */}
                    <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden relative mb-3">
                        <img src={product.image} className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
                             {product.isAmazing && (
                                <span className="bg-[#ef4056] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                                    <Zap size={10} fill="currentColor" />
                                </span>
                             )}
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button className="p-1.5 bg-white/80 backdrop-blur rounded-full text-gray-400 hover:text-red-500 shadow-sm active:scale-90 transition-all">
                                <Heart size={14} />
                            </button>
                        </div>

                        {/* Quick Add Button */}
                        <button 
                            onClick={(e) => handleQuickAdd(e, product.id)}
                            className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 z-20 ${
                                addedItems.includes(product.id) ? 'bg-green-500 text-white' : 'bg-white text-gray-800'
                            }`}
                        >
                            {addedItems.includes(product.id) ? <Check size={16} /> : <Plus size={18} />}
                        </button>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col">
                         {/* Delivery Badge */}
                         <div className="flex items-center gap-1 mb-1.5">
                            <Truck size={12} className="text-teal-600" />
                            <span className="text-[10px] text-teal-600 font-medium">ارسال فوری</span>
                         </div>

                         <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-5 mb-2 h-9">
                             {product.title}
                         </h3>

                         <div className="mt-auto">
                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-2">
                                <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-[10px] font-bold text-gray-500">{toPersianDigits(product.rating)}</span>
                            </div>

                            {/* Price */}
                            <div className="flex flex-col items-end">
                                {product.originalPrice && (
                                    <span className="text-[10px] text-gray-400 line-through decoration-red-400">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                )}
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-base text-gray-900">
                                        {formatPrice(product.price)}
                                    </span>
                                    <span className="text-[10px] text-gray-500">تومان</span>
                                </div>
                            </div>
                         </div>
                    </div>
                </Link>
            )) : (
                <div className="col-span-2 flex flex-col items-center justify-center py-20 text-gray-400">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <Filter size={40} className="opacity-30" />
                    </div>
                    <p className="font-bold text-lg text-gray-600 mb-1">نتیجه‌ای یافت نشد!</p>
                    <p className="text-sm text-gray-400 mb-6 text-center px-10">فیلترهای اعمال شده را تغییر دهید تا محصولات بیشتری ببینید.</p>
                    <button 
                        onClick={resetFilters} 
                        className="flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-transform"
                    >
                        <Trash2 size={16} />
                        حذف فیلترها
                    </button>
                </div>
            )}
        </div>

        {/* Filter Drawer */}
        <AnimatePresence>
            {isFilterOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                        onClick={() => setIsFilterOpen(false)}
                    />
                    <motion.div 
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-[32px] overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Drawer Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <button onClick={resetFilters} className="text-xs text-red-500 font-bold hover:bg-red-50 px-2 py-1 rounded transition-colors">
                                حذف فیلترها
                            </button>
                            <span className="font-bold text-lg text-gray-800">فیلترها</span>
                            <button onClick={() => setIsFilterOpen(false)} className="bg-gray-100 p-2 rounded-full active:scale-90 transition-transform">
                                <X size={18} className="text-gray-600" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
                            
                            {/* Sort Section */}
                            <div>
                                <h3 className="font-bold text-sm mb-3 text-gray-800 flex items-center gap-2">
                                    <SlidersHorizontal size={16} />
                                    مرتب‌سازی
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'newest', label: 'جدیدترین' },
                                        { id: 'price-low', label: 'ارزان‌ترین' },
                                        { id: 'price-high', label: 'گران‌ترین' }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setSortBy(opt.id as any)}
                                            className={`px-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                                                sortBy === opt.id 
                                                ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Section */}
                            <div>
                                <h3 className="font-bold text-sm mb-3 text-gray-800">محدوده قیمت (تومان)</h3>
                                
                                {/* Quick Selectors */}
                                <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                                    {[
                                        { label: 'زیر ۵ میلیون', range: [0, 5000000] },
                                        { label: '۵ تا ۲۰ میلیون', range: [5000000, 20000000] },
                                        { label: 'بالای ۲۰ میلیون', range: [20000000, 500000000] }
                                    ].map((preset, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => setPriceRange(preset.range as [number, number])}
                                            className="whitespace-nowrap px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-medium text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Inputs */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-1 focus-within:ring-black transition-all">
                                        <span className="text-[10px] text-gray-400 block mb-0.5">از</span>
                                        <input 
                                            type="number" 
                                            className="w-full bg-transparent font-bold text-sm outline-none text-gray-800"
                                            value={priceRange[0]}
                                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                        />
                                    </div>
                                    <ArrowRight size={16} className="text-gray-300 rotate-180" />
                                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-1 focus-within:ring-black transition-all">
                                        <span className="text-[10px] text-gray-400 block mb-0.5">تا</span>
                                        <input 
                                            type="number" 
                                            className="w-full bg-transparent font-bold text-sm outline-none text-gray-800"
                                            value={priceRange[1]}
                                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Toggles Section */}
                            <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                                <div className="flex items-center justify-between cursor-pointer" onClick={() => setOnlyAmazing(!onlyAmazing)}>
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${onlyAmazing ? 'bg-red-100 text-red-600' : 'bg-white text-gray-400'}`}>
                                            <Zap size={16} fill={onlyAmazing ? "currentColor" : "none"} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">فقط کالاهای شگفت‌انگیز</span>
                                    </div>
                                    <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ${onlyAmazing ? 'bg-[#ef4056]' : 'bg-gray-300'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${onlyAmazing ? 'translate-x-[-20px]' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                                <div className="h-[1px] bg-gray-200 w-full"></div>
                                <div className="flex items-center justify-between cursor-pointer" onClick={() => setOnlyStock(!onlyStock)}>
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${onlyStock ? 'bg-green-100 text-green-600' : 'bg-white text-gray-400'}`}>
                                            <Check size={16} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">فقط کالاهای موجود</span>
                                    </div>
                                    <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ${onlyStock ? 'bg-green-500' : 'bg-gray-300'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${onlyStock ? 'translate-x-[-20px]' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            </div>

                            {/* Brands Section */}
                            <div>
                                <h3 className="font-bold text-sm mb-3 text-gray-800">برند</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {MOCK_BRANDS.map(brand => (
                                        <button
                                            key={brand}
                                            onClick={() => toggleBrand(brand)}
                                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                                                selectedBrands.includes(brand)
                                                ? 'bg-blue-50 text-blue-600 border-blue-200 ring-1 ring-blue-200'
                                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            {brand}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Apply Button */}
                        <div className="p-4 border-t border-gray-100 bg-white absolute bottom-0 left-0 right-0 z-20">
                            <button 
                                onClick={() => setIsFilterOpen(false)}
                                className="w-full bg-[#ef4056] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-100 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                            >
                                مشاهده {toPersianDigits(filteredProducts.length)} کالا
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    </div>
  );
};

export default ProductArchive;
