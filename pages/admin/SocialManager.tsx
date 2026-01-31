
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { api } from '../../services/api';
import { Plus, Play, Trash2, Search, Check, Video, Image as ImageIcon, Loader2, User, Layers, Info, X, Grid, Heart, Sparkles, Smartphone, Sticker, MoreHorizontal, Battery, Wifi, Signal, Calendar, Hash, Type, MoveVertical, UploadCloud, MousePointer2, Download } from 'lucide-react';
import { toPersianDigits } from '../../utils/persianUtils';
import { GoogleGenAI } from "@google/genai";

interface Product {
  id: number;
  title: string;
  image: string;
  price: number;
  main_image_url?: string;
  base_price?: number;
}

const SocialManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reels' | 'stories' | 'profile'>('reels');
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [reels, setReels] = useState<any[]>([]);
  
  // Forms & UI States
  const [isUploadMode, setIsUploadMode] = useState(false);
  
  // AI State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // --- REEL FORM STATE ---
  const [reelForm, setReelForm] = useState({
      video_url: '', thumbnail: '', caption: '', product_ids: [] as number[],
      is_scheduled: false, schedule_date: ''
  });
  
  // --- STORY FORM STATE ---
  const [storyForm, setStoryForm] = useState({
      image_url: '', 
      type: 'image', 
      duration: 5, 
      product_id: null as number | null,
      story_text: '', // New: Overlay Text
      sticker_pos: 'bottom' as 'top' | 'center' | 'bottom' // New: Sticker Position
  });

  // --- PROFILE FORM STATE ---
  const [profileForm, setProfileForm] = useState({ bio: '', avatar_url: '', shop_link: '', name: 'DigiGram Store', category: 'Shopping & Retail' });

  // Search States
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [linkedProducts, setLinkedProducts] = useState<Product[]>([]); // For Reels
  const [linkedStoryProduct, setLinkedStoryProduct] = useState<Product | null>(null); // For Story

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
      setLoading(true);
      if (activeTab === 'reels') {
          const data = await api.social.getReels();
          if(data) setReels(data);
      } else if (activeTab === 'profile') {
          const data = await api.social.getProfile();
          if(data) setProfileForm({ ...profileForm, ...data });
      }
      setLoading(false);
  };

  // --- HELPER: File Select for Preview ---
  const handleFilePreview = (e: React.ChangeEvent<HTMLInputElement>, field: 'video' | 'thumb' | 'story') => {
      if(e.target.files && e.target.files[0]){
          const url = URL.createObjectURL(e.target.files[0]);
          if(field === 'video') setReelForm(prev => ({...prev, video_url: url}));
          if(field === 'thumb') setReelForm(prev => ({...prev, thumbnail: url}));
          if(field === 'story') setStoryForm(prev => ({...prev, image_url: url}));
      }
  }

  // --- AI HELPERS ---
  const generateCaption = async () => {
      if(linkedProducts.length === 0 && !reelForm.caption) return alert("لطفا یک محصول انتخاب کنید یا موضوعی در کپشن بنویسید");
      
      setIsGeneratingAI(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const productName = linkedProducts.length > 0 ? linkedProducts[0].title : "General Product";
          const prompt = `Write a viral, short Instagram caption (in Persian) for a video about "${productName}". Tone: Exciting and energetic. No hashtags yet.`;
          
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
          });

          if (response.text) {
              setReelForm(prev => ({ ...prev, caption: response.text || '' }));
          }
      } catch (e) {
          console.error(e);
          alert("خطا در تولید متن");
      } finally {
          setIsGeneratingAI(false);
      }
  };

  const generateHashtags = async () => {
    if(!reelForm.caption) return alert("ابتدا یک کپشن بنویسید");
    setIsGeneratingAI(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Generate 10 relevant, high-traffic Persian and English hashtags for this caption: "${reelForm.caption}". Return them space-separated.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        if (response.text) {
            setReelForm(prev => ({ ...prev, caption: prev.caption + '\n\n' + response.text }));
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsGeneratingAI(false);
    }
  };

  const generateBio = async () => {
      setIsGeneratingAI(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const prompt = `Write a professional Instagram Bio (in Persian) for an online shop named "${profileForm.name}". Category: ${profileForm.category}. Use emojis. Max 150 chars.`;
          
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
          });

          if (response.text) {
              setProfileForm(prev => ({ ...prev, bio: response.text || '' }));
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsGeneratingAI(false);
      }
  };

  // --- PRODUCT SEARCH ---
  const handleSearchProducts = async (query: string) => {
    setProductSearch(query);
    if (query.length < 2) { setSearchResults([]); return; }
    const { data } = await supabase.from('products').select('id, title, main_image_url, base_price').ilike('title', `%${query}%`).limit(5);
    if (data) setSearchResults(data as any);
  };

  const addProductLink = (product: Product, target: 'reel' | 'story') => {
    if (target === 'reel') {
        if (!linkedProducts.find(p => p.id === product.id)) {
            setLinkedProducts([...linkedProducts, product]);
            setReelForm(prev => ({ ...prev, product_ids: [...prev.product_ids, product.id] }));
        }
    } else {
        setLinkedStoryProduct(product);
        setStoryForm(prev => ({ ...prev, product_id: product.id }));
    }
    setProductSearch(''); setSearchResults([]);
  };

  // --- SAVE HANDLERS ---
  const handleSaveReel = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          await api.social.createReel(reelForm);
          setIsUploadMode(false);
          fetchData();
          setReelForm({ video_url: '', thumbnail: '', caption: '', product_ids: [], is_scheduled: false, schedule_date: '' });
          setLinkedProducts([]);
      } catch (err) { alert('خطا در انتشار'); } finally { setLoading(false); }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          await api.social.updateProfile(profileForm);
          alert('پروفایل بروزرسانی شد');
      } catch(err) { alert('خطا'); } finally { setLoading(false); }
  };

  // --- PHONE PREVIEW COMPONENT ---
  const PhonePreview = () => (
      <div className="sticky top-6 w-[300px] h-[600px] bg-black rounded-[40px] border-4 border-gray-800 shadow-2xl overflow-hidden flex flex-col relative mx-auto select-none ring-4 ring-gray-100">
          {/* Status Bar */}
          <div className="h-7 w-full bg-black/20 backdrop-blur-sm absolute top-0 z-30 flex justify-between px-5 items-center text-white text-[10px] font-bold">
              <span>9:41</span>
              <div className="flex gap-1.5">
                  <Signal size={10} />
                  <Wifi size={10} />
                  <Battery size={10} />
              </div>
          </div>

          {/* Dynamic Content */}
          <div className="flex-1 bg-gray-900 relative overflow-hidden font-english">
              
              {/* REEL PREVIEW */}
              {activeTab === 'reels' && isUploadMode && (
                  <>
                      {reelForm.thumbnail ? (
                          <img src={reelForm.thumbnail} className="w-full h-full object-cover opacity-90" />
                      ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                              <Video size={32} />
                              <span className="text-xs">No Preview</span>
                          </div>
                      )}
                      
                      {/* Reel UI Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-4 pb-12">
                          <div className="flex items-center gap-2 mb-3">
                             <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-white">
                                 {profileForm.avatar_url && <img src={profileForm.avatar_url} className="w-full h-full object-cover" />}
                             </div>
                             <span className="text-white text-xs font-bold shadow-black drop-shadow-md">digigram_store</span>
                             <button className="text-[10px] border border-white/50 text-white px-2 py-0.5 rounded-md backdrop-blur-sm">Follow</button>
                          </div>
                          
                          <p className="text-white text-[13px] leading-5 line-clamp-2 mb-3 drop-shadow-md font-persian w-[85%]" dir="rtl">
                             {reelForm.caption || 'کپشن ویدیو اینجا نمایش داده می‌شود...'}
                          </p>
                          
                          {/* Rolling Text / Audio */}
                          <div className="flex items-center gap-2 mb-2">
                             <div className="flex gap-1 items-end h-3">
                                 <div className="w-0.5 h-2 bg-white animate-pulse"></div>
                                 <div className="w-0.5 h-3 bg-white animate-pulse delay-75"></div>
                                 <div className="w-0.5 h-1 bg-white animate-pulse delay-150"></div>
                             </div>
                             <span className="text-[11px] text-white/90">Original Audio • Trending</span>
                          </div>

                          {linkedProducts.length > 0 && (
                              <div className="bg-black/60 backdrop-blur-md border border-white/20 p-1.5 rounded-full flex items-center gap-2 w-max mt-1 animate-pulse">
                                  <img src={linkedProducts[0].main_image_url || linkedProducts[0].image} className="w-6 h-6 rounded-full bg-white" />
                                  <div className="flex flex-col px-1">
                                    <span className="text-[10px] text-white font-bold font-persian line-clamp-1 max-w-[100px]">{linkedProducts[0].title}</span>
                                    <span className="text-[8px] text-gray-300 font-persian">{toPersianDigits(linkedProducts[0].price?.toLocaleString())} ت</span>
                                  </div>
                                  <div className="bg-[#ef4056] text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">View</div>
                              </div>
                          )}

                          {/* Right Sidebar */}
                          <div className="absolute right-3 bottom-24 flex flex-col gap-5 text-white items-center">
                              <div className="flex flex-col items-center gap-1"><Heart size={24} strokeWidth={1.5} /> <span className="text-[10px]">1.2k</span></div>
                              <div className="flex flex-col items-center gap-1"><div className="bg-white/10 p-1.5 rounded-full backdrop-blur-sm"><MoreHorizontal size={20} /></div></div>
                              <div className="w-8 h-8 border-2 border-white rounded-md overflow-hidden bg-gray-800"><img src={reelForm.thumbnail || "https://via.placeholder.com/50"} className="w-full h-full object-cover" /></div>
                          </div>
                      </div>
                  </>
              )}

              {/* STORY PREVIEW */}
              {activeTab === 'stories' && (
                  <>
                    {storyForm.image_url ? (
                        <img src={storyForm.image_url} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center text-white/50 font-bold gap-2">
                            <ImageIcon size={32} />
                            <span className="text-xs">Upload Background</span>
                        </div>
                    )}
                    
                    {/* Story Header */}
                    <div className="absolute top-4 left-2 right-2 flex gap-1 z-20">
                        <div className="h-0.5 bg-white/50 flex-1 rounded-full overflow-hidden">
                            <div className="w-1/3 h-full bg-white"></div>
                        </div>
                    </div>
                    <div className="absolute top-8 left-4 flex items-center gap-2 z-20">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur p-[1px]">
                             {profileForm.avatar_url && <img src={profileForm.avatar_url} className="w-full h-full rounded-full object-cover" />}
                        </div>
                        <span className="text-white text-xs font-bold drop-shadow-md">Your Story</span>
                        <span className="text-white/70 text-[10px] font-bold">2h</span>
                    </div>

                    {/* TEXT OVERLAY */}
                    {storyForm.story_text && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-10 px-4">
                            <span 
                                className="text-2xl font-black text-white font-persian drop-shadow-xl"
                                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                            >
                                {storyForm.story_text}
                            </span>
                        </div>
                    )}

                    {/* PRODUCT STICKER (Positionable) */}
                    {linkedStoryProduct && (
                        <div 
                            className={`absolute left-1/2 -translate-x-1/2 transition-all duration-300 z-20
                                ${storyForm.sticker_pos === 'top' ? 'top-32' : 
                                  storyForm.sticker_pos === 'center' ? 'top-1/2 translate-y-8' : 
                                  'bottom-24'}
                            `}
                        >
                            <div className="bg-white text-black px-3 py-2 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.2)] flex items-center gap-3 transform -rotate-3 hover:scale-105 transition-transform max-w-[200px]">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                    <img src={linkedStoryProduct.main_image_url || linkedStoryProduct.image} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">TAP TO SHOP</span>
                                    <span className="text-xs font-bold font-persian truncate w-full">{linkedStoryProduct.title}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Story Footer */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 z-20">
                        <div className="flex-1 h-10 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm px-4 flex items-center text-white/70 text-sm">Send message...</div>
                        <Heart size={24} className="text-white" />
                        <MoreHorizontal size={24} className="text-white" />
                    </div>
                  </>
              )}

              {/* PROFILE PREVIEW */}
              {activeTab === 'profile' && (
                  <div className="w-full h-full bg-white text-black overflow-y-auto pt-8">
                       <div className="px-4 pb-4 border-b border-gray-100">
                           <div className="flex justify-between items-center mb-4">
                               <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600">
                                   <div className="w-full h-full bg-white rounded-full p-[2px]">
                                       <img src={profileForm.avatar_url || 'https://via.placeholder.com/150'} className="w-full h-full rounded-full object-cover" />
                                   </div>
                               </div>
                               <div className="flex gap-4 text-center">
                                   <div><span className="font-bold block text-sm">1,240</span><span className="text-[10px]">Posts</span></div>
                                   <div><span className="font-bold block text-sm">12.5K</span><span className="text-[10px]">Followers</span></div>
                                   <div><span className="font-bold block text-sm">150</span><span className="text-[10px]">Following</span></div>
                               </div>
                           </div>
                           <div className="font-persian" dir="rtl">
                               <h1 className="font-bold text-sm">{profileForm.name}</h1>
                               <p className="text-xs text-gray-500 mb-1">{profileForm.category}</p>
                               <p className="text-xs whitespace-pre-line leading-4 mb-2">{profileForm.bio || 'بیوگرافی فروشگاه...'}</p>
                               <a className="text-xs text-blue-900 font-bold">{profileForm.shop_link || 'digigram.store'}</a>
                           </div>
                           
                           <div className="flex gap-2 mt-4">
                               <button className="flex-1 bg-gray-100 py-1.5 rounded-lg text-xs font-bold">Edit Profile</button>
                               <button className="flex-1 bg-gray-100 py-1.5 rounded-lg text-xs font-bold">Share</button>
                           </div>
                       </div>
                       <div className="grid grid-cols-3 gap-0.5">
                           {[1,2,3,4,5,6,7,8,9].map(i => (
                               <div key={i} className="aspect-square bg-gray-100 border border-white"></div>
                           ))}
                       </div>
                  </div>
              )}

          </div>
          
          {/* Home Indicator */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/50 rounded-full z-20"></div>
      </div>
  );

  return (
    <div className="h-full flex flex-col font-persian">
      <div className="flex items-center justify-between mb-4">
        <div>
            <h1 className="text-2xl font-black text-gray-800">استودیو محتوا</h1>
            <p className="text-gray-500 text-sm mt-1">مدیریت فید، استوری و پروفایل</p>
        </div>
        <Link to="/admin/crawler" className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm text-sm">
             <Download size={18} className="text-[#ef394e]" />
             خزنده اینستاگرام
        </Link>
      </div>

      {/* TABS */}
      <div className="bg-white p-1 rounded-xl border border-gray-200 flex mb-6 w-fit shadow-sm">
          {[
              { id: 'reels', icon: Grid, label: 'پست و ریلز' },
              { id: 'stories', icon: Layers, label: 'استوری' },
              { id: 'profile', icon: User, label: 'پروفایل' },
          ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setIsUploadMode(false); }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                  <tab.icon size={16} /> {tab.label}
              </button>
          ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT COLUMN: EDITOR / GRID */}
          <div className="flex-1 w-full space-y-6">
              
              {/* --- REELS VIEW --- */}
              {activeTab === 'reels' && (
                  <>
                    {!isUploadMode ? (
                        <>
                           <button onClick={() => setIsUploadMode(true)} className="w-full py-8 border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center text-gray-400 hover:border-[#ef394e] hover:text-[#ef394e] hover:bg-red-50 transition-all gap-3 bg-white group shadow-sm">
                                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                                    <Plus size={28} />
                                </div>
                                <span className="font-bold text-sm">آپلود ریلز جدید</span>
                           </button>

                           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {reels.map(reel => (
                                    <div key={reel.id} className="relative aspect-[9/16] bg-black rounded-2xl overflow-hidden group shadow-md border border-gray-100">
                                        <img src={reel.thumbnail} className="w-full h-full object-cover opacity-90" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                            <p className="text-white text-xs line-clamp-2 mb-2">{reel.caption}</p>
                                            <div className="flex justify-between items-center text-white/80">
                                                <span className="text-[10px] flex items-center gap-1"><Heart size={10} /> {toPersianDigits(reel.likes)}</span>
                                                <button className="text-red-400 hover:text-red-500"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                           </div>
                        </>
                    ) : (
                        <form onSubmit={handleSaveReel} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                            
                            {/* Visual Uploader */}
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2">
                                   <Video size={18} className="text-blue-500" /> 
                                   فایل‌های مدیا
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative border-2 border-dashed border-gray-200 rounded-2xl h-32 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
                                        <UploadCloud size={24} className="mb-2 group-hover:text-blue-500" />
                                        <span className="text-xs font-bold">ویدیو (MP4)</span>
                                        <input type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFilePreview(e, 'video')} />
                                        {reelForm.video_url && <div className="absolute top-2 right-2 bg-green-500 w-2 h-2 rounded-full"></div>}
                                    </div>
                                    <div className="relative border-2 border-dashed border-gray-200 rounded-2xl h-32 flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer group">
                                        <ImageIcon size={24} className="mb-2 group-hover:text-purple-500" />
                                        <span className="text-xs font-bold">کاور (Thumbnail)</span>
                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFilePreview(e, 'thumb')} />
                                        {reelForm.thumbnail && <div className="absolute top-2 right-2 bg-green-500 w-2 h-2 rounded-full"></div>}
                                    </div>
                                </div>
                                {/* Fallback Text Inputs */}
                                <div className="mt-4 space-y-2">
                                    <input type="text" dir="ltr" className="w-full text-xs bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5 focus:border-blue-500 outline-none" value={reelForm.video_url} onChange={e => setReelForm({...reelForm, video_url: e.target.value})} placeholder="یا لینک مستقیم ویدیو..." />
                                </div>
                            </div>

                            {/* Caption & AI */}
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#ef394e]"></div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                        <Sparkles size={18} className="text-[#ef394e]" />
                                        کپشن و هشتگ
                                    </h3>
                                    <div className="flex gap-2">
                                        <button 
                                            type="button" 
                                            onClick={generateCaption}
                                            disabled={isGeneratingAI}
                                            className="text-[10px] bg-purple-50 text-purple-600 border border-purple-100 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 hover:bg-purple-100 transition-all"
                                        >
                                            {isGeneratingAI ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                                            تولید متن
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={generateHashtags}
                                            disabled={isGeneratingAI || !reelForm.caption}
                                            className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 hover:bg-blue-100 transition-all"
                                        >
                                            <Hash size={10} />
                                            هشتگ‌ساز
                                        </button>
                                    </div>
                                </div>
                                <textarea 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm h-32 resize-none focus:border-[#ef394e] outline-none leading-6"
                                    placeholder="کپشن را اینجا بنویسید..."
                                    value={reelForm.caption}
                                    onChange={e => setReelForm({...reelForm, caption: e.target.value})}
                                />
                            </div>

                            {/* Product Tagging */}
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative z-10">
                                <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                                    <Search size={18} className="text-gray-400" />
                                    تگ کردن محصول
                                </h3>
                                <div className="relative mb-3">
                                     <input type="text" placeholder="جستجوی محصول..." value={productSearch} onChange={e => handleSearchProducts(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#ef394e] outline-none" />
                                     {searchResults.length > 0 && (
                                         <div className="absolute top-full left-0 right-0 bg-white shadow-xl rounded-xl mt-2 p-2 max-h-48 overflow-y-auto border border-gray-100 z-50">
                                             {searchResults.map(p => (
                                                 <div key={p.id} onClick={() => addProductLink(p, 'reel')} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                                     <img src={p.main_image_url} className="w-8 h-8 rounded-md bg-gray-100" />
                                                     <span className="text-xs font-bold line-clamp-1 flex-1">{p.title}</span>
                                                     <Plus size={14} className="text-blue-500" />
                                                 </div>
                                             ))}
                                         </div>
                                     )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {linkedProducts.map(p => (
                                        <div key={p.id} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border border-blue-100">
                                            {p.title}
                                            <button type="button" onClick={() => setLinkedProducts(prev => prev.filter(lp => lp.id !== p.id))}><X size={12} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Schedule Toggle */}
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setReelForm({...reelForm, is_scheduled: !reelForm.is_scheduled})}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${reelForm.is_scheduled ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <span className="font-bold text-sm text-gray-800 block">زمان‌بندی انتشار</span>
                                        <span className="text-[10px] text-gray-400">{reelForm.is_scheduled ? 'پست در زمان تعیین شده منتشر می‌شود' : 'انتشار بلافاصله پس از تایید'}</span>
                                    </div>
                                </div>
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${reelForm.is_scheduled ? 'bg-orange-500' : 'bg-gray-300'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${reelForm.is_scheduled ? 'translate-x-[-16px]' : 'translate-x-0'}`}></div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsUploadMode(false)} className="flex-1 py-3.5 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50">انصراف</button>
                                <button type="submit" disabled={loading} className="flex-[2] bg-[#ef394e] text-white rounded-xl font-bold shadow-xl shadow-red-200 hover:bg-[#d63044] transition-all">
                                    {reelForm.is_scheduled ? 'زمان‌بندی ریلز' : 'انتشار ریلز'}
                                </button>
                            </div>
                        </form>
                    )}
                  </>
              )}
          </div>

          {/* RIGHT COLUMN: PREVIEW */}
          <div className="hidden lg:block w-[340px] shrink-0">
               <div className="sticky top-6">
                   <div className="text-center mb-4">
                       <h3 className="font-bold text-gray-400 text-sm flex items-center justify-center gap-2">
                           <Smartphone size={16} /> پیش‌نمایش زنده
                       </h3>
                   </div>
                   <PhonePreview />
                   
                   {/* Helper Tip */}
                   <div className="mt-4 bg-blue-50 p-3 rounded-xl flex gap-3 items-start border border-blue-100">
                        <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-blue-700 leading-4">
                            تغییرات شما به صورت آنی در پیش‌نمایش موبایل اعمال می‌شود. این همان چیزی است که کاربران خواهند دید.
                        </p>
                   </div>
               </div>
          </div>

      </div>
    </div>
  );
};

export default SocialManager;
