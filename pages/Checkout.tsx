
import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { db, Product, getProductImage } from '../db';
import { ArrowRight, MapPin, Phone, User, CreditCard, CheckCircle, Truck, ShieldCheck, ChevronLeft, Wallet, AlertCircle } from 'lucide-react';
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
            <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center font-persian p-6 text-center" dir="rtl">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-100"
                >
                    <CheckCircle size={48} className="text-green-500" />
                </motion.div>
                <h1 className="text-2xl font-black text-gray-800 mb-3">سفارش شما ثبت شد!</h1>
                <p className="text-gray-500 text-sm mb-8 leading-7 max-w-xs mx-auto">
                    از خرید شما سپاسگزاریم. سفارش شما با موفقیت ثبت شد و به زودی پردازش خواهد شد.
                </p>
                <button
                    onClick={() => navigate('/shop')}
                    className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg"
                >
                    بازگشت به فروشگاه
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[#f3f4f6] min-h-[100dvh] pb-40 font-persian" dir="rtl">

            {/* Header */}
            <header className="bg-white/90 backdrop-blur-md px-4 py-4 sticky top-0 z-30 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex items-center gap-3">
                <button onClick={() => step === 'address' ? navigate('/cart') : setStep('address')} className="p-2.5 hover:bg-gray-50 rounded-full transition-colors active:bg-gray-100">
                    <ArrowRight size={22} className="text-gray-800" />
                </button>
                <h1 className="font-black text-lg text-gray-800">
                    {step === 'address' ? 'اطلاعات ارسال' : 'پرداخت و نهایی‌سازی'}
                </h1>
            </header>

            <div className="max-w-lg mx-auto p-4 space-y-6">

                {/* Progress Steps */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center justify-between px-4 relative">
                        <div className="absolute left-10 right-10 top-1/2 h-1 bg-gray-100 -z-10 rounded-full">
                            <div
                                className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
                                style={{ width: step === 'payment' ? '100%' : '0%' }}
                            />
                        </div>

                        <div className={`flex flex-col items-center gap-2 transition-colors duration-300 ${step === 'address' ? 'text-gray-900' : 'text-green-600'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-300 ${step === 'address' ? 'bg-gray-900 text-white scale-110' : 'bg-green-500 text-white'}`}>
                                {step === 'payment' ? <CheckCircle size={18} /> : '1'}
                            </div>
                            <span className="text-[11px] font-bold">اطلاعات</span>
                        </div>

                        <div className={`flex flex-col items-center gap-2 transition-colors duration-300 ${step === 'payment' ? 'text-gray-900' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-300 ${step === 'payment' ? 'bg-gray-900 text-white scale-110' : 'bg-gray-100 text-gray-400'}`}>
                                2
                            </div>
                            <span className="text-[11px] font-bold">پرداخت</span>
                        </div>
                    </div>
                </div>

                {step === 'address' ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-5">
                            <h3 className="font-extrabold text-gray-800 flex items-center gap-2.5 text-base">
                                <div className="p-2 bg-blue-50 rounded-xl text-blue-500">
                                    <User size={20} />
                                </div>
                                مشخصات گیرنده
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 mr-1">نام و نام خانوادگی</label>
                                    <input
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        type="text"
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-4 text-sm transition-all outline-none"
                                        placeholder="مثال: علی رضایی"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 mr-1">شماره موبایل</label>
                                    <input
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        type="tel"
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-4 text-sm transition-all outline-none font-english text-left"
                                        placeholder="0912..."
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-5">
                            <h3 className="font-extrabold text-gray-800 flex items-center gap-2.5 text-base">
                                <div className="p-2 bg-rose-50 rounded-xl text-rose-500">
                                    <MapPin size={20} />
                                </div>
                                آدرس تحویل
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 mr-1">استان و شهر</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-2xl px-5 py-4 text-sm transition-all outline-none"
                                        placeholder="تهران، تهران"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 mr-1">آدرس پستی</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-2xl px-5 py-4 text-sm transition-all outline-none h-28 resize-none leading-6"
                                        placeholder="خیابان، کوچه، پلاک..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 mr-1">کد پستی</label>
                                    <input
                                        value={formData.postalCode}
                                        onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                                        type="tel"
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-2xl px-5 py-4 text-sm transition-all outline-none font-english text-left"
                                        placeholder="1234567890"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                        {/* Order Summary */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h3 className="font-extrabold text-gray-800 mb-6 flex items-center gap-2">
                                <ShieldCheck size={20} className="text-gray-400" />
                                خلاصه سفارش
                            </h3>

                            <div className="flex -space-x-4 space-x-reverse overflow-x-auto py-2 mb-6 px-1 no-scrollbar">
                                {items.map(item => {
                                    const p = products.get(item.productId);
                                    if (!p) return null;
                                    return (
                                        <div key={item.productId} className="w-14 h-14 shrink-0 rounded-2xl border-4 border-white relative shadow-md">
                                            <img src={getProductImage(p)} className="w-full h-full object-cover rounded-xl bg-gray-50" />
                                            <span className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm font-bold">
                                                {toPersianDigits(item.quantity)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-3 border-t border-dashed border-gray-200 pt-5">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>مبلغ کل کالاها</span>
                                    <span className="font-bold">{formatPrice(totalRaw)} <span className="text-[10px] font-normal">تومان</span></span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>هزینه ارسال</span>
                                    {shippingCost === 0 ? (
                                        <span className="font-bold text-green-600 flex items-center gap-1">
                                            رایگان <Truck size={14} />
                                        </span>
                                    ) : (
                                        <span className="font-bold">{formatPrice(shippingCost)} <span className="text-[10px] font-normal">تومان</span></span>
                                    )}
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4 mt-2 flex justify-between items-center">
                                    <span className="text-sm font-extrabold text-gray-900">مبلغ قابل پرداخت</span>
                                    <span className="text-xl font-black text-gray-900">{formatPrice(finalAmount)} <span className="text-xs font-bold text-gray-500">تومان</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h3 className="font-extrabold text-gray-800 mb-5 flex items-center gap-2">
                                <Wallet size={20} className="text-gray-400" />
                                روش پرداخت
                            </h3>

                            <div className="space-y-3">
                                <label className="flex items-center gap-4 p-5 rounded-2xl border-2 border-[#ef4056] bg-red-50/30 cursor-pointer relative overflow-hidden transition-transform active:scale-[0.98]">
                                    <div className="w-6 h-6 rounded-full border-[6px] border-[#ef4056] bg-white shadow-sm"></div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900">پرداخت اینترنتی</span>
                                        <span className="text-[10px] text-gray-500 font-bold mt-0.5">با کلیه کارت‌های بانکی عضو شتاب</span>
                                    </div>
                                    <CreditCard className="mr-auto text-[#ef4056] opacity-80" size={24} />
                                </label>

                                <label className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed grayscale">
                                    <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-500">پرداخت درب منزل</span>
                                        <span className="text-[10px] text-gray-400 font-bold mt-0.5">فعلاً در دسترس نیست</span>
                                    </div>
                                    <Wallet className="mr-auto text-gray-400" size={24} />
                                </label>
                            </div>
                        </div>

                        {/* Security Note */}
                        <div className="flex items-start gap-2 bg-blue-50/50 p-4 rounded-2xl text-blue-600 text-xs leading-5">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <p>پرداخت شما در درگاه امن بانکی انجام می‌شود و اطلاعات کارت شما نزد ما ذخیره نخواهد شد.</p>
                        </div>
                    </motion.div>
                )}

            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 p-5 pb-8 lg:pb-5 max-w-md mx-auto z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
                {step === 'address' ? (
                    <button
                        onClick={() => {
                            if (!formData.fullName || !formData.phone || !formData.address) return alert('لطفاً همه موارد را تکمیل کنید');
                            setStep('payment');
                        }}
                        className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-gray-200"
                    >
                        <span>ثبت آدرس و ادامه</span>
                        <ChevronLeft size={20} />
                    </button>
                ) : (
                    <button
                        onClick={handleCreateOrder}
                        disabled={loading}
                        className="w-full bg-[#ef4056] text-white py-4 rounded-2xl font-bold shadow-xl shadow-red-200 hover:bg-[#d63044] transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {loading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>در حال پردازش...</span>
                            </>
                        ) : (
                            <>
                                <span>پرداخت نهایی</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded-lg text-sm">{formatPrice(finalAmount)}</span>
                            </>
                        )}
                    </button>
                )}
            </div>

        </div>
    );
};

export default Checkout;

