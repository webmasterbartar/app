
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Layers, Search, Save, X, Check, Palette, Sparkles, LayoutGrid, Smartphone, MoreHorizontal } from 'lucide-react';
import { toPersianDigits } from '../../utils/persianUtils';

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  slug: string;
  products_count?: number; // Optional count for display
}

const COLORS = [
  { id: 'blue', label: 'آبی', bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
  { id: 'red', label: 'قرمز', bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
  { id: 'green', label: 'سبز', bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
  { id: 'yellow', label: 'زرد', bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' },
  { id: 'purple', label: 'بنفش', bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
  { id: 'orange', label: 'نارنجی', bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
  { id: 'teal', label: 'فیروزه‌ای', bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-200' },
  { id: 'gray', label: 'طوسی', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
];

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    icon: '📦',
    color: 'bg-blue-100 text-blue-600',
    slug: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if(!searchQuery) {
        setFilteredCategories(categories);
    } else {
        setFilteredCategories(categories.filter(c => c.name.includes(searchQuery) || c.slug.includes(searchQuery)));
    }
  }, [searchQuery, categories]);

  const fetchCategories = async () => {
    setLoading(true);
    // In a real app, you might join with products to get count
    const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true });
    if (!error && data) {
        setCategories(data);
        setFilteredCategories(data);
    }
    setLoading(false);
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setFormData(category);
    } else {
      setEditingId(null);
      setFormData({ name: '', icon: '⚡', color: 'bg-blue-100 text-blue-600', slug: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await supabase.from('categories').update(formData).eq('id', editingId);
      } else {
        await supabase.from('categories').insert(formData);
      }
      await fetchCategories();
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('خطا در ذخیره اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) return;
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
  };

  const handleColorSelect = (colorDef: typeof COLORS[0]) => {
      setFormData({ ...formData, color: `${colorDef.bg} ${colorDef.text}` });
  };

  // Helper to parse color string to find selected object
  const getSelectedColorId = () => {
      const current = COLORS.find(c => formData.color === `${c.bg} ${c.text}`);
      return current ? current.id : 'blue';
  };

  return (
    <div className="space-y-6 font-persian">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
               <Layers className="text-[#ef394e]" />
               مدیریت دسته‌بندی‌ها
           </h1>
           <p className="text-sm text-gray-500 mt-1">ساختار فروشگاه و ناوبری اپلیکیشن</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                 <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <input 
                    type="text" 
                    placeholder="جستجو..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#ef394e]"
                 />
             </div>
            <button onClick={() => handleOpenModal()} className="bg-[#ef394e] text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-red-200 hover:bg-[#d63044] transition-colors text-sm whitespace-nowrap">
            <Plus size={20} /> دسته جدید
            </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
          <div className="text-center py-20 text-gray-400">در حال دریافت اطلاعات...</div>
      ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Layers size={32} className="text-gray-300" />
              </div>
              <p className="font-bold text-gray-500">دسته بندی یافت نشد</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCategories.map((cat) => (
            <div key={cat.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-all relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${cat.color}`}>
                        {cat.icon}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(cat)} className="p-2 bg-gray-50 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(cat.id)} className="p-2 bg-gray-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                </div>
                
                <div>
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{cat.name}</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md font-mono border border-gray-100">/{cat.slug}</span>
                        <span className="text-[10px] font-bold text-gray-400">{toPersianDigits(Math.floor(Math.random() * 50) + 5)} کالا</span>
                    </div>
                </div>

                {/* Decorative BG Blob */}
                <div className={`absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10 blur-xl pointer-events-none ${cat.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>
            </div>
            ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
              
              {/* Left: Form */}
              <div className="flex-1 p-8">
                 <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                         {editingId ? <Edit2 size={18} /> : <Sparkles size={18} className="text-yellow-500" />}
                         {editingId ? 'ویرایش دسته‌بندی' : 'ساخت دسته‌بندی'}
                     </h3>
                 </div>
                 
                 <form onSubmit={handleSave} className="space-y-5">
                     <div className="flex gap-4">
                         <div className="w-20">
                            <label className="block text-xs font-bold text-gray-500 mb-2">آیکون</label>
                            <input 
                              type="text" 
                              value={formData.icon}
                              onChange={(e) => setFormData({...formData, icon: e.target.value})}
                              className="w-full h-[50px] border border-gray-200 rounded-2xl text-center text-2xl focus:outline-none focus:border-[#ef394e] focus:bg-gray-50 transition-colors"
                              placeholder="📦"
                            />
                         </div>
                         <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 mb-2">نام دسته‌بندی</label>
                            <input 
                              type="text" 
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="w-full h-[50px] border border-gray-200 rounded-2xl px-4 text-sm focus:outline-none focus:border-[#ef394e] focus:bg-gray-50 transition-colors"
                              placeholder="مثلا: کالای دیجیتال"
                            />
                         </div>
                     </div>
                     
                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">لینک (Slug)</label>
                        <input 
                          type="text" 
                          required
                          dir="ltr"
                          value={formData.slug}
                          onChange={(e) => setFormData({...formData, slug: e.target.value})}
                          className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#ef394e] text-right font-mono text-gray-600 bg-gray-50"
                          placeholder="digital-goods"
                        />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-3 flex items-center gap-2">
                            <Palette size={14} /> رنگ‌بندی
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map(c => {
                                const isSelected = getSelectedColorId() === c.id;
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => handleColorSelect(c)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${c.bg} ${isSelected ? `ring-2 ring-offset-2 ring-gray-300 scale-110` : 'hover:scale-105'}`}
                                    >
                                        {isSelected && <Check size={14} className={c.text} strokeWidth={3} />}
                                    </button>
                                );
                            })}
                        </div>
                     </div>

                     <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50">انصراف</button>
                        <button type="submit" disabled={loading} className="flex-[2] bg-[#ef394e] text-white py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-red-200 hover:bg-[#d63044] transition-all transform active:scale-95">
                           {loading ? 'در حال پردازش...' : 'ذخیره نهایی'}
                        </button>
                     </div>
                 </form>
              </div>

              {/* Right: Live Preview */}
              <div className="hidden md:flex w-72 bg-gray-50 border-r border-gray-100 flex-col items-center justify-center p-6 relative overflow-hidden">
                  <div className="absolute top-6 text-xs font-bold text-gray-400 flex items-center gap-1 uppercase tracking-widest">
                      <Smartphone size={14} /> Live Preview
                  </div>
                  
                  {/* Preview 1: The Category Pill */}
                  <div className="w-full mb-8">
                      <p className="text-[10px] text-gray-400 mb-2 text-center">حالت لیست افقی (صفحه اصلی)</p>
                      <div className="flex justify-center">
                          <div className={`flex flex-col items-center gap-2 transition-all duration-300 transform hover:scale-105 cursor-pointer`}>
                                <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center shadow-sm text-2xl border-2 border-white ${formData.color || 'bg-gray-100'}`}>
                                    {formData.icon || '📦'}
                                </div>
                                <span className="text-xs font-bold text-gray-700">{formData.name || 'نام دسته'}</span>
                           </div>
                      </div>
                  </div>

                  {/* Preview 2: The Category Card */}
                  <div className="w-full">
                      <p className="text-[10px] text-gray-400 mb-2 text-center">حالت کارت شبکه (صفحه دسته‌ها)</p>
                      <div className={`p-4 rounded-3xl flex flex-col justify-between aspect-square w-full shadow-sm bg-white border-2 border-dashed ${getSelectedColorId() === 'blue' ? 'border-blue-200' : 'border-gray-200'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm text-lg ${formData.color || 'bg-gray-100'}`}>
                                {formData.icon || '📦'}
                            </div>
                            <div>
                                <h3 className="font-bold text-md text-gray-800 leading-tight mb-1">{formData.name || 'نام دسته'}</h3>
                                <span className="text-[10px] opacity-70 font-medium">120 کالا</span>
                            </div>
                      </div>
                  </div>

                  {/* Decorative */}
                  <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-tr from-gray-200 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none"></div>
              </div>

           </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
