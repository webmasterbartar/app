
import React, { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Product, getProductImage } from '../db';
import { Search, Bell, SlidersHorizontal, Percent, ShoppingBag, X, Play, MoreHorizontal, Smartphone, Laptop, Watch, Headphones, Shirt, Footprints, Briefcase, Zap, Star, Flame, BookOpen, Clock, ChevronLeft, ArrowLeft, ArrowRight, History, TrendingUp, ChevronRight, Plus } from 'lucide-react';
import { toPersianDigits, formatPrice, formatTime } from '../utils/persianUtils';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- Helpers ---
const normalizePersian = (text: string) => {
    if (!text) return "";
    return text
        .replace(/ي/g, "ی")
        .replace(/ك/g, "ک")
        .toLowerCase()
        .trim();
};

// --- SKELETON COMPONENT ---
const ShopSkeleton = () => (
    <div className="pb-24 bg-gray-50 font-persian min-h-screen relative animate-pulse" dir="rtl">
        {/* Header */}
        <div className="sticky top-0 bg-white z-40 px-4 py-3 shadow-sm flex items-center gap-3">
            <div className="flex-1 bg-gray-200 h-10 rounded-xl"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </div>

        {/* Stories */}
        <div className="mt-2 pt-2 pb-4 overflow-x-hidden px-4">
            <div className="flex gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="flex flex-col items-center gap-1.5 min-w-[64px]">
                        <div className="w-16 h-16 rounded-full bg-gray-200 border border-white"></div>
                        <div className="w-10 h-2 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        </div>

        {/* Hero */}
        <div className="px-4 mt-2">
            <div className="w-full aspect-[2.2/1] bg-gray-200 rounded-2xl"></div>
        </div>

        {/* Amazing Offers */}
        <div className="mt-6 py-5 px-4 bg-gray-200 h-64 flex items-center justify-center">
            <div className="text-gray-300"></div>
        </div>

        {/* Banners */}
        <div className="grid grid-cols-2 gap-3 px-4 mt-6">
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
        </div>

        {/* Filter Chips */}
        <div className="mt-6 px-4 flex gap-2 overflow-hidden">
            {[1, 2, 3, 4].map(i => <div key={i} className="w-20 h-8 bg-gray-200 rounded-xl"></div>)}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 px-4 mt-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[0.7] bg-white rounded-2xl p-2 border border-gray-100">
                    <div className="w-full aspect-square bg-gray-200 rounded-xl mb-2"></div>
                    <div className="w-3/4 h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                </div>
            ))}
        </div>
    </div>
);

// --- Components ---

const HeroSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const slides = [
        { id: 1, image: "/content/heroes/1.jpg", title: "جشنواره تابستانه", subtitle: "تا ۷۰٪ تخفیف روی پوشاک", color: "from-orange-500 to-red-600" },
        { id: 2, image: "/content/heroes/2.jpg", title: "دنیای دیجیتال", subtitle: "بروزترین گجت‌های هوشمند", color: "from-blue-600 to-purple-600" },
        { id: 3, image: "/content/heroes/3.jpg", title: "استایل ورزشی", subtitle: "شروع یک تغییر بزرگ", color: "from-green-500 to-teal-600" }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <div className="mt-4 px-4 relative">
            <div className="w-full aspect-[2.2/1] rounded-2xl overflow-hidden relative shadow-lg group">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                    >
                        <img src={slides[currentIndex].image} className="w-full h-full object-cover" alt="Hero" decoding="async" fetchPriority="high" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-6">
                            <motion.span
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className={`text-white font-bold text-[10px] md:text-xs px-2 py-1 rounded-lg w-fit mb-2 bg-gradient-to-r ${slides[currentIndex].color}`}
                            >
                                {slides[currentIndex].title}
                            </motion.span>
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-white font-black text-xl md:text-2xl mb-1 leading-tight"
                            >
                                {slides[currentIndex].subtitle}
                            </motion.h2>
                            <motion.button
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white text-black text-xs font-bold py-2 px-4 rounded-xl w-fit hover:bg-gray-100 transition-colors mt-3"
                            >
                                مشاهده محصولات
                            </motion.button>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Dots */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {slides.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const PromoBanners = () => {
    return (
        <div className="grid grid-cols-2 gap-3 px-4 mt-6">
            <div className="relative h-32 rounded-2xl overflow-hidden bg-gray-100 group cursor-pointer">
                <img src="/content/promos/1.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                    <span className="text-white font-bold text-sm">اکسسوری</span>
                    <span className="text-gray-300 text-[10px]">تکمیل استایل شما</span>
                </div>
            </div>
            <div className="relative h-32 rounded-2xl overflow-hidden bg-gray-100 group cursor-pointer">
                <img src="/content/promos/2.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                    <span className="text-white font-bold text-sm">گیمینگ</span>
                    <span className="text-gray-300 text-[10px]">تجهیزات حرفه‌ای</span>
                </div>
            </div>
        </div>
    );
};

const Shop: React.FC = () => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(7200); // 2 hours
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("همه");
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Fetch Data from Local DB (Dexie)
    const products = useLiveQuery(() => db.products.toArray()) || [];
    const reels = useLiveQuery(() => db.posts.toArray()) || [];
    const blogs = useLiveQuery(() => db.blogs.toArray()) || [];

    useEffect(() => {
        // Simulate network delay for skeleton demonstration
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    // Filter Logic
    const filteredProducts = products.filter(p => {
        const matchCat = selectedCategory === "همه" || p.category === selectedCategory;
        const normalizedTitle = normalizePersian(p.title);
        const normalizedQuery = normalizePersian(searchQuery);
        const matchSearch = normalizedTitle.includes(normalizedQuery);
        return matchCat && matchSearch;
    }).sort((a, b) => {
        return (b.isAmazing === a.isAmazing ? 0 : b.isAmazing ? 1 : -1);
    });

    const amazingProducts = products.filter(p => !!p.isAmazing);

    // Suggestions (Live Search)
    const searchSuggestions = searchQuery.length > 1
        ? products.filter(p => normalizePersian(p.title).includes(normalizePersian(searchQuery))).slice(0, 5)
        : [];

    // Countdown Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Load Search History
    useEffect(() => {
        const saved = localStorage.getItem('digigram_search_history');
        if (saved) setRecentSearches(JSON.parse(saved));
    }, []);

    const addToHistory = (term: string) => {
        if (!term.trim()) return;
        const newHistory = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(newHistory);
        localStorage.setItem('digigram_search_history', JSON.stringify(newHistory));
    };

    const handleSearchSubmit = (term: string) => {
        setSearchQuery(term);
        addToHistory(term);
        setIsSearchActive(false);
        searchInputRef.current?.blur();
    };

    const clearHistory = () => {
        setRecentSearches([]);
        localStorage.removeItem('digigram_search_history');
    };

    // Story/Category Data
    const stories = [
        { id: 99, name: 'مگ', icon: BookOpen, color: 'bg-yellow-100 text-yellow-600' },
        { id: 1, name: 'دیجیتال', icon: Smartphone, color: 'bg-blue-100 text-blue-600' },
        { id: 2, name: 'استایل', icon: Shirt, color: 'bg-purple-100 text-purple-600' },
        { id: 3, name: 'گیمینگ', icon: Laptop, color: 'bg-red-100 text-red-600' },
        { id: 4, name: 'ورزش', icon: Footprints, color: 'bg-green-100 text-green-600' },
        { id: 5, name: 'ساعت', icon: Watch, color: 'bg-orange-100 text-orange-600' },
        { id: 6, name: 'صوتی', icon: Headphones, color: 'bg-pink-100 text-pink-600' },
        { id: 7, name: 'بیشتر', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-600' },
    ];

    const categories = [
        { id: 0, name: 'همه' },
        { id: 1, name: 'هدفون' },
        { id: 2, name: 'ساعت' },
        { id: 3, name: 'مد و پوشاک' },
        { id: 4, name: 'لپ‌تاپ' },
        { id: 5, name: 'لوازم الکترونیکی' },
    ];

    const trendingTags = ['هدفون سونی', 'ساعت هوشمند', 'کفش نایک', 'آیفون ۱۳', 'لپ‌تاپ گیمینگ'];

    if (isLoading) return <ShopSkeleton />;

    return (
        <div className="pb-24 bg-gray-50 font-persian min-h-screen relative" dir="rtl">

            {/* Sticky Header */}
            <header className="sticky top-0 bg-white/95 backdrop-blur-md z-40 px-4 py-3 shadow-sm flex items-center gap-3 transition-all duration-300">
                <div className={`flex-1 relative transition-all duration-300 ${isSearchActive ? 'z-50' : ''}`}>
                    <Search className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isSearchActive ? 'text-[#ef4056]' : 'text-gray-400'}`} size={18} />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onFocus={() => setIsSearchActive(true)}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(searchQuery)}
                        placeholder={isSearchActive ? "نام محصول یا برند..." : "جستجو در دیجی‌گرام..."}
                        className={`w-full rounded-xl py-2.5 pr-10 pl-8 text-sm focus:outline-none transition-all ${isSearchActive ? 'bg-white ring-2 ring-[#ef4056] shadow-lg' : 'bg-gray-100 focus:ring-2 focus:ring-[#ef4056]/20 focus:bg-white'}`}
                    />
                    {(searchQuery || isSearchActive) && (
                        <button
                            onClick={() => {
                                if (searchQuery) setSearchQuery("");
                                else setIsSearchActive(false);
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 p-1 hover:bg-gray-100 rounded-full"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {!isSearchActive && (
                    <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors animate-in fade-in zoom-in duration-300">
                        <Bell className="text-gray-700" size={24} strokeWidth={1.5} />
                        <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                )}

                {isSearchActive && (
                    <button onClick={() => setIsSearchActive(false)} className="text-sm font-bold text-gray-500 whitespace-nowrap animate-in fade-in slide-in-from-left-2">
                        انصراف
                    </button>
                )}
            </header>

            {/* --- SEARCH OVERLAY --- */}
            <AnimatePresence>
                {isSearchActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="fixed inset-0 top-[60px] bg-white z-30 overflow-y-auto pb-20"
                    >
                        <div className="p-4 space-y-6">

                            {/* Live Suggestions (When Typing) */}
                            {searchQuery.length > 0 && (
                                <div className="space-y-1">
                                    {searchSuggestions.map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => handleSearchSubmit(p.title)}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                                        >
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                                <img src={getProductImage(p)} className="w-full h-full object-cover mix-blend-multiply" alt="" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-800 line-clamp-1">{p.title}</p>
                                                <p className="text-[10px] text-gray-500">{p.category}</p>
                                            </div>
                                            <ChevronLeft size={16} className="text-gray-300" />
                                        </div>
                                    ))}
                                    {searchSuggestions.length === 0 && (
                                        <div className="text-center py-8 text-gray-400 text-sm">
                                            محصولی یافت نشد
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* History & Trending (When Empty) */}
                            {searchQuery.length === 0 && (
                                <>
                                    {/* Recent Searches */}
                                    {recentSearches.length > 0 && (
                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="text-xs font-bold text-gray-500 flex items-center gap-2">
                                                    <History size={14} />
                                                    جستجوهای اخیر
                                                </h3>
                                                <button onClick={clearHistory} className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-1 rounded hover:bg-red-100">
                                                    پاک کردن
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {recentSearches.map((term, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleSearchSubmit(term)}
                                                        className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-200 transition-colors"
                                                    >
                                                        {term}
                                                        <ChevronLeft size={12} className="text-gray-400" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Trending */}
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-500 flex items-center gap-2 mb-3">
                                            <TrendingUp size={14} className="text-[#ef4056]" />
                                            پربازدیدترین‌ها
                                        </h3>
                                        <div className="space-y-2">
                                            {trendingTags.map((tag, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => handleSearchSubmit(tag)}
                                                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 cursor-pointer group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-gray-300 font-bold text-sm w-4 text-center group-hover:text-[#ef4056] transition-colors">{toPersianDigits(i + 1)}</span>
                                                        <span className="text-sm text-gray-700 font-medium group-hover:translate-x-1 transition-transform">{tag}</span>
                                                    </div>
                                                    <ArrowLeft size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stories / Quick Categories */}
            <div className="mt-2 pt-2 pb-4 overflow-x-auto no-scrollbar bg-white border-b border-gray-100">
                <div className="flex px-4 gap-4 items-center">
                    {/* Your Story */}
                    <div className="flex flex-col items-center gap-1.5 min-w-[66px] cursor-pointer group">
                        <div className="relative">
                            <div className="w-[66px] h-[66px] rounded-full p-[2px] border border-gray-200">
                                <img
                                    src="/content/avatars/me.jpg"
                                    className="w-full h-full object-cover rounded-full"
                                    alt="Your Story"
                                />
                            </div>
                            <div className="absolute bottom-0 right-0 bg-[#0095f6] text-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                <Plus size={12} strokeWidth={4} />
                            </div>
                        </div>
                        <span className="text-[11px] font-normal text-gray-500">داستان شما</span>
                    </div>

                    {/* Special 'New' Story */}
                    <div className="flex flex-col items-center gap-1.5 min-w-[66px] cursor-pointer">
                        <div className="w-[66px] h-[66px] rounded-full p-[2.5px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]">
                            <div className="w-full h-full bg-white rounded-full p-[2px] overflow-hidden">
                                <img src="/content/avatars/story1.jpg" className="w-full h-full object-cover rounded-full" alt="" />
                            </div>
                        </div>
                        <span className="text-[11px] font-normal text-gray-800">جدیدترین‌ها</span>
                    </div>

                    {stories.map((story) => (
                        <div
                            key={story.id}
                            className="flex flex-col items-center gap-1.5 min-w-[66px] cursor-pointer active:scale-95 transition-transform"
                            onClick={() => {
                                if (story.name === 'مگ') navigate('/blog');
                                else if (story.name === 'بیشتر') navigate('/categories');
                            }}
                        >
                            <div className="w-[66px] h-[66px] rounded-full p-[2px] border border-gray-100 flex items-center justify-center bg-gray-50/50">
                                <story.icon size={26} className={story.color.split(' ')[1]} strokeWidth={1.5} />
                            </div>
                            <span className="text-[11px] font-normal text-gray-700 truncate w-full text-center">{story.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Show Hero & Amazing Offers ONLY when not searching */}
            {searchQuery === "" && selectedCategory === "همه" && !isSearchActive && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Hero Slider Component */}
                    <HeroSlider />

                    {/* Amazing Offers (Shogoft-angiz) */}
                    <div className="mt-6 bg-gradient-to-r from-[#ef394e] to-[#d92e42] py-5 pl-0 pr-0">
                        <div className="flex items-center justify-between mb-4 px-4 text-white">
                            <div className="flex items-center gap-2">
                                <Flame className="w-6 h-6 fill-orange-400 text-orange-400 animate-pulse" />
                                <span className="font-bold text-lg">پیشنهاد شگفت‌انگیز</span>
                            </div>
                            <div className="text-sm font-bold bg-white/20 backdrop-blur text-white px-3 py-1 rounded-lg shadow-sm border border-white/10 tabular-nums">
                                {formatTime(timeLeft)}
                            </div>
                        </div>

                        <div className="flex overflow-x-auto no-scrollbar gap-3 pr-4 pl-4 pb-2">
                            <div className="min-w-[130px] flex flex-col items-center justify-center text-white text-center cursor-pointer active:scale-95 transition-transform">
                                <div className="bg-white/20 p-4 rounded-full mb-2 backdrop-blur-sm border border-white/10">
                                    <ShoppingBag className="w-8 h-8 text-white" />
                                </div>
                                <span className="text-sm font-bold">مشاهده همه</span>
                                <span className="text-[10px] opacity-80 mt-1">۱۵+ کالا</span>
                            </div>

                            {amazingProducts.map(p => (
                                <Link to={`/product/${p.id}`} key={p.id} className="min-w-[160px] max-w-[160px] bg-white rounded-2xl p-3 flex flex-col gap-2 shadow-lg relative group active:scale-95 transition-transform">
                                    <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden">
                                        <img src={getProductImage(p)} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500" loading="lazy" alt="" />
                                        {p.originalPrice && p.originalPrice > p.price && (
                                            <span className="absolute bottom-1 right-1 bg-[#ef4056] text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold shadow-sm">
                                                {toPersianDigits(Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100))}%
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-xs text-gray-800 line-clamp-2 leading-5 min-h-[40px] font-bold mt-1">{p.title}</h4>
                                    <div className="flex flex-col items-end mt-auto">
                                        {p.originalPrice && p.originalPrice > p.price && (
                                            <span className="text-[10px] text-gray-400 line-through decoration-red-400/50">
                                                {formatPrice(p.originalPrice)}
                                            </span>
                                        )}
                                        <span className="text-sm font-black text-gray-900 flex items-center gap-1">
                                            {formatPrice(p.price)} <span className="text-[10px] font-medium text-gray-500">تومان</span>
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Promo Banners Component */}
                    <PromoBanners />

                </div>
            )}

            {/* Filter Chips */}
            <div className="sticky top-[68px] z-20 bg-gray-50 pt-6 pb-2">
                <div className="flex overflow-x-auto no-scrollbar gap-2 px-4">
                    {categories.map(cat => {
                        const isActive = selectedCategory === cat.name;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all border ${isActive
                                    ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <span className="text-xs font-bold">{cat.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Results Header */}
            <div className="mt-2 px-4 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    {searchQuery ? <Search size={16} className="text-[#ef4056]" /> : <Zap size={16} className="text-yellow-500 fill-yellow-500" />}
                    {searchQuery ? `نتایج: "${searchQuery}"` : (selectedCategory === "همه" ? "محبوب‌ترین‌ها" : selectedCategory)}
                </h3>
                <button className="flex items-center gap-1 text-[10px] text-gray-500 font-bold bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                    <SlidersHorizontal size={12} />
                    فیلتر
                </button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-3 px-4 mt-3">
                {filteredProducts.length > 0 ? filteredProducts.map((p, idx) => (
                    <Link
                        to={`/product/${p.id}`}
                        key={p.id}
                        className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                    >
                        <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden relative">
                            <img src={getProductImage(p)} className="w-full h-full object-cover mix-blend-multiply" loading="lazy" alt="" />
                            <button className="absolute top-2 right-2 bg-white/80 backdrop-blur p-1.5 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                                <div className="w-3 h-3 border-2 border-current rounded-full" />
                            </button>
                            {p.isAmazing && (
                                <span className="absolute bottom-1 left-1 bg-[#ef4056] text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow-sm">
                                    فروش ویژه
                                </span>
                            )}
                        </div>
                        <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-5 h-10 mt-1">{p.title}</h4>

                        <div className="flex items-center gap-1 mb-1">
                            <Star size={10} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-[10px] font-bold text-gray-500">{toPersianDigits(p.rating)}</span>
                        </div>

                        <div className="mt-auto text-left pt-2 border-t border-gray-50 flex flex-col items-end">
                            {p.originalPrice && p.originalPrice > p.price && (
                                <span className="text-[10px] text-gray-400 line-through decoration-red-400/50">
                                    {formatPrice(p.originalPrice)}
                                </span>
                            )}
                            <span className="text-sm font-black text-gray-900 flex items-center gap-1">
                                {formatPrice(p.price)} <span className="text-[10px] font-medium text-gray-500">تومان</span>
                            </span>
                        </div>
                    </Link>
                )) : (
                    <div className="col-span-2 py-12 flex flex-col items-center text-gray-400 gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Search size={32} className="opacity-50" />
                        </div>
                        <span className="text-sm font-medium">محصولی یافت نشد</span>
                        <button onClick={() => { setSearchQuery(""); setSelectedCategory("همه") }} className="text-xs text-[#ef4056] font-bold border-b border-[#ef4056]">
                            مشاهده همه محصولات
                        </button>
                    </div>
                )}
            </div>

            {/* Blog Carousel Section */}
            {blogs.length > 0 && !isSearchActive && (
                <div className="mt-8 border-t border-gray-100 pt-6">
                    <div className="px-4 flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-5 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
                            <h3 className="font-bold text-gray-800 text-sm">مجله دیجی‌گرام</h3>
                        </div>
                        <button onClick={() => navigate('/blog')} className="text-xs text-blue-600 font-bold flex items-center gap-1">
                            مشاهده همه <ChevronLeft size={14} />
                        </button>
                    </div>

                    <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-4" dir="rtl">
                        {blogs.map((blog) => (
                            <Link
                                to={`/blog/${blog.id}`}
                                key={blog.id}
                                className="min-w-[240px] max-w-[240px] bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform"
                            >
                                <div className="h-32 bg-gray-100 relative">
                                    <img src={blog.cover_image} className="w-full h-full object-cover" loading="lazy" />
                                    <span className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-gray-700 shadow-sm">
                                        {blog.category}
                                    </span>
                                </div>
                                <div className="p-3">
                                    <h4 className="font-bold text-xs text-gray-800 line-clamp-2 leading-5 mb-2 h-10">
                                        {blog.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                        <Clock size={12} />
                                        <span>{toPersianDigits(blog.read_time)} دقیقه مطالعه</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Social Proof / Reels Teaser */}
            {reels.length > 0 && !isSearchActive && (
                <div className="mt-6 mb-6 pt-6 border-t border-gray-100">
                    <div className="px-4 flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-[#ef4056] rounded-full"></div>
                            <h3 className="font-bold text-gray-800 text-sm">ویدیوهای کاربران</h3>
                        </div>
                        <button onClick={() => navigate('/reels')} className="text-xs text-blue-600 font-bold flex items-center gap-1">
                            مشاهده همه
                        </button>
                    </div>

                    <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-4" dir="rtl">
                        {reels.map((reel) => (
                            <div
                                key={reel.id}
                                onClick={() => navigate('/reels', { state: { targetId: reel.id } })}
                                className="relative min-w-[120px] aspect-[9/16] rounded-2xl overflow-hidden shadow-md cursor-pointer active:scale-95 transition-transform bg-gray-900 border-2 border-white"
                            >
                                <img src={reel.thumbnail} className="w-full h-full object-cover opacity-90" loading="lazy" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                                    <div className="flex items-center gap-1.5">
                                        <Play size={10} className="fill-white text-white" />
                                        <span className="text-[10px] text-white font-bold">{toPersianDigits(reel.likes)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom Spacer */}
            <div className="h-6"></div>
        </div>
    );
};

export default Shop;
