
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, User, ChevronRight } from 'lucide-react';
import { toPersianDigits } from '../utils/persianUtils';

const BlogArchive: React.FC = () => {
  const navigate = useNavigate();
  const blogs = useLiveQuery(() => db.blogs.toArray()) || [];

  return (
    <div className="min-h-screen bg-white pb-24 font-persian" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-30 px-4 py-4 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <ArrowRight size={22} className="text-gray-800" />
        </button>
        <h1 className="font-black text-xl text-gray-800">دیجی‌مگ</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Featured Post (First one) */}
        {blogs.length > 0 && (
             <Link to={`/blog/${blogs[0].id}`} className="block group">
                <div className="aspect-video w-full rounded-2xl overflow-hidden mb-3 relative shadow-md">
                    <img src={blogs[0].cover_image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={blogs[0].title} />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-gray-800">
                        {blogs[0].category}
                    </div>
                </div>
                <h2 className="font-black text-lg text-gray-900 leading-tight mb-2 group-hover:text-[#ef4056] transition-colors">
                    {blogs[0].title}
                </h2>
                <p className="text-sm text-gray-500 leading-6 line-clamp-2 mb-3">
                    {blogs[0].excerpt}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1"><Clock size={12} /> {toPersianDigits(blogs[0].read_time)} دقیقه مطالعه</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{new Date(blogs[0].created_at).toLocaleDateString('fa-IR')}</span>
                </div>
             </Link>
        )}

        <div className="h-[1px] bg-gray-100 w-full"></div>

        {/* Recent Posts List */}
        <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-sm">آخرین مطالب</h3>
            {blogs.slice(1).map(blog => (
                <Link to={`/blog/${blog.id}`} key={blog.id} className="flex gap-3 group">
                    <div className="w-28 h-28 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                        <img src={blog.cover_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={blog.title} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                            <span className="text-[10px] text-[#ef4056] font-bold mb-1 block">{blog.category}</span>
                            <h3 className="font-bold text-sm text-gray-800 leading-6 line-clamp-2 group-hover:text-[#ef4056] transition-colors">
                                {blog.title}
                            </h3>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                             <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                 <User size={10} />
                                 <span>{blog.author}</span>
                             </div>
                             <ChevronRight size={14} className="text-gray-300" />
                        </div>
                    </div>
                </Link>
            ))}
        </div>

        {blogs.length === 0 && (
            <div className="py-20 text-center text-gray-400 text-sm">
                هنوز مقاله‌ای منتشر نشده است.
            </div>
        )}
      </div>
    </div>
  );
};

export default BlogArchive;
