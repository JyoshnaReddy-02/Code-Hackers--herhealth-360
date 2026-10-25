import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Calendar,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DoctorNavbar: React.FC = () => {
  const { doctor, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/doctor/login');
  };

  const handleExitToPublicSite = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 bg-[#241C22]/95 backdrop-blur-md border-b border-[#3D3039] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link to="/doctor/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8C3B5E] to-[#C86D51] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105 shrink-0">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold tracking-tight text-white whitespace-nowrap">
                  HerHealth <span className="text-[#E07E63]">360</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 whitespace-nowrap">
                  Clinician Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Clinician Nav Links */}
          {doctor && (
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium">
              <Link
                to="/doctor/dashboard"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                  isActive('/doctor/dashboard')
                    ? 'bg-rose-500/20 text-rose-200 font-semibold border border-rose-500/30'
                    : 'text-[#C9BFC5] hover:text-white hover:bg-white/5'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-[#E07E63]" />
                <span>Consultation Workspace & Slots</span>
              </Link>
            </nav>
          )}

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {doctor ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-left">
                  <div className="w-7 h-7 rounded-full bg-[#8C3B5E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {doctor.name.charAt(0)}
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs font-semibold text-white truncate max-w-[130px]">{doctor.name}</p>
                    <p className="text-[10px] text-rose-300 truncate max-w-[130px]">{doctor.specialty}</p>
                  </div>
                </div>

                <button
                  onClick={handleExitToPublicSite}
                  className="hidden md:flex items-center gap-1 px-3 py-1.5 text-xs text-[#C9BFC5] hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-white/10 cursor-pointer"
                  title="Sign out of Clinician Portal and browse public user site"
                >
                  <span>Exit to Public Site</span>
                  <ExternalLink className="w-3 h-3 text-[#A89FA4]" />
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 border border-rose-700/50 transition-colors cursor-pointer"
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
                  Back to User Site &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
