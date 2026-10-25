import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  BarChart3,
  Users,
  HelpCircle,
  Dumbbell,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminNavbar: React.FC = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handleExitToPublicSite = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 bg-[#161118]/95 backdrop-blur-md border-b border-[#2E2435] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-700 to-indigo-700 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold tracking-tight text-white whitespace-nowrap">
                  HerHealth <span className="text-purple-400">360</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 whitespace-nowrap">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* Admin Nav Links */}
          {admin && (
            <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                  isActive('/admin/dashboard')
                    ? 'bg-purple-500/20 text-purple-200 font-semibold border border-purple-500/30'
                    : 'text-[#C5BAC9] hover:text-white hover:bg-white/5'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                <span>Executive Management & Analytics</span>
              </Link>
            </nav>
          )}

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {admin ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-left">
                  <div className="w-7 h-7 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs font-semibold text-white truncate max-w-[130px]">
                      {admin.display_name || admin.name}
                    </p>
                    <span className="text-[10px] text-purple-300">Super Administrator</span>
                  </div>
                </div>

                <button
                  onClick={handleExitToPublicSite}
                  className="hidden md:flex items-center gap-1 px-3 py-1.5 text-xs text-[#C5BAC9] hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-white/10 cursor-pointer"
                  title="Sign out of Admin Console and browse public user site"
                >
                  <span>Exit to Public Site</span>
                  <ExternalLink className="w-3 h-3 text-[#9A8EA0]" />
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-900/40 hover:bg-red-900/60 text-red-200 border border-red-700/50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/"
                  className="px-3 py-1.5 text-xs text-[#D8CFD4] hover:text-white transition-colors"
                >
                  Back to Public Site &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
