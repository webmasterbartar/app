
import React, { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { db, Product, getProductImage } from '../db';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, Receipt, Ticket, ShieldCheck, Truck, ChevronLeft, CreditCard } from 'lucide-react';
import { toPersianDigits, formatPrice } from '../utils/persianUtils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Cart: React.FC = () => {
    const { items, addToCart, removeFromCart, decrementFromCart } = useCart();
    const [products, setProducts] = useState<Map<number, Product>>(new Map());
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            const pMap = new Map<number, Product>();
            for (const item of items) {
                const p = await db.products.get(item.productId);
                if (p) pMap.set(item.productId, p);
            }
            setProducts(pMap);
            setIsLoading(false);
        };
        loadProducts();
    }, [items]);

    // Calculate Totals
    const { totalRaw, totalDiscount, payable } = items.reduce((acc, item) => {
        const p = products.get(item.productId);
        if (!p) return acc;

        // Fallback: if original_price is missing or lower than price, use price
        const original = (p.original_price && p.original_price > p.price) ? p.original_price : p.price;
        const current = p.price;

        acc.totalRaw += original * item.quantity;
        acc.totalDiscount += (original - current) * item.quantity;
        acc.payable += current * item.quantity;
        return acc;
    }, { totalRaw: 0, totalDiscount: 0, payable: 0 });

    const shippingCost = payable > 500000 ? 0 : 45000; // Free shipping over 500k
    const finalAmount = payable + shippingCost;

    if (!isLoading && items.length === 0) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center font-persian relative overflow-hidden" dir="rtl">
                <div className="absolute inset-0 pointer-events-none opacity-50">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-red-50 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl"></div>
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="w-40 h-40 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-8 relative"
                >
                    <ShoppingBag size={64} className="text-gray-300" strokeWidth={1.5} />
                    <div className="absolute -bottom-2 -right-2 bg-white p-3 rounded-2xl shadow-lg">
                        <span className="text-2xl">😕</span>
                    </div>
                </motion.div>

                <h2 className="text-xl font-black text-gray-800 mb-2">سبد خرید شما خالی است</h2>
                <p className="text-gray-400 text-sm mb-8 text-center max-w-[250px] leading-6">
                    به نظر می‌رسد هنوز کالایی انتخاب نکرده‌اید. پیشنهادهای ویژه ما را از دست ندهید!
                </p>

                <button
                    onClick={() => navigate('/shop')}
                    className="bg-[#ef4056] text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-red-200 hover:bg-[#d63044] transition-all active:scale-95 flex items-center gap-2"
                >
                    بازگشت به فروشگاه <ChevronLeft size={18} />
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[#f8f9fa] min-h-[100dvh] pb-48 font-persian" dir="rtl">

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md px-4 py-4 sticky top-0 z-30 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowRight size={22} className="text-gray-800" />
                    </button>
                    <div>
                        <h1 className="font-black text-lg text-gray-800">سبد خرید</h1>
                        <span className="text-[10px] text-gray-500 font-bold">{toPersianDigits(items.length)} کالا</span>
                    </div>
                </div>
                <button
                    className="text-red-500 text-xs font-bold bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                    onClick={() => {
                        // Ideally show a confirmation modal
                        items.forEach(i => removeFromCart(i.productId));
                    }}
                >
                    حذف همه
                </button>
            </header>

            <div className="p-4 space-y-6">

                {/* Cart Items List */}
                <div className="space-y-3">
                    <AnimatePresence>
                        {items.map(item => {
                            const product = products.get(item.productId);
                            if (!product) return null;
                            return (
                                <motion.div
                                    key={item.productId}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white p-3 rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex gap-3 group"
                                >
                                    {/* Image */}
                                    <div
                                        className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden shrink-0 cursor-pointer"
                                        onClick={() => navigate(`/product/${product.id}`)}
                                    >
                                        <img src={getProductImage(product)} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" alt={product.title} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <h3
                                                className="text-xs font-bold text-gray-800 line-clamp-2 leading-5 mb-1 cursor-pointer"
                                                onClick={() => navigate(`/product/${product.id}`)}
                                            >
                                                {product.title}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                                                    <ShieldCheck size={10} />
                                                    <span>گارانتی اصالت</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                                                    <Truck size={10} />
                                                    <span>ارسال سریع</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-end justify-between mt-2">
                                            {/* Quantity Control */}
                                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-1.5 py-1 border border-gray-100">
                                                <button
                                                    onClick={() => addToCart(product.id)}
                                                    className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-gray-700 shadow-sm active:scale-90 transition-transform border border-gray-100"
                                                >
                                                    <Plus size={14} strokeWidth={2.5} />
                                                </button>
                                                <span className="font-black text-sm w-4 text-center text-gray-800">{toPersianDigits(item.quantity)}</span>
                                                <button
                                                    onClick={() => decrementFromCart(product.id)}
                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-sm active:scale-90 transition-transform border border-gray-100 ${item.quantity === 1 ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white text-gray-700'}`}
                                                >
                                                    {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} strokeWidth={2.5} />}
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <div className="flex flex-col items-end">
                                                {product.original_price && product.original_price > product.price && (
                                                    <span className="text-[10px] text-gray-400 line-through decoration-red-300">
                                                        {formatPrice(product.original_price * item.quantity)}
                                                    </span>
                                                )}
                                                <span className="font-black text-sm text-gray-800">
                                                    {formatPrice(product.price * item.quantity)} <span className="text-[10px] font-medium text-gray-500">تومان</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Coupon Section */}
                <div className="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
                            <Ticket size={16} className="text-[#ef4056]" />
                            کد تخفیف دارید؟
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="کد تخفیف را وارد کنید"
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#ef4056] transition-colors"
                        />
                        <button className="bg-gray-800 text-white px-4 rounded-xl text-xs font-bold">ثبت</button>
                    </div>
                </div>

                {/* Bill Summary */}
                <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 space-y-3">
                    <h3 className="font-bold text-sm text-gray-800 mb-2 flex items-center gap-2">
                        <Receipt size={18} className="text-gray-400" />
                        جزئیات صورت‌حساب
                    </h3>

                    <div className="flex justify-between items-center text-xs text-gray-600">
                        <span>قیمت کالاها ({toPersianDigits(items.length)})</span>
                        <span className="font-bold">{formatPrice(totalRaw)} تومان</span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-[#ef4056]">
                        <span>سود شما از خرید</span>
                        <span className="font-bold">({toPersianDigits(Math.round((totalDiscount / totalRaw) * 100))}٪) {formatPrice(totalDiscount)} تومان</span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-600">
                        <span>هزینه ارسال</span>
                        {shippingCost === 0 ? (
                            <span className="font-bold text-green-600">رایگان</span>
                        ) : (
                            <span className="font-bold">{formatPrice(shippingCost)} تومان</span>
                        )}
                    </div>

                    <div className="border-t border-dashed border-gray-200 my-2 pt-3 flex justify-between items-center">
                        <span className="font-bold text-sm text-gray-800">جمع کل قابل پرداخت</span>
                        <span className="font-black text-lg text-gray-900">{formatPrice(finalAmount)} <span className="text-xs font-normal text-gray-500">تومان</span></span>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2 px-2">
                    <div className="flex flex-col items-center gap-1 text-center opacity-60">
                        <ShieldCheck size={20} className="text-gray-500" />
                        <span className="text-[9px] font-bold text-gray-500">تضیمن اصالت</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-center opacity-60">
                        <Truck size={20} className="text-gray-500" />
                        <span className="text-[9px] font-bold text-gray-500">ارسال سریع</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-center opacity-60">
                        <CreditCard size={20} className="text-gray-500" />
                        <span className="text-[9px] font-bold text-gray-500">پرداخت امن</span>
                    </div>
                </div>

            </div>

            {/* Sticky Footer - Adjusted for Bottom Nav (60px) */}
            <div className="fixed bottom-[60px] left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 p-5 pb-5 max-w-md mx-auto z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
                <button
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-[#ef4056] text-white py-4 rounded-2xl font-bold shadow-xl shadow-red-200 hover:bg-[#d63044] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <span>ادامه فرآیند خرید</span>
                    <ChevronLeft size={18} className="bg-white/20 rounded-full p-0.5" />
                </button>
            </div>
        </div>
    );
};

export default Cart;
