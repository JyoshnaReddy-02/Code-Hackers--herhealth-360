import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Heart,
  Lock,
  Mail,
  User as UserIcon,
  Calendar,
  Sparkles,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  Stethoscope,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UserLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role, user, login, register, resetPassword } = useAuth();

  const initialMode = (searchParams.get('mode') as 'login' | 'register' | 'reset') || 'login';
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [dob, setDob] = useState('');
  const [lifeStage, setLifeStage] = useState('reproductive');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in as a user, redirect to homepage or passport
  useEffect(() => {
    if (role === 'user' && user) {
      navigate('/passport');
    }
  }, [role, user, navigate]);

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
        navigate('/passport');
      } else if (mode === 'register') {
        await register({
          email: cleanEmail,
          password: cleanPassword,
          display_name: displayName.trim(),
          date_of_birth: dob || undefined,
          life_stage: lifeStage,
        });
        navigate('/passport');
      } else if (mode === 'reset') {
        await resetPassword(cleanEmail, cleanPassword);
        navigate('/passport');
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please verify your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      await login('demo@herhealth360.internal', 'HerHealthDemo2026!');
      navigate('/passport');
    } catch (err: any) {
      setError('Demo user login failed. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-[#E8DFD8] overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-6 bg-gradient-to-br from-[#8C3B5E] via-[#A0486D] to-[#C86D51] text-white">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to HerHealth 360</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white shadow-inner">
              <Heart className="w-6 h-6 fill-white/20" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
                {mode === 'login'
                  ? 'User Portal Sign In'
                  : mode === 'register'
                  ? 'Create Your User Account'
                  : 'Reset User Password'}
              </h1>
              <p className="text-xs text-white/85">
                {mode === 'login'
                  ? 'Access your private symptom tracker, health passport & bookings'
                  : mode === 'register'
                  ? 'Organize every stage of your health journey securely and privately'
                  : 'Restore portal access with a fresh 8+ character password'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Tab selector */}
          <div className="grid grid-cols-3 p-1 bg-[#F0E6DE] rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
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
              className={`py-2 rounded-lg transition-all ${
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
              className={`py-2 rounded-lg transition-all ${
                mode === 'reset' ? 'bg-white text-[#8C3B5E] shadow-xs' : 'text-[#6D636B] hover:text-[#2B232A]'
              }`}
            >
              Reset Password
            </button>
          </div>

          {/* Quick Demo Login */}
          {mode === 'login' && (
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full p-3 rounded-xl border border-[#C86D51]/30 bg-gradient-to-r from-[#FAF2ED] to-[#F5ECE8] text-[#8C3B5E] hover:border-[#8C3B5E] flex items-center justify-center gap-2 text-xs font-semibold transition-all group cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-[#C86D51] group-hover:scale-110 transition-transform" />
              <span>One-Click Demo Login (User: Priya Sharma)</span>
            </button>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
              {mode === 'login' && error.toLowerCase().includes('invalid') && (
                <div className="pl-6 pt-1 text-[11px] text-red-600 flex items-center gap-2">
                  <span>Need to set a new password?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setError(null);
                    }}
                    className="font-bold underline hover:text-red-800 cursor-pointer"
                  >
                    Reset your password now &rarr;
                  </button>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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

                <div className="grid grid-cols-2 gap-3">
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
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8C3B5E] to-[#C86D51] text-white text-xs font-bold hover:opacity-95 transition-opacity disabled:opacity-50 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                'Processing...'
              ) : mode === 'login' ? (
                <>
                  <span>Sign In to User Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'register' ? (
                <>
                  <span>Create User Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Update Password & Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Dedicated Portal Separators */}
          <div className="pt-4 border-t border-[#E8DFD8] flex items-center justify-between text-xs text-[#7A7177]">
            <Link
              to="/doctor/login"
              className="inline-flex items-center gap-1.5 text-[#8C3B5E] hover:underline font-semibold"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor Portal &rarr;</span>
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-purple-700 hover:underline font-semibold"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
