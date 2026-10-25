import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Heart,
  Activity,
  BookOpen,
  Sparkles,
  UserCheck,
  Baby,
  BarChart3,
  FileText,
  AlertCircle,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  Stethoscope,
  Dumbbell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenEmergency: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenEmergency }) => {
  const { user, doctor, admin, role, logout, openAuthModal } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/', icon: Heart },
    { name: 'Library', path: '/library', icon: BookOpen },
    { name: 'Tracker', path: '/tracker', icon: Activity },
    { name: 'Navigator', path: '/navigator', icon: Sparkles },
    { name: 'Doctors', path: '/doctors', icon: UserCheck },
    { name: 'MotherCare', path: '/mothercare', icon: Baby },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Passport', path: '/passport', icon: FileText },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E8DFD8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8C3B5E] to-[#C86D51] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105 shrink-0">
              <Heart className="w-4 h-4 fill-white/20" />
            </div>
            <div className="shrink-0">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#2B232A] group-hover:text-[#8C3B5E] transition-colors whitespace-nowrap">
                HerHealth <span className="text-[#C86D51]">360</span>
              </span>
              <p className="hidden 2xl:block text-[10px] font-medium text-[#7A7177] tracking-wider uppercase whitespace-nowrap">
                Every stage of her health
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    active
                      ? 'bg-[#F2E8E1] text-[#8C3B5E] font-semibold'
                      : 'text-[#584F55] hover:text-[#2B232A] hover:bg-[#F8F1EB]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#8C3B5E]' : 'text-[#8A8187]'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Urgent Care / Emergency Button */}
            <button
              onClick={onOpenEmergency}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors shadow-xs"
              title="Urgent Healthcare Guidance & Emergency Contacts"
            >
              <AlertCircle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              <span>Emergency (112)</span>
            </button>

            {/* Dedicated Doctor Portal Button */}
            <Link
              to="/doctor/login"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 transition-colors text-xs font-semibold shadow-2xs"
              title="Clinician Workspace & Slot Management"
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#8C3B5E]" />
              <span>Doctor Portal</span>
            </Link>

            {/* Dedicated Admin Portal Button */}
            <Link
              to="/admin/login"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-300 bg-purple-50 text-purple-800 hover:bg-purple-100 transition-colors text-xs font-semibold shadow-2xs"
              title="Administrator Intelligence Hub & User Statistics"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
              <span>Admin Portal</span>
            </Link>

            {/* Public / Regular User Authentication Area */}
            {role === 'user' && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E3D7CF] bg-white hover:bg-[#FDFBF7] transition-all text-left cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#8C3B5E] text-white flex items-center justify-center font-bold text-xs">
                    {user.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-xs">
                    <p className="font-semibold text-[#2B232A] leading-tight truncate max-w-[120px]">
                      {user.display_name}
                    </p>
                    <span className="text-[10px] text-[#8C3B5E] capitalize">
                      {user.life_stage ? user.life_stage.replace('_', ' ') : 'Member'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8A8187]" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-[#E8DFD8] shadow-lg py-2 z-50"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#F0E6DE]">
                      <p className="text-xs font-semibold text-[#2B232A] truncate">{user.display_name}</p>
                      <p className="text-[11px] text-[#7A7177] truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F2E8E1] text-[#8C3B5E] capitalize">
                        {user.life_stage ? user.life_stage.replace('_', ' ') : 'Member'}
                      </span>
                    </div>

                    <Link
                      to="/tracker"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#584F55] hover:bg-[#FBF6F3]"
                    >
                      <Activity className="w-4 h-4 text-[#8C3B5E]" />
                      My Symptom History
                    </Link>

                    <Link
                      to="/passport"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#584F55] hover:bg-[#FBF6F3]"
                    >
                      <FileText className="w-4 h-4 text-[#C86D51]" />
                      Health Passport
                    </Link>

                    <div className="border-t border-[#F0E6DE] my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#8C3B5E] hover:bg-[#F2E8E1] rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>User Sign In</span>
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#8C3B5E] to-[#C86D51] hover:opacity-95 rounded-lg shadow-xs transition-opacity shrink-0 cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              onClick={onOpenEmergency}
              className="p-1.5 rounded-lg text-red-600 bg-red-50 sm:hidden"
              title="Emergency Help"
            >
              <AlertCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#584F55] hover:bg-[#F2E8E1] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#FDFBF7] border-b border-[#E8DFD8] px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2 pt-2 pb-3 border-b border-[#E8DFD8]">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium ${
                    active ? 'bg-[#F2E8E1] text-[#8C3B5E] font-semibold' : 'text-[#584F55] hover:bg-[#F8F1EB]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#8C3B5E]" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {role === 'user' && user ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E3D7CF]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#8C3B5E] text-white flex items-center justify-center font-bold text-xs">
                    {user.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#2B232A]">{user.display_name}</p>
                    <p className="text-[10px] text-[#7A7177]">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="p-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('login');
                    }}
                    className="w-full py-2 text-xs font-medium border border-[#E3D7CF] rounded-lg text-[#584F55]"
                  >
                    User Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('register');
                    }}
                    className="w-full py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#8C3B5E] to-[#C86D51] rounded-lg"
                  >
                    Join Free
                  </button>
                </div>
                <Link
                  to="/doctor/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-xs font-semibold rounded-lg bg-rose-50 text-[#8C3B5E] border border-rose-200 flex items-center justify-center gap-1.5"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Clinician Portal Sign In</span>
                </Link>
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-xs font-semibold rounded-lg bg-purple-50 text-purple-800 border border-purple-200 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Console</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
