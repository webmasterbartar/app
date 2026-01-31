
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Check, X, MessageSquare, AlertCircle } from 'lucide-react';
import { toPersianDigits } from '../../utils/persianUtils';

const CommentManager: React.FC = () => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    try {
        const data = await api.comments.getPending();
        if(data) setComments(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleApprove = async (id: number) => {
      await api.comments.approve(id);
      setComments(prev => prev.filter(c => c.id !== id));
  };

  const handleDelete = async (id: number) => {
      if(!confirm('حذف شود؟')) return;
      await api.comments.delete(id);
      setComments(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="font-persian">
        <h1 className="text-2xl font-black text-gray-800 mb-6">مدیریت نظرات</h1>
        
        {loading ? <p>در حال بارگذاری...</p> : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-gray-100 text-gray-400">
                <Check size={48} className="mb-2 text-green-500 bg-green-50 p-2 rounded-full" />
                <p className="font-bold">همه نظرات بررسی شده‌اند!</p>
            </div>
        ) : (
            <div className="grid gap-4">
                {comments.map(comment => (
                    <div key={comment.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-sm text-gray-800">{comment.user_name || 'کاربر مهمان'}</span>
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                                    {comment.target_type === 'product' ? 'محصول' : 'ریلز'}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm leading-6">{comment.content}</p>
                            <span className="text-[10px] text-gray-400 mt-2 block">{new Date(comment.created_at).toLocaleString('fa-IR')}</span>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <button onClick={() => handleApprove(comment.id)} className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-green-50 text-green-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors">
                                <Check size={16} /> تایید
                            </button>
                            <button onClick={() => handleDelete(comment.id)} className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">
                                <X size={16} /> حذف
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default CommentManager;
