
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Plus, Edit2, Trash2, Search, Save, X, Image as ImageIcon, BookOpen, Loader2 } from 'lucide-react';
import { toPersianDigits } from '../../utils/persianUtils';

const BlogManager: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [formData, setFormData] = useState({
      id: 0,
      title: '',
      excerpt: '',
      content: '',
      cover_image: '',
      author: 'Admin',
      category: 'عمومی',
      read_time: 5
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
      setLoading(true);
      const data = await api.blogs.getAll();
      if(data) setBlogs(data);
      setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          if(formData.id) {
              await api.blogs.update(formData.id, formData);
          } else {
              const { id, ...data } = formData;
              await api.blogs.create(data);
          }
          await fetchBlogs();
          setView('list');
          resetForm();
      } catch (e) {
          alert('خطا در ذخیره');
      } finally {
          setLoading(false);
      }
  };

  const handleDelete = async (id: number) => {
      if(!confirm('حذف شود؟')) return;
      await api.blogs.delete(id);
      fetchBlogs();
  };

  const handleEdit = (blog: any) => {
      setFormData(blog);
      setView('form');
  };

  const resetForm = () => {
      setFormData({
        id: 0, title: '', excerpt: '', content: '', cover_image: '', author: 'Admin', category: 'عمومی', read_time: 5
      });
  };

  const handleCreate = () => {
      resetForm();
      setView('form');
  }

  if (view === 'form') {
      return (
          <div className="max-w-2xl mx-auto font-persian">
              <div className="flex justify-between items-center mb-6">
                  <h1 className="text-xl font-black text-gray-800">
                      {formData.id ? 'ویرایش مقاله' : 'نوشتن مقاله جدید'}
                  </h1>
                  <button onClick={() => setView('list')} className="text-sm font-bold text-gray-500">بازگشت</button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">عنوان مقاله</label>
                      <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">دسته‌بندی</label>
                          <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none" />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">زمان مطالعه (دقیقه)</label>
                          <input type="number" value={formData.read_time} onChange={e => setFormData({...formData, read_time: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none" />
                      </div>
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">خلاصه (Excerpt)</label>
                      <textarea rows={2} value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none" />
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">تصویر کاور (لینک)</label>
                      <div className="flex gap-2">
                          <input type="text" dir="ltr" value={formData.cover_image} onChange={e => setFormData({...formData, cover_image: e.target.value})} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none" placeholder="https://..." />
                          {formData.cover_image && <img src={formData.cover_image} className="w-12 h-12 rounded-lg object-cover" />}
                      </div>
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">محتوای اصلی</label>
                      <textarea rows={10} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none leading-7" placeholder="متن مقاله را اینجا بنویسید..." />
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-[#ef394e] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-[#d63044] transition-all flex items-center justify-center gap-2">
                      {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                      ذخیره مقاله
                  </button>
              </form>
          </div>
      );
  }

  return (
    <div className="font-persian space-y-6">
       <div className="flex justify-between items-center">
           <div>
               <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                   <BookOpen className="text-[#ef394e]" />
                   مدیریت وبلاگ
               </h1>
           </div>
           <button onClick={handleCreate} className="bg-[#ef394e] text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-red-200 hover:bg-[#d63044] transition-colors text-sm">
               <Plus size={20} /> نوشتن مقاله
           </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {blogs.map(blog => (
               <div key={blog.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col group hover:shadow-md transition-all">
                   <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-3 relative">
                       <img src={blog.cover_image} className="w-full h-full object-cover" />
                       <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold">
                           {blog.category}
                       </div>
                   </div>
                   <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-1">{blog.title}</h3>
                   <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{blog.excerpt}</p>
                   
                   <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                       <span className="text-[10px] text-gray-400">{toPersianDigits(blog.read_time)} دقیقه</span>
                       <div className="flex gap-2">
                           <button onClick={() => handleEdit(blog)} className="text-blue-500 bg-blue-50 p-1.5 rounded-lg"><Edit2 size={14} /></button>
                           <button onClick={() => handleDelete(blog.id)} className="text-red-500 bg-red-50 p-1.5 rounded-lg"><Trash2 size={14} /></button>
                       </div>
                   </div>
               </div>
           ))}
       </div>
    </div>
  );
};

export default BlogManager;
