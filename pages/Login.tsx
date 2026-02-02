
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signIn } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Get the page user was trying to access
    const from = (location.state as any)?.from || '/shop';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await signIn(formData.email, formData.password);

        if (error) {
            setError(error.message === 'Invalid login credentials'
                ? 'ایمیل یا رمز عبور اشتباه است'
                : 'خطا در ورود به حساب کاربری');
            setLoading(false);
        } else {
            // Redirect to intended page or shop
            navigate(from, { replace: true });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 font-persian" dir="rtl">

            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-red-100 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-[#ef4056] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-200">
                        <span className="text-3xl">🛍️</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">خوش آمدید!</h1>
                    <p className="text-gray-500 text-sm">برای ادامه وارد حساب کاربری خود شوید</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">

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

                        {/* Email Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2 mr-1">ایمیل</label>
                            <div className="relative">
                                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#ef4056] focus:bg-white rounded-2xl pr-12 pl-5 py-4 text-sm transition-all outline-none font-english text-left"
                                    placeholder="example@email.com"
                                    dir="ltr"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2 mr-1">رمز عبور</label>
                            <div className="relative">
                                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#ef4056] focus:bg-white rounded-2xl pr-12 pl-5 py-4 text-sm transition-all outline-none"
                                    placeholder="رمز عبور خود را وارد کنید"
                                    required
                                />
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="text-left">
                            <Link to="/forgot-password" className="text-xs text-[#ef4056] font-bold hover:underline">
                                رمز عبور را فراموش کرده‌اید؟
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ef4056] text-white py-4 rounded-2xl font-bold shadow-xl shadow-red-200 hover:bg-[#d63044] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                        >
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>در حال ورود...</span>
                                </>
                            ) : (
                                <>
                                    <span>ورود به حساب</span>
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

                    {/* Sign Up Link */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            حساب کاربری ندارید؟{' '}
                            <Link to="/signup" className="text-[#ef4056] font-bold hover:underline">
                                ثبت‌نام کنید
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

export default Login;
