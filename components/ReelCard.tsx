
import React, { useRef, useState, useEffect } from 'react';
import { Post, Product, db, getProductImage } from '../db';
import { Heart, MessageCircle, Send, MoreHorizontal, ShoppingBag, X, WifiOff, RotateCcw, Plus, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../utils/persianUtils';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

interface ReelCardProps {
    post: Post;
    isActive: boolean;
    shouldPreload: boolean;
    isMuted: boolean;
    onViewProducts?: () => void;
}

const ReelCard: React.FC<ReelCardProps> = ({ post, isActive, shouldPreload, isMuted }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [showHeart, setShowHeart] = useState(false);
    const [showQuickView, setShowQuickView] = useState(false);
    const [linkedProducts, setLinkedProducts] = useState<Product[]>([]);
    const [videoError, setVideoError] = useState(false);

    // Cart integration
    const { addToCart } = useCart();
    const [addedItems, setAddedItems] = useState<number[]>([]);

    // Local state for optimistic UI
    const [isLiked, setIsLiked] = useState(false);
    const lastTapRef = useRef<number>(0);

    const productIds = (post as any).product_ids ?? (post as any).productIds ?? [];
    useEffect(() => {
        const fetchProducts = async () => {
            if (productIds.length > 0) {
                const products = await db.products.bulkGet(productIds);
                setLinkedProducts(products.filter(p => p !== undefined) as Product[]);
            }
        };
        fetchProducts();
    }, [productIds.join(',')]);

    useEffect(() => {
        if (isActive && !videoError) {
            const timer = setTimeout(() => {
                // Attempt to play. Note: If isMuted is false (sound on), browsers might block autoplay 
                // if there was no interaction. The global toggle button serves as interaction.
                videoRef.current?.play().catch((e) => {
                    console.warn("Video play failed:", e.message || "Unknown error");
                });
            }, 50);
            return () => clearTimeout(timer);
        } else {
            videoRef.current?.pause();
            if (videoRef.current) videoRef.current.currentTime = 0;
            setShowQuickView(false);
        }
    }, [isActive, videoError]);

    const toggleLike = async (forceVal?: boolean) => {
        const newVal = forceVal !== undefined ? forceVal : !isLiked;
        setIsLiked(newVal);
        const change = newVal ? 1 : -1;
        await db.posts.update(post.id, { likes: post.likes + change });
    };

    const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
        // If sheet is open, let the backdrop click handler deal with it (prevent toggle play)
        if (showQuickView) {
            // Optional: Close sheet if clicking outside explicitly, 
            // but we handle that with the Backdrop div below.
            return;
        }

        if (videoError) return;

        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
            if (!isLiked) toggleLike(true);
            setShowHeart(true);
            setTimeout(() => setShowHeart(false), 1000);
        } else {
            if (videoRef.current?.paused) {
                videoRef.current?.play().catch(() => { });
            } else {
                videoRef.current?.pause();
            }
        }
        lastTapRef.current = now;
    };

    const videoUrl = (post as any).video_url ?? (post as any).videoUrl ?? '';
    const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        console.error("Video load error for:", videoUrl);
        setVideoError(true);
    };

    const handleRetry = (e: React.MouseEvent) => {
        e.stopPropagation();
        setVideoError(false);
        if (videoRef.current) {
            videoRef.current.load();
        }
    };

    const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
        e.preventDefault();
        e.stopPropagation();
        await addToCart(productId);
        setAddedItems(prev => [...prev, productId]);
        setTimeout(() => {
            setAddedItems(prev => prev.filter(id => id !== productId));
        }, 2000);
    };

    return (
        <div
            dir="ltr"
            className="relative w-full h-full bg-black overflow-hidden font-english"
        >
            {/* Video Layer */}
            <div className="absolute inset-0 w-full h-full" onClick={handleTap}>
                {!videoError ? (
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full h-full object-cover"
                        playsInline
                        muted={isMuted}
                        loop
                        preload={shouldPreload ? "auto" : "none"}
                        poster={post.thumbnail}
                        onError={handleVideoError}
                    />
                ) : (
                    <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-gray-400 gap-4">
                        <div className="flex flex-col items-center gap-2">
                            <WifiOff size={48} />
                            <span className="text-sm font-medium">Video Unavailable</span>
                        </div>
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-xs font-semibold border border-white/20 active:scale-95 transition-all"
                        >
                            <RotateCcw size={14} />
                            Retry
                        </button>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60 pointer-events-none" />
            </div>

            {/* Big Animated Heart */}
            <AnimatePresence>
                {showHeart && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1.2, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
                    >
                        <Heart size={100} className="fill-white text-white drop-shadow-2xl" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Right Sidebar Icons */}
            <div className="absolute right-2 bottom-20 flex flex-col gap-5 items-center z-20">
                {/* User Interaction Icons */}
                <div className="flex flex-col gap-6 items-center">
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleLike(); }}
                        className="flex flex-col items-center gap-1.5 active:scale-75 transition-transform"
                    >
                        <div className="p-1">
                            <Heart
                                size={28}
                                className={isLiked ? "fill-[#ff3040] text-[#ff3040]" : "text-white"}
                                strokeWidth={2}
                            />
                        </div>
                        <span className="text-white text-xs font-semibold drop-shadow-lg">{post.likes}</span>
                    </button>

                    <button className="flex flex-col items-center gap-1.5 active:scale-75 transition-transform">
                        <div className="p-1">
                            <MessageCircle size={28} className="text-white" strokeWidth={2} />
                        </div>
                        <span className="text-white text-xs font-semibold drop-shadow-lg">45</span>
                    </button>

                    <button className="flex flex-col items-center gap-1.5 active:scale-75 transition-transform">
                        <div className="p-1">
                            <Send size={26} className="text-white -rotate-12" strokeWidth={2} />
                        </div>
                        <span className="text-white text-[11px] font-semibold drop-shadow-lg">Share</span>
                    </button>

                    <button className="p-1 active:scale-75 transition-transform">
                        <MoreHorizontal size={24} className="text-white" strokeWidth={2} />
                    </button>
                </div>

                {/* Album Art / Audio Icon */}
                <div className="mt-4 relative">
                    <div className="w-8 h-8 rounded-lg border-2 border-white/90 overflow-hidden bg-gray-800 animate-spin-slower">
                        <img src={`/content/avatars/reel-${post.id}.jpg`} className="w-full h-full object-cover" alt="" />
                    </div>
                    {/* Musical Note small icon can be added here if needed */}
                </div>
            </div>

            {/* Bottom Left Info - Instagram Style Meta */}
            <div className={`absolute left-0 bottom-0 right-0 z-20 px-4 pb-6 pt-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-all duration-300 ${showQuickView ? 'opacity-0 blur-sm pointer-events-none' : 'opacity-100'}`}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/40 ring-1 ring-white/20 ring-offset-1 ring-offset-transparent">
                        <img src="/content/avatars/store.jpg" className="w-full h-full object-cover" alt="" />
                    </div>
                    <span className="font-bold text-[14px] text-white tracking-tight drop-shadow-md">digigram_store</span>
                    <button className="ml-1 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg text-[12px] font-bold text-white backdrop-blur-md border border-white/20 transition-colors">Follow</button>
                </div>

                <div className="text-[14px] leading-relaxed text-white drop-shadow-md mb-4 line-clamp-2 max-w-[85%] font-medium">
                    {post.caption}
                </div>

                {/* Music Ticker / Audio Info */}
                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md w-fit px-3 py-1.5 rounded-full border border-white/10">
                    <div className="relative w-3 h-3 overflow-hidden">
                        <div className="absolute inset-0 flex items-center gap-[2px]">
                            <div className="w-[1.5px] h-2 bg-white/80 animate-music-bar-1"></div>
                            <div className="w-[1.5px] h-3 bg-white/80 animate-music-bar-2"></div>
                            <div className="w-[1.5px] h-1.5 bg-white/80 animate-music-bar-3"></div>
                        </div>
                    </div>
                    <div className="overflow-hidden whitespace-nowrap max-w-[150px]">
                        <div className="text-[12px] text-white/90 font-semibold animate-marquee inline-block">
                            Original Audio • digigram_store • Original Audio • digigram_store
                        </div>
                    </div>
                </div>
            </div>

            {/* Dark Backdrop for Bottom Sheet */}
            <AnimatePresence>
                {showQuickView && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 z-30 backdrop-blur-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowQuickView(false);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Product Bottom Sheet */}
            <AnimatePresence>
                {showQuickView && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl rounded-t-[28px] overflow-hidden flex flex-col max-h-[60%] shadow-[0_-10px_40px_rgba(0,0,0,0.3)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center pt-3 pb-1" onClick={() => setShowQuickView(false)}>
                            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                        </div>

                        {/* Header */}
                        <div className="px-5 py-2 flex justify-between items-center border-b border-gray-100/50" dir="rtl">
                            <div className="flex items-center gap-2">
                                <ShoppingBag size={18} className="text-[#ef4056]" />
                                <span className="font-bold text-gray-800 text-sm font-persian">محصولات ویدیو ({linkedProducts.length})</span>
                            </div>
                            <button
                                onClick={() => setShowQuickView(false)}
                                className="bg-gray-100 p-1.5 rounded-full hover:bg-gray-200 active:scale-90 transition-transform"
                            >
                                <X size={16} className="text-gray-600" />
                            </button>
                        </div>

                        {/* Product List */}
                        <div className="overflow-y-auto p-4 space-y-3 font-persian pb-24" dir="rtl">
                            {linkedProducts.map(p => (
                                <div key={p.id} className="flex gap-3 bg-white p-2.5 rounded-2xl border border-gray-100 shadow-sm relative group">
                                    <Link to={`/product/${p.id}`} className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                                        <img src={getProductImage(p)} className="w-full h-full object-cover mix-blend-multiply" alt={p.title} />
                                    </Link>
                                    <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                                        <Link to={`/product/${p.id}`} className="text-xs font-bold text-gray-800 line-clamp-2 leading-5">
                                            {p.title}
                                        </Link>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex flex-col">
                                                {((p as any).original_price ?? (p as any).originalPrice) && (
                                                    <span className="text-[10px] text-gray-400 line-through decoration-red-400">
                                                        {formatPrice((p as any).original_price ?? (p as any).originalPrice ?? 0)}
                                                    </span>
                                                )}
                                                <span className="font-bold text-sm text-gray-900">
                                                    {formatPrice(p.price)} <span className="text-[10px] font-normal text-gray-500">تومان</span>
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => handleAddToCart(e, p.id)}
                                                className={`p-2 rounded-xl active:scale-90 transition-all shadow-md ${addedItems.includes(p.id)
                                                        ? 'bg-green-500 shadow-green-200'
                                                        : 'bg-[#ef4056] shadow-red-200'
                                                    }`}
                                            >
                                                {addedItems.includes(p.id) ? (
                                                    <Check size={18} className="text-white" />
                                                ) : (
                                                    <Plus size={18} className="text-white" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Products Pill (Trigger / Mini Preview) */}
            <AnimatePresence>
                {productIds.length > 0 && !showQuickView && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-4 left-0 right-0 flex justify-center z-30 pointer-events-none"
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowQuickView(true); }}
                            className="pointer-events-auto bg-black/60 backdrop-blur-md border border-white/20 flex items-center p-1 rounded-l-full rounded-r-full active:scale-95 transition-transform shadow-lg group hover:bg-black/70 max-w-[90%]"
                        >
                            {linkedProducts.length > 0 ? (
                                <>
                                    {/* Thumbnail */}
                                    <div className="w-10 h-10 rounded-full bg-white overflow-hidden shrink-0 border border-white/20 relative z-10">
                                        <img src={getProductImage(linkedProducts[0])} className="w-full h-full object-cover" alt="product" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex flex-col items-start px-3 min-w-0">
                                        <span className="text-[11px] font-bold text-white truncate w-full max-w-[140px] font-persian leading-tight">
                                            {linkedProducts[0].title}
                                        </span>
                                        <span className="text-[10px] text-gray-200 font-persian mt-0.5">
                                            {formatPrice(linkedProducts[0].price)} تومان
                                        </span>
                                    </div>

                                    {/* Action/Count */}
                                    <div className="pr-2 pl-1 flex items-center gap-1 border-l border-white/10 ml-1">
                                        {linkedProducts.length > 1 ? (
                                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] text-white font-bold">
                                                +{linkedProducts.length - 1}
                                            </span>
                                        ) : (
                                            <ChevronRight size={16} className="text-white opacity-80" />
                                        )}
                                    </div>
                                </>
                            ) : (
                                // Loading State
                                <>
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-2 animate-pulse">
                                        <ShoppingBag size={14} className="text-white/50" />
                                    </div>
                                    <span className="text-[11px] font-semibold text-white pr-4">Loading Products...</span>
                                </>
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReelCard;
