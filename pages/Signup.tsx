
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const { signUp } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const validateForm = () => {
        if (formData.fullName.length < 3) {
            setError('نام و نام خانوادگی باید حداقل ۳ حرف باشد');
            return false;
        }
        if (!/^09\d{9}$/.test(formData.phone)) {
            setError('شماره موبایل نامعتبر است');
            return false;
        }
        if (formData.password.length < 6) {
            setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('رمز عبور و تکرار آن یکسان نیستند');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);

        const { error } = await signUp(
            formData.email,
            formData.password,
            formData.phone,
            formData.fullName
        );

        if (error) {
            if (error.message.includes('already registered')) {
                setError('این ایمیل قبلاً ثبت شده است');
            } else {
                setError('خطا در ثبت‌نام. لطفاً دوباره تلاش کنید');
            }
            setLoading(false);
        } else {
            setSuccess(true);
            setTimeout(() => {
                navigate('/shop');
            }, 2000);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4 font-persian" dir="rtl">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                >
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-100">
                        <CheckCircle size={48} className="text-green-500" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-3">ثبت‌نام موفق!</h1>
                    <p className="text-gray-500 text-sm mb-6">حساب کاربری شما با موفقیت ایجاد شد</p>
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-[#ef4056] rounded-full animate-spin mx-auto"></div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 font-persian" dir="rtl">

            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#ef4056] to-[#d63044] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-200">
                        <span className="text-3xl">✨</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">عضویت در دیجی‌گرام</h1>
                    <p className="text-gray-500 text-sm">اطلاعات خود را وارد کنید</p>
                </div>

                {/* Signup Form */}
                <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Error Alert */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3"
                            >
                                <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 leading-6">{error}</p>
                            </motion.div>
                        )}

                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2 mr-1">نام و نام خانوادگی</label>
                            <div className="relative">
                                <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#ef4056] focus:bg-white rounded-2xl pr-12 pl-5 py-3.5 text-sm transition-all outline-none"
                                    placeholder="مثال: علی رضایی"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2 mr-1">ایمیل</label>
                            <div className="relative">
                                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#ef4056] focus:bg-white rounded-2xl pr-12 pl-5 py-3.5 text-sm transition-all outline-none font-english text-left"
                                    placeholder="example@email.com"
                                    dir="ltr"
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2 mr-1">شماره موبایل</label>
                            <div className="relative">
                                <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#ef4056] focus:bg-white rounded-2xl pr-12 pl-5 py-3.5 text-sm transition-all outline-none font-english text-left"
                                    placeholder="09123456789"
                                    dir="ltr"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2 mr-1">رمز عبور</label>
                            <div className="relative">
                                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#ef4056] focus:bg-white rounded-2xl pr-12 pl-5 py-3.5 text-sm transition-all outline-none"
                                    placeholder="حداقل ۶ کاراکتر"
                                    required
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2 mr-1">تکرار رمز عبور</label>
                            <div className="relative">
                                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#ef4056] focus:bg-white rounded-2xl pr-12 pl-5 py-3.5 text-sm transition-all outline-none"
                                    placeholder="رمز عبور را دوباره وارد کنید"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ef4056] text-white py-4 rounded-2xl font-bold shadow-xl shadow-red-200 hover:bg-[#d63044] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait mt-6"
                        >
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>در حال ثبت‌نام...</span>
                                </>
                            ) : (
                                <>
                                    <span>ثبت‌نام</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-white px-4 text-gray-500 font-bold">یا</span>
                        </div>
                    </div>

                    {/* Login Link */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            قبلاً ثبت‌نام کرده‌اید؟{' '}
                            <Link to="/login" className="text-[#ef4056] font-bold hover:underline">
                                وارد شوید
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Shop */}
                <div className="text-center mt-6">
                    <Link to="/shop" className="text-sm text-gray-500 hover:text-gray-700 font-bold inline-flex items-center gap-2">
                        <ArrowRight size={16} />
                        بازگشت به فروشگاه
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
