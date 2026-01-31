
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Play, Link as LinkIcon, Trash2, Search, Check, Video, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { toPersianDigits } from '../../utils/persianUtils';

interface Product {
  id: number;
  title: string;
  image: string;
  price: number;
}

interface Reel {
  id: number;
  video_url: string;
  thumbnail: string;
  caption: string;
  likes: number;
  product_ids: number[]; // Array of product IDs
}

const ReelsManager: React.FC = () => {
  const [view, setView] = useState<'grid' | 'upload'>('grid');
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Upload State
  const [formData, setFormData] = useState({
     video_url: '',
     thumbnail: '',
     caption: '',
     product_ids: [] as number[]
  });
  
  // Product Search State
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [linkedProducts, setLinkedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('posts').select('*').order('id', { ascending: false });
    if (!error && data) setReels(data);
    setLoading(false);
  };

  const handleSearchProducts = async (query: string) => {
      setProductSearch(query);
      if (query.length < 2) {
          setSearchResults([]);
          return;
      }
      const { data } = await supabase.from('products').select('id, title, main_image_url, base_price').ilike('title', `%${query}%`).limit(5);
      if (data) setSearchResults(data as any);
  };

  const addProductLink = (product: Product) => {
      if (!linkedProducts.find(p => p.id === product.id)) {
          setLinkedProducts([...linkedProducts, product]);
          setFormData(prev => ({ ...prev, product_ids: [...prev.product_ids, product.id] }));
      }
      setProductSearch('');
      setSearchResults([]);
  };

  const removeProductLink = (id: number) => {
      setLinkedProducts(linkedProducts.filter(p => p.id !== id));
      setFormData(prev => ({ ...prev, product_ids: prev.product_ids.filter(pid => pid !== id) }));
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          const payload = {
              video_url: formData.video_url,
              thumbnail: formData.thumbnail,
              caption: formData.caption,
              product_ids: formData.product_ids,
              likes: 0
          };
          
          await supabase.from('posts').insert(payload);
          await fetchReels();
          setView('grid');
          // Reset form
          setFormData({ video_url: '', thumbnail: '', caption: '', product_ids: [] });
          setLinkedProducts([]);
      } catch (err) {
          alert('خطا در بارگذاری ویدیو');
      } finally {
          setLoading(false);
      }
  };

  const handleDelete = async (id: number) => {
      if(!confirm("ویدیو حذف شود؟")) return;
      await supabase.from('posts').delete().eq('id', id);
      fetchReels();
  };

  if (view === 'upload') {
      return (
          <div className="max-w-3xl mx-auto font-persian">
             <div className="flex items-center justify-between mb-6">
                 <h1 className="text-2xl font-black text-gray-800">آپلود ریلز جدید</h1>
                 <button onClick={() => setView('grid')} className="text-gray-500 font-bold text-sm">بازگشت به لیست</button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <form onSubmit={handleSave} className="space-y-4">
                     {/* Video Source */}
                     <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                         <h3 className="font-bold text-gray-800 mb-3 text-sm">۱. منبع ویدیو</h3>
                         <div className="space-y-3">
                             <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">لینک مستقیم ویدیو (MP4)</label>
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                                    <Video size={16} className="text-gray-400" />
                                    <input 
                                        type="text" 
                                        required
                                        dir="ltr"
                                        value={formData.video_url}
                                        onChange={e => setFormData({...formData, video_url: e.target.value})}
                                        className="bg-transparent w-full text-sm outline-none"
                                        placeholder="https://example.com/video.mp4"
                                    />
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">لینک تصویر کاور</label>
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                                    <ImageIcon size={16} className="text-gray-400" />
                                    <input 
                                        type="text" 
                                        required
                                        dir="ltr"
                                        value={formData.thumbnail}
                                        onChange={e => setFormData({...formData, thumbnail: e.target.value})}
                                        className="bg-transparent w-full text-sm outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">کپشن (توضیحات)</label>
                                <textarea 
                                    rows={3}
                                    value={formData.caption}
                                    onChange={e => setFormData({...formData, caption: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#ef394e]"
                                    placeholder="توضیحات جذاب برای ویدیو..."
                                />
                             </div>
                         </div>
                     </div>

                     {/* Product Tagging */}
                     <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative">
                         <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
                            ۲. اتصال محصول
                            <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full">Social Commerce</span>
                         </h3>
                         
                         <div className="relative mb-4">
                             <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
                             <input 
                                type="text"
                                value={productSearch}
                                onChange={e => handleSearchProducts(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="جستجوی نام محصول..."
                             />
                             {/* Search Dropdown */}
                             {searchResults.length > 0 && (
                                 <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 shadow-xl rounded-xl mt-2 z-20 max-h-48 overflow-y-auto">
                                     {searchResults.map(p => (
                                         <div 
                                            key={p.id} 
                                            onClick={() => addProductLink(p as any)}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                                         >
                                             <img src={(p as any).main_image_url} className="w-8 h-8 rounded-lg object-cover" />
                                             <div className="flex-1">
                                                 <p className="text-xs font-bold text-gray-800 line-clamp-1">{p.title}</p>
                                                 <p className="text-[10px] text-gray-500">{toPersianDigits((p as any).base_price)} تومان</p>
                                             </div>
                                             <Plus size={14} className="text-blue-500" />
                                         </div>
                                     ))}
                                 </div>
                             )}
                         </div>

                         {/* Selected Products List */}
                         <div className="space-y-2">
                             {linkedProducts.map(p => (
                                 <div key={p.id} className="flex items-center justify-between bg-blue-50 p-2 rounded-xl border border-blue-100">
                                     <div className="flex items-center gap-2">
                                         <img src={(p as any).main_image_url} className="w-8 h-8 rounded-lg bg-white object-cover" />
                                         <span className="text-xs font-bold text-blue-800 line-clamp-1 max-w-[150px]">{p.title}</span>
                                     </div>
                                     <button type="button" onClick={() => removeProductLink(p.id)} className="p-1 hover:bg-white rounded-full transition-colors">
                                         <X size={14} className="text-red-500" />
                                     </button>
                                 </div>
                             ))}
                             {linkedProducts.length === 0 && (
                                 <div className="text-center py-4 text-gray-400 text-xs border border-dashed border-gray-200 rounded-xl">
                                     هیچ محصولی لینک نشده است
                                 </div>
                             )}
                         </div>
                     </div>

                     <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#ef394e] text-white font-bold py-3 rounded-xl shadow-lg shadow-red-200 hover:bg-[#d63044] transition-colors flex items-center justify-center gap-2"
                     >
                        {loading ? <Loader2 className="animate-spin" /> : <Check />}
                        انتشار ریلز
                     </button>
                 </form>

                 {/* Live Preview Card */}
                 <div className="flex justify-center">
                     <div className="w-[280px] aspect-[9/16] bg-black rounded-[2rem] overflow-hidden relative shadow-2xl border-4 border-gray-800">
                         {formData.thumbnail ? (
                             <img src={formData.thumbnail} className="w-full h-full object-cover opacity-80" />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">پیش‌نمایش</div>
                         )}
                         
                         {/* Mock UI Overlay */}
                         <div className="absolute bottom-4 left-4 right-4 z-10">
                             <div className="flex items-center gap-2 mb-2">
                                 <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                                 <div className="h-2 w-20 bg-gray-200/50 rounded"></div>
                             </div>
                             <div className="h-2 w-full bg-gray-200/50 rounded mb-1"></div>
                             <div className="h-2 w-2/3 bg-gray-200/50 rounded mb-4"></div>
                             
                             {/* Product Pill Preview */}
                             {linkedProducts.length > 0 && (
                                 <div className="bg-black/60 backdrop-blur-md border border-white/20 p-1.5 rounded-full flex items-center gap-2">
                                     <img src={(linkedProducts[0] as any).main_image_url} className="w-6 h-6 rounded-full bg-white" />
                                     <div className="flex-1 min-w-0">
                                         <div className="h-1.5 w-16 bg-white rounded mb-0.5"></div>
                                         <div className="h-1.5 w-10 bg-white/70 rounded"></div>
                                     </div>
                                     <div className="w-5 h-5 bg-[#ef4056] rounded-full flex items-center justify-center text-[8px] text-white">
                                         {linkedProducts.length}
                                     </div>
                                 </div>
                             )}
                         </div>
                     </div>
                 </div>
             </div>
          </div>
      );
  }

  return (
    <div className="space-y-6 font-persian">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-black text-gray-800">مدیریت ریلزها</h1>
           <p className="text-sm text-gray-500 mt-1">ویدیوهای تعاملی و متصل به محصول</p>
        </div>
        <button onClick={() => setView('upload')} className="bg-[#ef394e] text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-red-200 hover:bg-[#d63044] transition-colors text-sm">
          <Plus size={20} /> افزودن ویدیو
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {reels.map(reel => (
              <div key={reel.id} className="relative group aspect-[9/16] bg-gray-900 rounded-2xl overflow-hidden shadow-sm">
                  <img src={reel.thumbnail} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                      <p className="text-white text-xs font-medium line-clamp-2 mb-2">{reel.caption}</p>
                      
                      {/* Product Badges */}
                      {reel.product_ids && reel.product_ids.length > 0 && (
                          <div className="flex items-center gap-1.5 mb-3">
                              <LinkIcon size={12} className="text-[#ef4056]" />
                              <span className="text-[10px] text-gray-300 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                                  {toPersianDigits(reel.product_ids.length)} محصول
                              </span>
                          </div>
                      )}

                      <div className="flex items-center justify-between border-t border-white/10 pt-2">
                         <span className="text-[10px] text-gray-400">{toPersianDigits(reel.likes)} لایک</span>
                         <button onClick={() => handleDelete(reel.id)} className="p-1.5 bg-white/10 hover:bg-red-500 hover:text-white rounded-full transition-colors text-gray-300">
                             <Trash2 size={14} />
                         </button>
                      </div>
                  </div>
                  
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur rounded-full p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={16} fill="currentColor" />
                  </div>
              </div>
          ))}
          
          {/* Add New Placeholder */}
          <button onClick={() => setView('upload')} className="aspect-[9/16] border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-[#ef4056] hover:text-[#ef4056] hover:bg-red-50 transition-all gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-white">
                  <Plus size={24} />
              </div>
              <span className="text-xs font-bold">ویدیوی جدید</span>
          </button>
      </div>
    </div>
  );
};

export default ReelsManager;
