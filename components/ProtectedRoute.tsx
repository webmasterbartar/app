import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const PageLoader: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
        >
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#ef4056] rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500 font-persian">در حال بارگذاری...</p>
        </motion.div>
    </div>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <PageLoader />;
    }

    if (!user) {
        // Redirect to login, but save the attempted URL
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
