
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, Product, Variant, getProductImage } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCart } from '../contexts/CartContext';
import { Heart, Share2, Star, Truck, ShieldCheck, Store, ArrowRight, ShoppingCart, Clapperboard, Play, ChevronDown, ChevronUp, Check, Info, Maximize2, MessageSquarePlus, User, X, Layers, AlertCircle, RotateCcw, ShoppingBag, Zap } from 'lucide-react';
import { toPersianDigits, formatPrice } from '../utils/persianUtils';
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo, useScroll, useMotionTemplate } from 'framer-motion';

// --- Zoomable Image Component ---
interface ZoomableImageProps {
  src: string;
  isActive: boolean;
  onZoomChange: (isZoomed: boolean) => void;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, isActive, onZoomChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const [isZoomed, setIsZoomed] = useState(false);

  // Reset state when slide becomes inactive
  useEffect(() => {
    if (!isActive) {
      x.set(0);
      y.set(0);
      scale.set(1);
      setIsZoomed(false);
      onZoomChange(false);
    }
  }, [isActive, x, y, scale, onZoomChange]);

  // Double Tap to Zoom
  const handleDoubleTap = useCallback(() => {
    if (scale.get() > 1) {
      scale.set(1);
      x.set(0);
      y.set(0);
      setIsZoomed(false);
      onZoomChange(false);
    } else {
      scale.set(2.5);
      setIsZoomed(true);
      onZoomChange(true);
    }
  }, [scale, x, y, onZoomChange]);

  // --- Pinch Logic ---
  const touchStartDist = useRef<number>(0);
  const startScale = useRef<number>(1);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
      startScale.current = scale.get();
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newScale = startScale.current * (dist / touchStartDist.current);
      const clamped = Math.min(Math.max(newScale, 1), 4);

      scale.set(clamped);

      const isNowZoomed = clamped > 1.1;
      if (isNowZoomed !== isZoomed) {
        setIsZoomed(isNowZoomed);
        onZoomChange(isNowZoomed);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden touch-none relative"
      onDoubleClick={handleDoubleTap}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    >
      {/* Blurred Background for Atmosphere */}
      <div
        className="absolute inset-0 opacity-30 blur-2xl scale-125"
        style={{ backgroundImage: `url(${src})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
      />

      <motion.img
        src={src}
        alt="Product"
        style={{ x, y, scale, cursor: isZoomed ? 'grab' : 'default' }}
        className="w-full h-full object-contain relative z-10 mix-blend-multiply"
        drag={isZoomed}
        dragConstraints={containerRef}
        dragElastic={0.1}
        dragMomentum={false}
      />
    </div>
  );
};

// --- Skeleton Component ---
const ProductDetailSkeleton = () => (
  <div className="bg-white min-h-screen pb-28 font-persian animate-pulse" dir="rtl">
    {/* Navbar placeholder */}
    <div className="flex justify-between items-center p-4">
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      <div className="flex gap-2">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      </div>
    </div>

    {/* Image */}
    <div className="w-full aspect-[4/5] bg-gray-200 rounded-b-[2.5rem]"></div>

    <div className="px-5 -mt-6 relative z-10 space-y-4">
      {/* Title Card */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <div className="w-20 h-4 bg-gray-200 rounded mb-3"></div>
        <div className="w-3/4 h-6 bg-gray-200 rounded mb-3"></div>
        <div className="w-full h-px bg-gray-100 my-3"></div>
        <div className="flex justify-between">
          <div className="w-20 h-4 bg-gray-200 rounded"></div>
          <div className="w-20 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 h-32"></div>

      {/* Info */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 h-24"></div>
    </div>

    {/* Sticky Bar */}
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 h-20">
      <div className="flex gap-4 h-full">
        <div className="flex-1 bg-gray-200 rounded-xl"></div>
        <div className="w-32 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  </div>
);

// --- Main Page Component ---

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, itemCount } = useCart();

  const product = useLiveQuery(
    () => (id ? db.products.get(parseInt(id)) : undefined),
    [id]
  );

  const relatedReels = useLiveQuery(async () => {
    if (!id) return [];
    const productId = parseInt(id);
    const allPosts = await db.posts.toArray();
    return allPosts.filter(p => ((p as any).product_ids ?? (p as any).productIds ?? []).includes(productId));
  }, [id]);

  // UI States
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Short simulated delay for smooth transition
    if (product) {
      setTimeout(() => setIsLoading(false), 300);
    }
  }, [product]);

  // Reviews State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviews, setReviews] = useState([
    { id: 1, user: 'علی رضایی', date: '۲ روز پیش', rating: 5, comment: 'واقعا عالی بود، کیفیت صدا بی‌نظیره و نویز کنسلینگش توی هواپیما معجزه میکنه. پیشنهاد میکنم.' },
    { id: 2, user: 'سارا محمدی', date: '۱ هفته پیش', rating: 4, comment: 'خوبه ولی قیمتش یکم بالاست نسبت به رقبا. اما طراحی سونی همیشه خاصه.' },
    { id: 3, user: 'امیرحسین', date: '۳ هفته پیش', rating: 5, comment: 'بهترین خریدی که امسال داشتم. ممنون از ارسال سریع دیجی‌گرام.' },
  ]);

  const mainCtaRef = useRef<HTMLButtonElement>(null);

  // Scroll logic for Navbar background
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine current active product details based on variant
  const activeVariant = product?.variants && product.variants.length > 0
    ? product.variants[selectedVariantIndex]
    : null;

  const displayPrice = activeVariant ? activeVariant.price : product?.price;
  const displayOriginalPrice = activeVariant ? ((activeVariant as any).original_price ?? (activeVariant as any).originalPrice) : ((product as any)?.original_price ?? (product as any)?.originalPrice);

  // Stock Logic
  const currentStock = activeVariant
    ? (activeVariant.stock !== undefined ? activeVariant.stock : 10) // Fallback if old data
    : (product?.stock_count !== undefined ? product.stock_count : 10); // Fallback if old data

  const isOutOfStock = currentStock === 0;
  const isLowStock = currentStock > 0 && currentStock < 5;

  const productImages = product ? [
    (activeVariant?.image || getProductImage(product)),
    `/content/products/${Math.min(product.id + 1, 8)}.jpg`,
    `/content/products/${Math.min(product.id + 2, 8)}.jpg`,
    `/content/products/${Math.min(product.id + 3, 8)}.jpg`,
  ] : [];

  // Reset image index when variant changes to show the new primary image
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedVariantIndex]);

  const colors = [
    { id: 0, name: 'مشکی', hex: '#000000' },
    { id: 1, name: 'سفید', hex: '#ffffff' },
    { id: 2, name: 'سرمه‌ای', hex: '#1e3a8a' },
  ];

  const specs = [
    { label: 'وزن', value: '۱۵۰ گرم' },
    { label: 'ابعاد', value: '۱۴۰x۷۰x۸ میلی‌متر' },
    { label: 'جنس بدنه', value: 'آلومینیوم و شیشه' },
    { label: 'کشور سازنده', value: 'ویتنام' },
  ];

  // Sticky Bar Logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when the main CTA button is NO LONGER visible (scrolled past)
        setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );

    if (mainCtaRef.current) {
      observer.observe(mainCtaRef.current);
    }
    return () => observer.disconnect();
  }, [product, isLoading]); // Added isLoading dependency

  const handleReelClick = (postId: number) => {
    navigate('/reels', { state: { targetId: postId } });
  };

  const handleAddToCart = async () => {
    if (!product || isOutOfStock) return;
    await addToCart(product.id);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2500);
  };

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -100) {
      if (currentImageIndex < productImages.length - 1) setCurrentImageIndex(prev => prev + 1);
    } else if (swipe > 100) {
      if (currentImageIndex > 0) setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleSubmitReview = () => {
    if (!newReviewText.trim()) return;

    const newReview = {
      id: Date.now(),
      user: 'کاربر مهمان',
      date: 'لحظاتی پیش',
      rating: newReviewRating,
      comment: newReviewText
    };

    setReviews([newReview, ...reviews]);
    setIsReviewModalOpen(false);
    setNewReviewText('');
    setNewReviewRating(5);

    // Use same success toast for feedback
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2500);
  };

  if (!product || isLoading) {
    return <ProductDetailSkeleton />;
  }

  return (
    <div className="bg-[#f9f9f9] min-h-screen pb-28 font-persian" dir="rtl">

      {/* Immersive Floating Navbar */}
      <div className={`fixed top-0 left-0 right-0 z-30 flex justify-between items-center p-4 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : ''} max-w-md mx-auto`}>
        <button
          onClick={() => navigate(-1)}
          className={`p-2.5 rounded-full transition-colors active:scale-95 ${isScrolled ? 'bg-gray-100 text-gray-700' : 'bg-white/50 backdrop-blur-md text-gray-800'}`}
        >
          <ArrowRight size={22} />
        </button>
        <div className="flex gap-2.5">
          <button className={`p-2.5 rounded-full transition-colors active:scale-95 ${isScrolled ? 'bg-gray-100 text-gray-700' : 'bg-white/50 backdrop-blur-md text-gray-800'}`}>
            <Heart size={22} />
          </button>
          <button
            onClick={() => navigate('/cart')}
            className={`p-2.5 rounded-full transition-colors active:scale-95 relative ${isScrolled ? 'bg-gray-100 text-gray-700' : 'bg-white/50 backdrop-blur-md text-gray-800'}`}
          >
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#ef4056] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold border border-white">
                {toPersianDigits(itemCount)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Hero Gallery - Edge to Edge */}
      <div className="relative w-full aspect-[4/5] bg-white group rounded-b-[2.5rem] shadow-lg overflow-hidden">
        <motion.div
          className="flex w-full h-full"
          animate={{ x: `${currentImageIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          drag={!isZoomed ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          style={{ direction: 'ltr' }}
        >
          {productImages.map((img, idx) => (
            <div key={idx} className="min-w-full h-full relative" style={{ direction: 'rtl' }}>
              <ZoomableImage
                src={img}
                isActive={currentImageIndex === idx}
                onZoomChange={setIsZoomed}
              />
            </div>
          ))}
        </motion.div>

        {/* Floating Pagination */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
          {productImages.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${currentImageIndex === idx ? 'w-5 bg-[#ef4056]' : 'w-1.5 bg-gray-300/80 backdrop-blur'}`}
            />
          ))}
        </div>

        <div className="absolute top-20 right-4 bg-black/10 backdrop-blur-sm p-1.5 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <Maximize2 size={16} className="text-gray-600" />
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-10">
        {/* Title Card */}
        <div className="bg-white p-5 rounded-3xl shadow-md mb-4 border border-gray-100/50">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] text-[#ef4056] bg-red-50 px-2.5 py-1 rounded-full font-bold">فروش ویژه</span>
            <span className="text-[10px] text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full font-bold">{product.category}</span>
          </div>
          <h1 className="text-xl font-black text-gray-800 leading-8 mb-3">{product.title}</h1>

          <div className="flex items-center justify-between border-t border-gray-50 pt-3">
            <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
              <span className="font-bold">مدل:</span> XM-2024
            </div>
            <div className="flex items-center gap-1.5">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="text-base font-bold text-gray-800 pt-0.5">{toPersianDigits(product.rating)}</span>
              <span className="text-[10px] text-gray-400">(۱۲۵ دیدگاه)</span>
            </div>
          </div>
        </div>

        {/* Color & Variant Selection */}
        <div className="bg-white p-5 rounded-3xl shadow-sm mb-4">

          {/* Color Selection */}
          <div className="mb-6">
            <span className="text-sm font-bold text-gray-800 mb-3 block">رنگ انتخابی: <span className="text-[#ef4056]">{colors[selectedColor].name}</span></span>
            <div className="flex gap-3">
              {colors.map((color, idx) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(idx)}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === idx ? 'border-[#ef4056] shadow-md scale-105' : 'border-gray-100'}`}
                  style={{ backgroundColor: color.hex }}
                >
                  {selectedColor === idx && <Check size={20} className={color.hex === '#ffffff' ? 'text-black' : 'text-white'} />}
                </button>
              ))}
            </div>
          </div>

          {/* Premium Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <>
              <div className="h-[1px] bg-gray-100 w-full mb-6"></div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Layers size={18} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-800">انتخاب مدل / ظرفیت</span>
                  </div>
                  {activeVariant && (
                    <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-md text-gray-500 font-bold">
                      {activeVariant.name}
                    </span>
                  )}
                </div>
                <div className="relative flex flex-wrap gap-3 p-1 bg-gray-50/50 rounded-2xl border border-gray-100">
                  {product.variants.map((variant, idx) => {
                    const isSelected = selectedVariantIndex === idx;
                    const isVariantOutOfStock = (variant.stock ?? 10) === 0;

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedVariantIndex(idx)}
                        className={`relative flex-1 min-w-[100px] h-11 rounded-xl text-[13px] font-bold transition-all z-10 ${isSelected
                          ? 'text-white'
                          : isVariantOutOfStock
                            ? 'text-gray-300'
                            : 'text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="active-variant-bg"
                            className="absolute inset-0 bg-gray-900 rounded-xl shadow-lg -z-10"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <div className="flex flex-col">
                          <span>{variant.name}</span>
                          {isVariantOutOfStock && <span className="text-[8px] font-normal">ناموجود</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Info Grid */}
        <div className="bg-white rounded-3xl shadow-sm mb-4 overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-3">
              <div className="bg-red-50 p-2 rounded-xl">
                <Store className="text-[#ef4056]" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800">دیجی‌گرام استور</span>
                <span className="text-[10px] text-green-600 font-medium">رضایت ۹۸٪ خریداران</span>
              </div>
            </div>
            <ArrowRight className="text-gray-300 rotate-180" size={18} />
          </div>
          <div className="grid grid-cols-3 divide-x divide-x-reverse divide-gray-50">
            <div className="p-4 flex flex-col items-center gap-1 text-center">
              <Truck className="text-gray-400" size={20} />
              <span className="text-[10px] font-bold text-gray-500">ارسال سریع</span>
            </div>
            <div className="p-4 flex flex-col items-center gap-1 text-center">
              <ShieldCheck className="text-gray-400" size={20} />
              <span className="text-[10px] font-bold text-gray-500">ضمانت اصل</span>
            </div>
            <div className="p-4 flex flex-col items-center gap-1 text-center">
              <RotateCcw className="text-gray-400" size={20} />
              <span className="text-[10px] font-bold text-gray-500">۷ روز بازگشت</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white p-5 rounded-3xl shadow-sm mb-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3">درباره محصول</h3>
          <p className={`text-sm text-gray-600 leading-7 ${isDescriptionExpanded ? '' : 'line-clamp-3'}`}>
            {product.description}
          </p>
          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="flex items-center gap-1 text-xs font-bold text-blue-500 mt-2 mx-auto"
          >
            {isDescriptionExpanded ? (
              <>بستن <ChevronUp size={14} /></>
            ) : (
              <>مشاهده بیشتر <ChevronDown size={14} /></>
            )}
          </button>
        </div>

        {/* Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="bg-white p-5 rounded-3xl shadow-sm mb-4">
            <h3 className="font-bold text-gray-800 text-sm mb-3">مشخصات فنی</h3>
            <div className="space-y-3">
              {product.specifications.map((spec, idx) => (
                <div key={idx} className="flex justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                  <span className="text-gray-500">{spec.label}</span>
                  <span className="font-bold text-gray-800">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Reels */}
        {/* Enhanced Related Content Section */}
        <div className="bg-white rounded-3xl p-5 shadow-sm mb-4 border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-[#ef4056]" />
              <h3 className="font-bold text-gray-800 text-base">پیشنهادات دیجی‌گرام</h3>
            </div>
            <button className="text-xs font-bold text-blue-500">مشاهده همه</button>
          </div>

          {/* Related Reels Horizontal Scroll */}
          {relatedReels && relatedReels.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-1.5 mb-3 text-gray-400">
                <Clapperboard size={14} />
                <span className="text-[11px] font-bold">ویدیوهای مرتبط</span>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-5 px-5">
                {relatedReels.map(reel => (
                  <motion.div
                    key={reel.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReelClick(reel.id)}
                    className="min-w-[120px] aspect-[9/16] rounded-2xl overflow-hidden relative shadow-md border-2 border-white ring-1 ring-gray-100 cursor-pointer group"
                  >
                    <img src={reel.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <Play size={20} className="text-white fill-white translate-x-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-center gap-1 text-[8px] text-white/90">
                        <Heart size={8} className="fill-white" />
                        <span>{toPersianDigits(reel.likes)} پسند</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Placeholder for Related Products if needed */}
          <div className="flex items-center gap-1.5 text-gray-400 mb-3">
            <ShoppingBag size={14} />
            <span className="text-[11px] font-bold">محصولات مشابه</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-gray-50 rounded-2xl p-3 border border-gray-100 opacity-60">
                <div className="w-full aspect-square bg-gray-200 rounded-xl mb-2"></div>
                <div className="w-3/4 h-3 bg-gray-200 rounded mb-1.5"></div>
                <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Glass Sticky Action Bar */}
      <div className="fixed bottom-6 left-4 right-4 z-40 max-w-md mx-auto pointer-events-none">
        <div className="bg-white/70 backdrop-blur-2xl border border-white/40 p-3 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-4 pointer-events-auto">
          <div className="pr-4 border-l border-gray-200/50 flex flex-col justify-center">
            <div className="flex flex-col">
              {displayOriginalPrice && displayPrice && displayOriginalPrice > displayPrice && (
                <span className="text-[10px] text-gray-400 line-through decoration-red-400/50 leading-tight">
                  {formatPrice(displayOriginalPrice)}
                </span>
              )}
              <div className="flex items-center gap-1">
                <span className="text-lg font-black text-gray-900 leading-tight">{formatPrice(displayPrice || 0)}</span>
                <span className="text-[10px] font-bold text-gray-500">تومان</span>
              </div>
            </div>
          </div>
          <button
            ref={mainCtaRef}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 h-[52px] rounded-full font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isOutOfStock
              ? 'bg-gray-300 shadow-none cursor-not-allowed'
              : 'bg-[#ef4056] shadow-red-200 hover:bg-[#d63044]'
              }`}
          >
            {isOutOfStock ? (
              <>ناموجود</>
            ) : (
              <>
                <ShoppingBag size={20} strokeWidth={2.5} />
                <span className="text-sm">افزودن به سبد</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur text-white px-6 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-3"
          >
            <div className="bg-green-500 rounded-full p-1">
              <Check size={14} strokeWidth={3} />
            </div>
            <span className="text-sm font-bold">به سبد خرید اضافه شد</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ProductDetail;
