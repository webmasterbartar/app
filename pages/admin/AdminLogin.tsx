
import React, { useState } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, Info } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const { signIn } = useAdminAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Navigation is handled by the AuthContext state change or explicit nav
      // We'll rely on the useEffect in AdminLayout or just nav here
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-english">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#ef4056] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-900/20">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">DigiGram Store Management</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ef4056] transition-colors"
              placeholder="admin@digigram.store"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ef4056] transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-[#ef4056] hover:bg-[#d63044] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-900/20 mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
             <div className="inline-flex items-center gap-2 bg-gray-700/50 px-4 py-2 rounded-lg text-xs text-gray-400">
                <Info size={14} className="text-[#ef4056]" />
                <span>Demo: admin@digigram.store / admin123</span>
             </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
