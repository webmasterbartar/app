
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { db, Post } from '../db';
import ReelCard from '../components/ReelCard';
import { Camera, Volume2, VolumeX } from 'lucide-react';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Persistent Mute State
  const [isMuted, setIsMuted] = useState(() => {
    try {
        const saved = localStorage.getItem('digigram_muted');
        return saved !== null ? JSON.parse(saved) : true;
    } catch {
        return true;
    }
  });

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    localStorage.setItem('digigram_muted', JSON.stringify(newState));
  };

  // 1. Fetch Posts
  useEffect(() => {
    const loadPosts = async () => {
      const allPosts = await db.posts.toArray();
      setPosts(allPosts);
    };
    loadPosts();
  }, []);

  // 2. Handle Scroll Snapping & Active Index Detection
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const index = Math.round(container.scrollTop / container.clientHeight);
      if (activeIndex !== index) {
        setActiveIndex(index);
      }
    }
  }, [activeIndex]);

  // 3. Handle External Navigation (e.g. clicking a related reel)
  useEffect(() => {
    if (location.state && (location.state as any).targetId && posts.length > 0) {
      const targetId = (location.state as any).targetId;
      const index = posts.findIndex(p => p.id === targetId);
      
      if (index !== -1) {
        // Allow DOM to render then scroll
        setTimeout(() => {
             if(containerRef.current) {
                 containerRef.current.scrollTo({
                    top: index * containerRef.current.clientHeight,
                    behavior: 'smooth'
                 });
                 setActiveIndex(index);
             }
        }, 100);
      }
    }
  }, [location.state, posts]);

  return (
    <div className="bg-black h-full w-full relative font-english">
      
      {/* Immersive Header (Reels Style) */}
      <div className="absolute top-0 left-0 right-0 z-40 pt-4 pb-12 px-4 pointer-events-none bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex justify-between items-start pointer-events-auto">
          <h1 className="text-white font-bold text-2xl tracking-tight drop-shadow-md">Reels</h1>
          <div className="flex items-center gap-4">
             <button onClick={toggleMute} className="text-white active:scale-90 transition-transform drop-shadow-md">
                {isMuted ? <VolumeX size={26} strokeWidth={1.5} /> : <Volume2 size={26} strokeWidth={1.5} />}
             </button>
             <Camera className="text-white active:scale-90 transition-transform drop-shadow-md" size={28} strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Main Feed Container - Native Scroll Snap */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        // Calculate height to account for bottom nav (60px) so snap points align perfectly
        className="h-[calc(100dvh-60px)] w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth bg-black"
      >
        {posts.length > 0 ? posts.map((post, index) => {
           const isActive = index === activeIndex;
           // Preload next video
           const shouldPreload = index === activeIndex + 1;

           return (
             <div key={post.id} className="w-full h-full snap-start relative">
                <ReelCard 
                    post={post} 
                    isActive={isActive}
                    shouldPreload={shouldPreload}
                    isMuted={isMuted}
                />
             </div>
           );
        }) : (
           <div className="h-full w-full flex items-center justify-center text-gray-500">
              Loading Reels...
           </div>
        )}
      </div>

    </div>
  );
};

export default Feed;
