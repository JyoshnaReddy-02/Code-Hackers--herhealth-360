import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Sparkles, AlertCircle, ArrowLeft, KeyRound, Eye, EyeOff, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, admin, adminLogin, openAuthModal } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUserAccount, setIsUserAccount] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged in as admin, redirect to admin dashboard
  useEffect(() => {
    if (role === 'admin' && admin) {
      navigate('/admin/dashboard');
    }
  }, [role, admin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUserAccount(false);
    setLoading(true);
    try {
      await adminLogin(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Administrator authentication failed. Please check credentials.';
      setError(msg);
      if (err.data?.is_user_account || msg.includes('User (Public Portal)')) {
        setIsUserAccount(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsUserAccount(false);
    setLoading(true);
    try {
      await adminLogin('admin@herhealth360.internal', 'AdminMaster2026!');
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError('Admin demo authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToUserPortal = () => {
    navigate('/');
    openAuthModal('login');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#E8DFD8] overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-6 bg-gradient-to-br from-[#1C171A] via-[#2B232A] to-[#1C171A] text-white">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#D5C7CE] hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to HerHealth 360</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
                Admin Portal
              </h1>
              <p className="text-xs text-[#D5C7CE]">Platform Management & Analytics Hub</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
              {isUserAccount && (
                <div className="pt-2 border-t border-red-200 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSwitchToUserPortal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8C3B5E] text-white font-bold text-xs hover:bg-[#722F4C] transition-colors cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Open User Portal Sign In &rarr;</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* One-click demo shortcut */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full p-3 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-[#2B232A] flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-xs group cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
            <span>One-Click Super Admin Demo Login</span>
          </button>

          <div className="flex items-center gap-2 text-center text-xs text-[#9B8F97]">
            <div className="flex-1 border-t border-[#E8DFD8]" />
            <span>or sign in with admin key</span>
            <div className="flex-1 border-t border-[#E8DFD8]" />
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#584F55] mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#9B8F97]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@herhealth360.internal"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5C7BE] bg-white focus:outline-hidden focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#584F55] mb-1">
                Admin Password / Master Key
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#9B8F97]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-[#D5C7BE] bg-white focus:outline-hidden focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#9B8F97] hover:text-[#584F55] transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white text-xs font-bold hover:opacity-95 transition-opacity disabled:opacity-50 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Verifying...' : 'Access Administrator Dashboard'}</span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleSwitchToUserPortal}
              className="text-xs text-[#8C3B5E] font-semibold hover:underline cursor-pointer"
            >
              Are you a user? Go to User Portal Sign In &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
