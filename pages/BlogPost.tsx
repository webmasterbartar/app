
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { ArrowRight, Clock, User, Share2, Bookmark, Heart, MessageCircle } from 'lucide-react';
import { toPersianDigits } from '../utils/persianUtils';

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const post = useLiveQuery(
    () => (id ? db.blogs.get(parseInt(id)) : undefined),
    [id]
  );

  if (!post) return <div className="h-screen flex items-center justify-center font-persian">در حال بارگذاری...</div>;

  return (
    <div className="min-h-screen bg-white font-persian pb-24" dir="rtl">
      
      {/* Immersive Header */}
      <div className="relative w-full aspect-video">
         <img src={post.cover_image} className="w-full h-full object-cover" alt={post.title} />
         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
         
         <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
             <button onClick={() => navigate(-1)} className="bg-white/20 backdrop-blur p-2 rounded-full text-white hover:bg-white/30 transition-colors">
                 <ArrowRight size={22} />
             </button>
             <div className="flex gap-2">
                 <button className="bg-white/20 backdrop-blur p-2 rounded-full text-white hover:bg-white/30 transition-colors">
                     <Bookmark size={20} />
                 </button>
                 <button className="bg-white/20 backdrop-blur p-2 rounded-full text-white hover:bg-white/30 transition-colors">
                     <Share2 size={20} />
                 </button>
             </div>
         </div>

         <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
             <span className="bg-[#ef4056] px-2 py-0.5 rounded text-[10px] font-bold mb-2 inline-block">
                 {post.category}
             </span>
             <h1 className="font-black text-xl md:text-2xl leading-tight mb-2 text-shadow-sm">
                 {post.title}
             </h1>
             <div className="flex items-center gap-4 text-xs opacity-90">
                 <div className="flex items-center gap-1.5">
                     <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                         <User size={12} />
                     </div>
                     <span>{post.author}</span>
                 </div>
                 <div className="flex items-center gap-1">
                     <Clock size={12} />
                     <span>{toPersianDigits(post.read_time)} دقیقه</span>
                 </div>
             </div>
         </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 max-w-2xl mx-auto">
          <p className="font-bold text-gray-800 text-sm leading-7 mb-6 border-r-4 border-[#ef4056] pr-3 bg-gray-50 p-3 rounded-l-lg">
              {post.excerpt}
          </p>
          
          <div className="prose prose-sm text-gray-600 leading-8 text-justify">
              {/* Simulate Paragraphs */}
              {post.content.split('\n').map((para, i) => (
                  <p key={i} className="mb-4">{para}</p>
              ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                      <Heart size={20} />
                      <span className="text-xs font-bold">{toPersianDigits(42)}</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors">
                      <MessageCircle size={20} />
                      <span className="text-xs font-bold">{toPersianDigits(8)}</span>
                  </button>
              </div>
              <span className="text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleDateString('fa-IR')}
              </span>
          </div>
      </div>
    </div>
  );
};

export default BlogPost;
