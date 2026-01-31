
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Package, Clock, CheckCircle, XCircle, Search, Truck, Eye, Smartphone } from 'lucide-react';
import { toPersianDigits } from '../../utils/persianUtils';

interface Order {
  id: number;
  total_price: number;
  status: 'pending' | 'shipped' | 'cancelled';
  created_at: string;
  items: any; // JSONB
  user_id: string;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'shipped'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.orders.getAll();
      if (data) setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: 'shipped' | 'cancelled') => {
      if(!confirm(`آیا از تغییر وضعیت سفارش به ${status === 'shipped' ? 'ارسال شده' : 'لغو شده'} اطمینان دارید؟`)) return;
      
      try {
          await api.orders.updateStatus(id, status);
          // Optimistic update
          setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
          alert("وضعیت بروزرسانی شد و پیامک برای مشتری ارسال گردید.");
      } catch (e) {
          alert("خطا در بروزرسانی");
      }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6 font-persian">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
             <h1 className="text-2xl font-black text-gray-800">مدیریت سفارشات</h1>
             <p className="text-gray-500 text-sm mt-1">بررسی و پردازش سفارش‌های مشتریان</p>
         </div>
         
         <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
             <button onClick={() => setFilter('all')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${filter === 'all' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>همه</button>
             <button onClick={() => setFilter('pending')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${filter === 'pending' ? 'bg-[#ef394e] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>در انتظار</button>
             <button onClick={() => setFilter('shipped')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${filter === 'shipped' ? 'bg-green-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>ارسال شده</button>
         </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col justify-center items-center text-center">
              <span className="text-2xl font-black text-blue-600">{toPersianDigits(orders.length)}</span>
              <span className="text-xs text-blue-400 font-bold mt-1">کل سفارشات</span>
          </div>
          <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex flex-col justify-center items-center text-center">
              <span className="text-2xl font-black text-yellow-600">{toPersianDigits(orders.filter(o => o.status === 'pending').length)}</span>
              <span className="text-xs text-yellow-400 font-bold mt-1">در انتظار پردازش</span>
          </div>
          <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex flex-col justify-center items-center text-center">
              <span className="text-2xl font-black text-green-600">{toPersianDigits(orders.filter(o => o.status === 'shipped').length)}</span>
              <span className="text-xs text-green-400 font-bold mt-1">ارسال شده</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-center items-center text-center">
              <span className="text-2xl font-black text-gray-600">{toPersianDigits(orders.filter(o => o.status === 'cancelled').length)}</span>
              <span className="text-xs text-gray-400 font-bold mt-1">لغو شده</span>
          </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-right">
                  <thead className="bg-gray-50 text-gray-500 text-xs font-bold border-b border-gray-100">
                      <tr>
                          <th className="p-4">شناسه</th>
                          <th className="p-4">تاریخ</th>
                          <th className="p-4">مشتری</th>
                          <th className="p-4">مبلغ (تومان)</th>
                          <th className="p-4">وضعیت</th>
                          <th className="p-4">عملیات</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {loading ? (
                          <tr><td colSpan={6} className="p-8 text-center text-gray-500">در حال دریافت اطلاعات...</td></tr>
                      ) : filteredOrders.map(order => (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                              <td className="p-4 text-sm font-bold text-gray-700">#{toPersianDigits(order.id)}</td>
                              <td className="p-4 text-xs text-gray-500">
                                  {new Date(order.created_at).toLocaleDateString('fa-IR')}
                              </td>
                              <td className="p-4 text-sm text-gray-700">کاربر مهمان</td>
                              <td className="p-4 text-sm font-bold text-gray-800">{toPersianDigits(order.total_price.toLocaleString())}</td>
                              <td className="p-4">
                                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                                      order.status === 'shipped' ? 'bg-green-50 text-green-600 border-green-100' :
                                      order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                                      'bg-yellow-50 text-yellow-600 border-yellow-100'
                                  }`}>
                                      {order.status === 'shipped' ? 'ارسال شده' : order.status === 'cancelled' ? 'لغو شده' : 'در انتظار'}
                                  </span>
                              </td>
                              <td className="p-4 flex gap-2">
                                  <button 
                                    onClick={() => setSelectedOrder(order)}
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="مشاهده جزئیات"
                                  >
                                      <Eye size={16} />
                                  </button>
                                  {order.status === 'pending' && (
                                      <>
                                          <button onClick={() => handleStatusUpdate(order.id, 'shipped')} className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="ارسال سفارش">
                                              <Truck size={16} />
                                          </button>
                                          <button onClick={() => handleStatusUpdate(order.id, 'cancelled')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="لغو سفارش">
                                              <XCircle size={16} />
                                          </button>
                                      </>
                                  )}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
              <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div>
                        <h3 className="font-bold text-gray-800">جزئیات سفارش #{toPersianDigits(selectedOrder.id)}</h3>
                        <p className="text-xs text-gray-500 mt-1">{new Date(selectedOrder.created_at).toLocaleString('fa-IR')}</p>
                      </div>
                      <button onClick={() => setSelectedOrder(null)}><XCircle size={24} className="text-gray-400" /></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
                          <Smartphone className="text-blue-500" size={20} />
                          <div>
                              <p className="text-xs font-bold text-blue-700">اطلاعات تماس</p>
                              <p className="text-sm text-gray-700 mt-0.5">۰۹۱۲۳۴۵۶۷۸۹ (کاربر مهمان)</p>
                          </div>
                      </div>
                      
                      <div>
                          <p className="text-sm font-bold text-gray-700 mb-2">اقلام سفارش</p>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                              {/* Assuming items is stored as simplified JSON for this demo */}
                              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                  <span className="text-sm text-gray-600">محصولات (JSON Data)</span>
                                  <span className="font-bold text-gray-800 text-sm">x1</span>
                              </div>
                          </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <span className="font-bold text-gray-600">مبلغ قابل پرداخت</span>
                          <span className="font-black text-xl text-[#ef394e]">{toPersianDigits(selectedOrder.total_price.toLocaleString())} تومان</span>
                      </div>
                  </div>
                  <div className="p-4 bg-gray-50 flex gap-3">
                      <button onClick={() => setSelectedOrder(null)} className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-600">بستن</button>
                      <button className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold">چاپ فاکتور</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default OrderManagement;
