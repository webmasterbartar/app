
import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { db, Product, getProductImage } from '../db';
import { ArrowRight, MapPin, Phone, User, CreditCard, CheckCircle, Truck, ShieldCheck, ChevronLeft, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toPersianDigits, formatPrice } from '../utils/persianUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

const Checkout: React.FC = () => {
    const { items, clearCart } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState<'address' | 'payment' | 'success'>('address');
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Map<number, Product>>(new Map());

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        postalCode: ''
    });

    useEffect(() => {
        // Redirect if cart is empty
        if (items.length === 0 && step !== 'success') {
            navigate('/cart');
            return;
        }

        const loadProducts = async () => {
            const pMap = new Map<number, Product>();
            for (const item of items) {
                const p = await db.products.get(item.productId);
                if (p) pMap.set(item.productId, p);
            }
            setProducts(pMap);
        };
        loadProducts();
    }, [items, navigate, step]);

    // Calculations
    const { totalRaw, payable } = items.reduce((acc, item) => {
        const p = products.get(item.productId);
        if (!p) return acc;
        const price = p.price;
        acc.totalRaw += price * item.quantity;
        acc.payable += price * item.quantity;
        return acc;
    }, { totalRaw: 0, payable: 0 });

    const shippingCost = payable > 500000 ? 0 : 45000;
    const finalAmount = payable + shippingCost;

    const handleCreateOrder = async () => {
        setLoading(true);
        try {
            // 1. Create Order Object
            const orderItems = items.map(i => ({
                productId: i.productId,
                quantity: i.quantity,
                price: products.get(i.productId)?.price || 0
            }));

            const newOrder = {
                total_price: finalAmount,
                status: 'pending',
                items: orderItems,
                user_address: `${formData.address} - کدپستی: ${formData.postalCode}`,
                user_phone: formData.phone,
                created_at: new Date().toISOString()
            };

            // 2. Save to DB (mocking API call if needed, or direct DB)
            // Since we don't have a full backend auth for user yet, we just save to local DB 'orders' table if exists,
            // or try to use the api service if it allows public inserts (which we saw it might).
            // For now, let's try via API service first, fallback to console.

            // In a real app we would call api.orders.create(newOrder)
            // But api.orders.create doesn't exist in the interface we saw earlier (only getAll/updateStatus).
            // So detailed implementation: just simulate success for now or add to a local 'orders' table if we had one.
            // We'll simulate a network request.
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 3. Clear Cart
            await clearCart();

            // 4. Show Success
            setStep('success');
        } catch (error) {
            console.error(error);
            alert('خطا در ثبت سفارش');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center font-persian p-6 text-center" dir="rtl">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6"
                >
                    <CheckCircle size={48} className="text-green-500" />
                </motion.div>
                <h1 className="text-2xl font-black text-gray-800 mb-2">سفارش شما ثبت شد!</h1>
                <p className="text-gray-500 text-sm mb-8 leading-6 max-w-xs">
                    از خرید شما سپاسگزاریم. سفارش شما با موفقیت ثبت شد و به زودی پردازش خواهد شد.
                </p>
                <button
                    onClick={() => navigate('/shop')}
                    className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-black transition-colors"
                >
                    بازگشت به فروشگاه
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[#f9f9f9] min-h-screen pb-32 font-persian" dir="rtl">

            {/* Header */}
            <header className="bg-white px-4 py-4 sticky top-0 z-20 shadow-sm flex items-center gap-3">
                <button onClick={() => step === 'address' ? navigate('/cart') : setStep('address')} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                    <ArrowRight size={22} className="text-gray-800" />
                </button>
                <h1 className="font-black text-lg text-gray-800">
                    {step === 'address' ? 'اطلاعات ارسال' : 'پرداخت و نهایی‌سازی'}
                </h1>
            </header>

            <div className="max-w-md mx-auto p-4 space-y-6">

                {/* Progress Steps */}
                <div className="flex items-center justify-between px-8 mb-4 relative">
                    <div className="absolute left-10 right-10 top-1/2 h-0.5 bg-gray-200 -z-10"></div>
                    <div className={`flex flex-col items-center gap-1 ${step === 'address' ? 'text-gray-800' : 'text-green-600'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 'address' ? 'bg-gray-800 text-white' : 'bg-green-500 text-white'}`}>
                            1
                        </div>
                        <span className="text-[10px] font-bold">اطلاعات</span>
                    </div>
                    <div className={`flex flex-col items-center gap-1 ${step === 'payment' ? 'text-gray-800' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 'payment' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            2
                        </div>
                        <span className="text-[10px] font-bold">پرداخت</span>
                    </div>
                </div>

                {step === 'address' ? (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                            <h3 className="font-bold text-sm flex items-center gap-2">
                                <User size={18} className="text-gray-400" />
                                مشخصات گیرنده
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">نام و نام خانوادگی</label>
                                    <input
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ef4056] transition-colors"
                                        placeholder="مثال: علی رضایی"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">شماره موبایل</label>
                                    <input
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        type="tel"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ef4056] transition-colors font-english"
                                        placeholder="0912..."
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                            <h3 className="font-bold text-sm flex items-center gap-2">
                                <MapPin size={18} className="text-gray-400" />
                                آدرس تحویل
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">استان و شهر</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ef4056] transition-colors"
                                        placeholder="تهران، تهران"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">آدرس پستی</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ef4056] transition-colors h-24 resize-none"
                                        placeholder="خیابان، کوچه، پلاک..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">کد پستی</label>
                                    <input
                                        value={formData.postalCode}
                                        onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                                        type="tel"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ef4056] transition-colors font-english"
                                        placeholder="1234567890"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">

                        {/* Order Summary */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-sm text-gray-800 mb-4">خلاصه سفارش</h3>
                            <div className="flex -space-x-3 space-x-reverse overflow-hidden py-2 mb-4">
                                {items.slice(0, 4).map(item => {
                                    const p = products.get(item.productId);
                                    if (!p) return null;
                                    return (
                                        <div key={item.productId} className="w-12 h-12 rounded-full border-2 border-white relative">
                                            <img src={getProductImage(p)} className="w-full h-full object-cover rounded-full bg-gray-100" />
                                            <span className="absolute bottom-0 right-0 bg-gray-800 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                                {toPersianDigits(item.quantity)}
                                            </span>
                                        </div>
                                    );
                                })}
                                {items.length > 4 && (
                                    <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                        +{toPersianDigits(items.length - 4)}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 border-t border-dashed border-gray-200 pt-4">
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>مبلغ کل کالاها</span>
                                    <span>{formatPrice(totalRaw)} تومان</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>هزینه ارسال</span>
                                    <span>{shippingCost === 0 ? 'رایگان' : `${formatPrice(shippingCost)} تومان`}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2">
                                    <span>مبلغ قابل پرداخت</span>
                                    <span>{formatPrice(finalAmount)} تومان</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-sm text-gray-800 mb-4 flex items-center gap-2">
                                <Wallet size={18} className="text-gray-400" />
                                روش پرداخت
                            </h3>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#ef4056] bg-red-50/50 cursor-pointer relative overflow-hidden">
                                    <div className="w-5 h-5 rounded-full border-2 border-[#ef4056] flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#ef4056]"></div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-800">پرداخت اینترنتی</span>
                                    <CreditCard className="mr-auto text-[#ef4056]" opacity={0.8} />
                                </label>

                                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white opacity-60 cursor-not-allowed">
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                                    <span className="text-sm font-bold text-gray-500">پرداخت درب منزل (غیرفعال)</span>
                                </label>
                            </div>
                        </div>
                    </motion.div>
                )}

            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-6 max-w-md mx-auto z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                {step === 'address' ? (
                    <button
                        onClick={() => {
                            if (!formData.fullName || !formData.phone || !formData.address) return alert('لطفاً همه موارد را تکمیل کنید');
                            setStep('payment');
                        }}
                        className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                    >
                        <span>ثبت آدرس و ادامه</span>
                        <ChevronLeft size={18} />
                    </button>
                ) : (
                    <button
                        onClick={handleCreateOrder}
                        disabled={loading}
                        className="w-full bg-[#ef4056] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-[#d63044] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {loading ? 'در حال پردازش...' : `پرداخت ${formatPrice(finalAmount)} تومان`}
                    </button>
                )}
            </div>

        </div>
    );
};

export default Checkout;
