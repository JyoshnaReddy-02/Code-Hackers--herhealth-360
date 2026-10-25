import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  Calendar,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, login, register, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(authModalMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [dob, setDob] = useState('');
  const [lifeStage, setLifeStage] = useState('reproductive');

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setMode(authModalMode);
    setError(null);
    setSuccessMsg(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setError('Please provide a valid email address.');
      return;
    }

    if (cleanPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if ((mode === 'register' || mode === 'reset') && cleanPassword !== confirmPassword.trim()) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(cleanEmail, cleanPassword);
      } else if (mode === 'register') {
        await register({
          email: cleanEmail,
          password: cleanPassword,
          display_name: displayName.trim(),
          date_of_birth: dob || undefined,
          life_stage: lifeStage,
        });
      } else if (mode === 'reset') {
        await resetPassword(cleanEmail, cleanPassword);
      }
    } catch (err: any) {
      const msg = err.message || 'An error occurred during authentication.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoUserLogin = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      await login('demo@herhealth360.internal', 'HerHealthDemo2026!');
    } catch (err: any) {
      setError('User demo login failed. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={closeAuthModal}
    >
      <div
        className="w-full max-w-md bg-[#FDFBF7] rounded-3xl shadow-2xl border border-[#E8DFD8] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 pb-4 border-b border-[#E8DFD8] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8C3B5E] to-[#C86D51] flex items-center justify-center text-white text-xs font-bold shadow-xs">
              HH
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2B232A]">
                {mode === 'login'
                  ? 'User Portal Sign In'
                  : mode === 'register'
                  ? 'Create Your User Account'
                  : 'Reset User Password'}
              </h3>
              <p className="text-[11px] text-[#7A7177]">
                {mode === 'login'
                  ? 'Access your private symptom diary, health passport & bookings'
                  : mode === 'register'
                  ? 'Organize every stage of your health journey privately'
                  : 'Choose a new 8+ character password to restore portal access'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-[#8A8187] hover:bg-[#F2E8E1] hover:text-[#2B232A] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Sign In vs Create Account vs Reset */}
        <div className="grid grid-cols-3 p-1 bg-[#F0E6DE] mx-5 mt-3 mb-2 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-1.5 rounded-lg transition-all ${
              mode === 'login' ? 'bg-white text-[#8C3B5E] shadow-xs' : 'text-[#6D636B] hover:text-[#2B232A]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-1.5 rounded-lg transition-all ${
              mode === 'register' ? 'bg-white text-[#8C3B5E] shadow-xs' : 'text-[#6D636B] hover:text-[#2B232A]'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('reset');
              setError(null);
            }}
            className={`py-1.5 rounded-lg transition-all ${
              mode === 'reset' ? 'bg-white text-[#8C3B5E] shadow-xs' : 'text-[#6D636B] hover:text-[#2B232A]'
            }`}
          >
            Reset Password
          </button>
        </div>

        {/* User Demo Fast Login Shortcut (only on login mode) */}
        {mode === 'login' && (
          <div className="px-5 pb-1">
            <button
              type="button"
              onClick={handleDemoUserLogin}
              disabled={loading}
              className="w-full py-2 px-3 text-xs font-medium rounded-xl border border-[#C86D51]/30 bg-gradient-to-r from-[#FAF2ED] to-[#F5ECE8] text-[#8C3B5E] hover:border-[#8C3B5E] flex items-center justify-center gap-2 transition-all group cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C86D51] group-hover:scale-110 transition-transform" />
              <span>One-Click Demo Login (User: Priya Sharma)</span>
            </button>
          </div>
        )}

        <div className="px-5 py-1.5 flex items-center gap-2 text-center text-xs text-[#9B8F97]">
          <div className="flex-1 border-t border-[#E8DFD8]" />
          <span>
            {mode === 'login'
              ? 'or sign in with your account'
              : mode === 'register'
              ? 'create your private profile'
              : 'set a new password'}
          </span>
          <div className="flex-1 border-t border-[#E8DFD8]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 pt-1 space-y-3">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-1.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
              {mode === 'login' && error.toLowerCase().includes('invalid') && (
                <div className="pl-6 pt-1 text-[11px] text-red-600 flex items-center gap-2">
                  <span>Forgot what you typed?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setError(null);
                    }}
                    className="font-bold underline hover:text-red-800 cursor-pointer"
                  >
                    Reset your password here &rarr;
                  </button>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Full Name (Registration only) */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#584F55] mb-1">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-[#9B8F97]" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Jyoshna"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5C7BE] bg-white focus:outline-hidden focus:border-[#8C3B5E] focus:ring-1 focus:ring-[#8C3B5E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#584F55] mb-1">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-[#9B8F97]" />
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5C7BE] bg-white focus:outline-hidden focus:border-[#8C3B5E]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#584F55] mb-1">Life Stage</label>
                  <select
                    value={lifeStage}
                    onChange={(e) => setLifeStage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7BE] bg-white focus:outline-hidden focus:border-[#8C3B5E]"
                  >
                    <option value="puberty">Adolescence / Puberty</option>
                    <option value="reproductive">Reproductive Age</option>
                    <option value="pregnancy_postpartum">Pregnancy / Postpartum</option>
                    <option value="perimenopause_menopause">Perimenopause / Menopause</option>
                    <option value="general_wellness">General Wellness</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-[#584F55] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#9B8F97]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5C7BE] bg-white focus:outline-hidden focus:border-[#8C3B5E] focus:ring-1 focus:ring-[#8C3B5E]"
              />
            </div>
          </div>

          {/* Password with Eye Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#584F55]">
                {mode === 'reset' ? 'New Password' : 'Password'}
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('reset');
                    setError(null);
                  }}
                  className="text-[11px] text-[#8C3B5E] hover:underline font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#9B8F97]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'login' ? '••••••••' : 'Minimum 8 characters'}
                className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-[#D5C7BE] bg-white focus:outline-hidden focus:border-[#8C3B5E] focus:ring-1 focus:ring-[#8C3B5E]"
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

          {/* Confirm Password (for register and reset) */}
          {(mode === 'register' || mode === 'reset') && (
            <div>
              <label className="block text-xs font-semibold text-[#584F55] mb-1">
                {mode === 'reset' ? 'Confirm New Password' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#9B8F97]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password to verify"
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-[#D5C7BE] bg-white focus:outline-hidden focus:border-[#8C3B5E] focus:ring-1 focus:ring-[#8C3B5E]"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-[#9B8F97] hover:text-[#584F55] transition-colors cursor-pointer"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#8C3B5E] to-[#C86D51] text-white hover:opacity-95 transition-opacity disabled:opacity-50 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            {loading ? (
              'Processing...'
            ) : mode === 'login' ? (
              <>
                <span>Sign in as User</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : mode === 'register' ? (
              <>
                <span>Create User Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <KeyRound className="w-3.5 h-3.5" />
                <span>Reset Password & Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Links to Separate Doctor and Admin Portals */}
        <div className="px-5 py-3 bg-[#FAF7F5] border-t border-[#E8DFD8] flex items-center justify-between text-[11px] text-[#7A7177]">
          <Link
            to="/doctor/login"
            onClick={closeAuthModal}
            className="text-[#8C3B5E] font-semibold hover:underline"
          >
            Doctor Portal &rarr;
          </Link>
          <Link
            to="/admin/login"
            onClick={closeAuthModal}
            className="text-[#7A7177] hover:text-[#2B232A] hover:underline"
          >
            Admin Access &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
