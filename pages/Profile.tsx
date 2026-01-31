
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { db, Post } from '../db';
import { useNavigate } from 'react-router-dom';
import { Grid, Bookmark, Menu, PlusSquare, ChevronDown, Lock, User, X, MoreHorizontal, Heart, Send, Play, Shield, Loader2, Plus, Link as LinkIcon, Users } from 'lucide-react';
import { motion, AnimatePresence, useAnimation, PanInfo } from 'framer-motion';
import { toPersianDigits } from '../utils/persianUtils';

// --- Types & Mock Data ---
interface Story {
    id: number;
    image: string;
    duration: number; // seconds
}

interface Highlight {
    id: number;
    title: string;
    cover: string;
    stories: Story[];
}

const HIGHLIGHTS: Highlight[] = [
    {
        id: 1,
        title: 'New In',
        cover: 'https://picsum.photos/200/200?random=50',
        stories: [
            { id: 101, image: 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=800', duration: 4 },
            { id: 102, image: 'https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=800', duration: 4 }
        ]
    },
    {
        id: 2,
        title: 'Events',
        cover: 'https://picsum.photos/200/200?random=51',
        stories: [
            { id: 201, image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800', duration: 3 },
            { id: 202, image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=800', duration: 3 },
            { id: 203, image: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=800', duration: 3 }
        ]
    },
    {
        id: 3,
        title: 'Travel',
        cover: 'https://picsum.photos/200/200?random=52',
        stories: [
            { id: 301, image: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=800', duration: 5 }
        ]
    },
    {
        id: 4,
        title: 'Tech',
        cover: 'https://picsum.photos/200/200?random=53',
        stories: [
            { id: 401, image: 'https://images.pexels.com/photos/3589903/pexels-photo-3589903.jpeg?auto=compress&cs=tinysrgb&w=800', duration: 4 },
            { id: 402, image: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=800', duration: 4 }
        ]
    },
    {
        id: 5,
        title: 'Lifestyle',
        cover: 'https://picsum.photos/200/200?random=54',
        stories: [
            { id: 501, image: 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=800', duration: 4 }
        ]
    }
];

// --- Skeleton Component ---
const ProfileSkeleton = () => (
    <div className="bg-white min-h-screen pb-20 font-sans animate-pulse">
        {/* Header Skeleton */}
        <div className="sticky top-0 bg-white z-30 px-4 h-11 flex justify-between items-center">
            <div className="w-32 h-4 bg-gray-200 rounded"></div>
            <div className="flex gap-6">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
            </div>
        </div>

        <div className="px-4 pt-3 pb-2">
            {/* Top Section */}
            <div className="flex items-center justify-between mb-5">
                {/* Avatar */}
                <div className="w-[86px] h-[86px] rounded-full bg-gray-200 shrink-0"></div>

                {/* Stats */}
                <div className="flex-1 flex justify-around ml-4 items-center">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <div className="w-8 h-5 bg-gray-200 rounded"></div>
                            <div className="w-12 h-3 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bio */}
            <div className="space-y-2 mb-6">
                <div className="w-40 h-4 bg-gray-200 rounded"></div>
                <div className="w-24 h-3 bg-gray-200 rounded"></div>
                <div className="w-full max-w-[250px] h-3 bg-gray-200 rounded"></div>
                <div className="w-full max-w-[200px] h-3 bg-gray-200 rounded"></div>
                <div className="w-32 h-6 bg-gray-200 rounded-full mt-2"></div>
            </div>

            {/* Buttons */}
            <div className="flex gap-1.5 mb-6">
                <div className="flex-1 h-8 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 h-8 bg-gray-200 rounded-lg"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            </div>

            {/* Highlights */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar mb-4 px-1">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                        <div className="w-[64px] h-[64px] rounded-full bg-gray-200 border border-gray-100"></div>
                        <div className="w-12 h-2 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        </div>

        {/* Tabs */}
        <div className="flex h-[44px] border-t border-gray-100">
            <div className="flex-1 flex justify-center items-center">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
            </div>
            <div className="flex-1 flex justify-center items-center">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
            </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-[1px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                <div key={i} className="aspect-square bg-gray-200"></div>
            ))}
        </div>
    </div>
);

// --- StoryViewer Component ---

interface StoryViewerProps {
    highlight: Highlight;
    onClose: () => void;
    onNextHighlight: () => void;
    onPrevHighlight: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ highlight, onClose, onNextHighlight, onPrevHighlight }) => {
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [hideUI, setHideUI] = useState(false);

    const startTimeRef = useRef(Date.now());
    const animationFrameRef = useRef<number>(0);
    const pauseTimeRef = useRef<number>(0);
    const controls = useAnimation();

    useEffect(() => {
        setCurrentStoryIndex(0);
        setProgress(0);
        setIsImageLoaded(false);
        setIsPaused(false);
        startTimeRef.current = Date.now();
    }, [highlight.id]);

    const currentStory = highlight.stories[currentStoryIndex];
    const STORY_DURATION = (currentStory?.duration || 5) * 1000;

    const handleNext = useCallback(() => {
        if (currentStoryIndex < highlight.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
            setProgress(0);
            setIsImageLoaded(false);
            startTimeRef.current = Date.now();
        } else {
            onNextHighlight();
        }
    }, [currentStoryIndex, highlight.stories.length, onNextHighlight]);

    const handlePrev = useCallback(() => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
            setProgress(0);
            setIsImageLoaded(false);
            startTimeRef.current = Date.now();
        } else {
            onPrevHighlight();
        }
    }, [currentStoryIndex, onPrevHighlight]);

    useEffect(() => {
        if (!currentStory) return;

        const animate = () => {
            if (isPaused || !isImageLoaded) {
                startTimeRef.current = Date.now() - (progress / 100) * STORY_DURATION;
                animationFrameRef.current = requestAnimationFrame(animate);
                return;
            }

            const now = Date.now();
            const elapsed = now - startTimeRef.current;
            const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);

            setProgress(newProgress);

            if (newProgress >= 100) {
                handleNext();
            } else {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [currentStoryIndex, isPaused, isImageLoaded, handleNext, STORY_DURATION, progress, currentStory]);

    const handlePointerDown = () => {
        setIsPaused(true);
        const timer = setTimeout(() => setHideUI(true), 200);
        pauseTimeRef.current = Number(timer);
    };

    const handlePointerUp = () => {
        setIsPaused(false);
        setHideUI(false);
        clearTimeout(pauseTimeRef.current);
    };

    const handleDragEnd = async (event: any, info: PanInfo) => {
        if (info.offset.y > 100 && info.velocity.y > 0) {
            await controls.start({ y: '100%', scale: 0.8, opacity: 0, transition: { duration: 0.2 } });
            onClose();
        } else {
            controls.start({ y: 0, scale: 1, opacity: 1 });
        }
    };

    const handleTap = (e: React.MouseEvent) => {
        if (hideUI) return;
        const screenWidth = window.innerWidth;
        const clickX = e.clientX;
        if (clickX < screenWidth * 0.25) {
            handlePrev();
        } else {
            handleNext();
        }
    };

    if (!currentStory) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center font-english overflow-hidden"
        >
            <motion.div
                animate={controls}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
                className="relative w-full h-full max-w-md bg-black md:rounded-2xl overflow-hidden shadow-2xl"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900" onClick={handleTap}>
                    <div
                        className="absolute inset-0 bg-cover bg-center blur-xl opacity-50 scale-110"
                        style={{ backgroundImage: `url(${currentStory.image})` }}
                    />
                    {!isImageLoaded && (
                        <div className="absolute z-10 text-white/50">
                            <Loader2 size={32} className="animate-spin" />
                        </div>
                    )}
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentStory.id}
                            src={currentStory.image}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onLoad={() => setIsImageLoaded(true)}
                            transition={{ duration: 0.2 }}
                            className="w-full h-full object-contain relative z-0"
                            alt="story"
                            draggable="false"
                        />
                    </AnimatePresence>

                    {!hideUI && (
                        <>
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none transition-opacity duration-300" />
                            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none transition-opacity duration-300" />
                        </>
                    )}
                </div>

                <AnimatePresence>
                    {!hideUI && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 pointer-events-none"
                        >
                            <div className="absolute top-2 left-0 right-0 z-20 flex gap-1 px-2 pt-safe-top">
                                {highlight.stories.map((_, idx) => (
                                    <div key={idx} className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                                        <motion.div
                                            className="h-full bg-white shadow-[0_0_2px_rgba(255,255,255,0.8)]"
                                            initial={false}
                                            animate={{
                                                width: idx < currentStoryIndex ? '100%' :
                                                    idx === currentStoryIndex ? `${progress}%` : '0%'
                                            }}
                                            transition={{ ease: "linear", duration: 0 }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="absolute top-6 left-0 right-0 z-20 flex justify-between items-center px-3 py-2 mt-safe-top pointer-events-auto">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 cursor-pointer">
                                        <div className="w-8 h-8 rounded-full p-[1px] bg-white/20 backdrop-blur-sm">
                                            <img src={highlight.cover} className="w-full h-full rounded-full object-cover" alt="avatar" />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white text-xs font-semibold drop-shadow-md">{highlight.title}</span>
                                                <span className="text-white/60 text-[10px] font-medium">• 5h</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button className="p-1 active:scale-90 transition-transform text-white/90 hover:text-white"><MoreHorizontal size={24} /></button>
                                    <button onClick={onClose} className="p-1 active:scale-90 transition-transform text-white/90 hover:text-white"><X size={28} /></button>
                                </div>
                            </div>

                            <div className="absolute bottom-4 left-0 right-0 px-4 z-30 flex items-center gap-3 pb-safe-bottom pointer-events-auto">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Send message..."
                                        className="w-full bg-transparent border border-white/40 rounded-full py-3 px-5 text-white placeholder-white/80 text-sm focus:outline-none focus:border-white backdrop-blur-md transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                        onFocus={() => setIsPaused(true)}
                                        onBlur={() => setIsPaused(false)}
                                    />
                                </div>
                                <button className="p-2 active:scale-90 transition-transform"><Heart className="text-white" size={28} strokeWidth={1.5} /></button>
                                <button className="p-2 active:scale-90 transition-transform"><Send className="text-white rotate-12" size={26} strokeWidth={1.5} /></button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<Post[]>([]);
    const [activeTab, setActiveTab] = useState<'grid' | 'tagged'>('grid');
    const [activeHighlight, setActiveHighlight] = useState<Highlight | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPosts = async () => {
            // Simulate network delay for skeleton demonstration
            await new Promise(resolve => setTimeout(resolve, 800));
            const allPosts = await db.posts.toArray();
            setPosts(allPosts.reverse());
            setIsLoading(false);
        };
        loadPosts();
    }, []);

    const handlePostClick = (postId: number) => {
        navigate('/reels', { state: { targetId: postId } });
    };

    const handleNextHighlight = () => {
        const currentIndex = HIGHLIGHTS.findIndex(h => h.id === activeHighlight?.id);
        if (currentIndex !== -1 && currentIndex < HIGHLIGHTS.length - 1) {
            setActiveHighlight(HIGHLIGHTS[currentIndex + 1]);
        } else {
            setActiveHighlight(null);
        }
    };

    const handlePrevHighlight = () => {
        const currentIndex = HIGHLIGHTS.findIndex(h => h.id === activeHighlight?.id);
        if (currentIndex > 0) {
            setActiveHighlight(HIGHLIGHTS[currentIndex - 1]);
        }
    };

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    return (
        <div className="bg-white min-h-screen pb-20 font-sans text-[#262626]">

            {/* Header */}
            <header className="sticky top-0 bg-white z-30 px-4 h-11 flex justify-between items-center">
                <div className="flex items-center gap-1 cursor-pointer" onClick={() => navigate('/admin')}>
                    <Lock size={12} className="text-black" strokeWidth={2.5} />
                    <span className="font-bold text-xl text-black tracking-tight">digigram_store</span>
                    <ChevronDown size={14} className="text-black" strokeWidth={2} />
                </div>
                <div className="flex items-center gap-6">
                    <PlusSquare size={26} className="text-black" strokeWidth={2} />
                    <Menu size={26} className="text-black" strokeWidth={2} />
                </div>
            </header>

            {/* Profile Section */}
            <div className="px-4 pt-3 pb-2">
                <div className="flex items-center justify-between mb-5">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-[86px] h-[86px] rounded-full p-[2px] story-gradient cursor-pointer">
                            <div className="w-full h-full rounded-full border-[2px] border-white overflow-hidden">
                                <img src="https://picsum.photos/200/200?random=me" className="w-full h-full object-cover" alt="Profile" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 bg-[#0095f6] text-white w-6 h-6 rounded-full flex items-center justify-center border-[2px] border-white cursor-pointer">
                            <Plus size={14} strokeWidth={3} />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 flex justify-around ml-6 items-center">
                        <div className="flex flex-col items-center cursor-pointer">
                            <span className="font-bold text-[16px] leading-tight">{toPersianDigits(posts.length)}</span>
                            <span className="text-[13px] text-[#262626] font-normal">Posts</span>
                        </div>
                        <div className="flex flex-col items-center cursor-pointer">
                            <span className="font-bold text-[16px] leading-tight">{toPersianDigits('12.5')}K</span>
                            <span className="text-[13px] text-[#262626] font-normal">Followers</span>
                        </div>
                        <div className="flex flex-col items-center cursor-pointer">
                            <span className="font-bold text-[16px] leading-tight">{toPersianDigits(108)}</span>
                            <span className="text-[13px] text-[#262626] font-normal">Following</span>
                        </div>
                    </div>
                </div>

                {/* Bio */}
                <div className="mb-4 text-[14px] px-1">
                    <h1 className="font-bold text-[14px] leading-4 mb-0.5">DigiGram Store | Online Shop</h1>
                    <div className="text-[#8e8e8e] text-[14px] mb-1">Shopping & Retail</div>
                    <div className="whitespace-pre-line leading-[18px] text-[#262626]">
                        🛍️ Top electronics & gadgets
                        🚀 Free shipping on orders over $50
                        ✨ New collection every week
                    </div>
                    {/* Link Pill */}
                    <div
                        className="mt-2 flex items-center gap-1.5 bg-[#efefef]/50 w-fit px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => navigate('/shop')}
                    >
                        <LinkIcon size={12} className="text-[#00376b]" />
                        <span className="text-[13px] font-semibold text-[#00376b]">digigram.store/shop</span>
                    </div>

                    {/* Followed by */}
                    <div className="flex items-center gap-1.5 mt-3 text-[12px]">
                        <div className="flex -space-x-1.5">
                            <img src="https://picsum.photos/50/50?random=1" className="w-4 h-4 rounded-full border border-white" />
                            <img src="https://picsum.photos/50/50?random=2" className="w-4 h-4 rounded-full border border-white" />
                        </div>
                        <span className="text-gray-500">Followed by <span className="font-semibold text-black">user1</span>, <span className="font-semibold text-black">user2</span> + 12 more</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-6 px-1">
                    <button className="flex-1 bg-[#efefef] h-[32px] rounded-lg text-[13px] font-semibold text-black active:opacity-60 transition-opacity">Edit profile</button>
                    <button className="flex-1 bg-[#efefef] h-[32px] rounded-lg text-[13px] font-semibold text-black active:opacity-60 transition-opacity">Share profile</button>
                    <button className="bg-[#efefef] w-[32px] h-[32px] rounded-lg flex items-center justify-center text-black active:opacity-60 transition-opacity">
                        <User size={18} />
                    </button>
                </div>

                {/* Highlights */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar mb-2 px-1">
                    {HIGHLIGHTS.map(hl => (
                        <div key={hl.id} className="flex flex-col items-center gap-1.5 cursor-pointer active:opacity-70 transition-opacity" onClick={() => setActiveHighlight(hl)}>
                            <div className="w-[64px] h-[64px] rounded-full p-[1px] bg-gray-200 border border-gray-100">
                                <div className="w-full h-full rounded-full border-[2px] border-white overflow-hidden bg-white">
                                    <img src={hl.cover} className="w-full h-full object-cover" alt={hl.title} />
                                </div>
                            </div>
                            <span className="text-[11px] text-black font-normal tracking-tight truncate w-16 text-center">{hl.title}</span>
                        </div>
                    ))}
                    {/* New Highlight */}
                    <div className="flex flex-col items-center gap-1.5 cursor-pointer active:opacity-70 transition-opacity">
                        <div className="w-[64px] h-[64px] rounded-full border-[1px] border-gray-300 flex items-center justify-center bg-white">
                            <Plus size={24} className="text-gray-800" strokeWidth={1} />
                        </div>
                        <span className="text-[11px] text-black font-normal">New</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex sticky top-[44px] bg-white z-20 h-[44px] border-t border-gray-200">
                <button
                    className={`flex-1 flex justify-center items-center h-full relative transition-colors ${activeTab === 'grid' ? 'text-black' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('grid')}
                >
                    <Grid size={24} strokeWidth={activeTab === 'grid' ? 2 : 1.5} />
                    {activeTab === 'grid' && <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-black"></div>}
                </button>
                <button
                    className={`flex-1 flex justify-center items-center h-full relative transition-colors ${activeTab === 'tagged' ? 'text-black' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('tagged')}
                >
                    <Users size={24} strokeWidth={activeTab === 'tagged' ? 2 : 1.5} className="border-[1.5px] border-current rounded-md p-0.5 box-content w-5 h-5" />
                    {activeTab === 'tagged' && <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-black"></div>}
                </button>
            </div>

            {/* Grid Content */}
            {activeTab === 'grid' ? (
                <div className="grid grid-cols-3 gap-[1px]">
                    {posts.map(post => (
                        <div
                            key={post.id}
                            className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer"
                            onClick={() => handlePostClick(post.id)}
                        >
                            <img src={post.thumbnail} className="w-full h-full object-cover" loading="lazy" />
                            {/* Reel Icon Top Right */}
                            <div className="absolute top-2 right-2 text-white drop-shadow-md">
                                <Play size={16} fill="currentColor" className="opacity-90" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 flex flex-col items-center justify-center text-gray-500 gap-3">
                    <div className="w-24 h-24 rounded-full border-2 border-black flex items-center justify-center">
                        <Users size={48} className="text-black" strokeWidth={1} />
                    </div>
                    <h3 className="font-bold text-xl text-black">Photos of you</h3>
                    <p className="text-xs text-center max-w-[220px] leading-5">When people tag you in photos, they'll appear here.</p>
                </div>
            )}

            {/* Highlight Viewer Modal */}
            <AnimatePresence>
                {activeHighlight && (
                    <StoryViewer
                        highlight={activeHighlight}
                        onClose={() => setActiveHighlight(null)}
                        onNextHighlight={handleNextHighlight}
                        onPrevHighlight={handlePrevHighlight}
                    />
                )}
            </AnimatePresence>

        </div>
    );
};

export default Profile;
